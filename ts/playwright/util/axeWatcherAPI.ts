import axios, { AxiosResponse } from 'axios';
import 'dotenv/config';
import tokenManager from './tokenManager';
import logger from './logger';
import { testData } from '../resources/testData';
import playwright from 'playwright';

const API_URL = 'https://axe-qa.dequelabs.com/api/axe-watcher';

interface Project {
  name: string;
  project_id: string;
}

interface Branch {
  name: string;
  total_issues: number;
  page_states: number;
  axe_core_version?: string;
  data_source_version?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

interface TestDataValidation {
  issues: string;
  pageStates: string;
  accessibilityIssuesCount: number;
  dropdownAllPageStates?: string[];
}

/**
 * AxeWatcherAPI - Class for interacting with Axe Watcher API
 */
class AxeWatcherAPI {
  /**
   * Get Bearer Token (uses TokenManager for caching/refresh)
   */
  async getToken(): Promise<string> {
    const token = await tokenManager.getToken();
    return token;
  }

  /**
   * Get all projects
   */
  async getProjects(token: string): Promise<Project[]> {
    const url = `${API_URL}/projects`;
    
    const response: AxiosResponse<Project[]> = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  }

  /**
   * Find a project by name
   */
  findProject(projects: Project[], projectName: string): Project | undefined {
    const foundProject = projects.find(
      p => p.name === projectName || p.name.toLowerCase().includes(projectName.toLowerCase())
    );
    
    return foundProject;
  }

  /**
   * Get branches for a project
   */
  async getBranches(projectId: string, token: string, branch?: string): Promise<Branch[]> {
 // Wait 20 seconds before making the API call to allow API to sync
 logger.info('🕐 Starting 20 second wait before fetching branches...');
 await this.sleep(60000);
 logger.info('🕐 Wait completed, proceeding with API call...');
    // Reload the branches page in headed browser instead of waiting
    logger.info('🔄 Reloading branches page in headed browser...');
    const branchesUrl = `https://axe-qa.dequelabs.com/axe-watcher/projects/${projectId}/branches`;
    
    let browser: playwright.Browser | null = null;
    try {
      browser = await playwright.chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--ignore-ssl-errors']
      });
      
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      
      const page = await context.newPage();
      
      // Navigate to branches page with more lenient wait condition
      logger.info(`📍 Navigating to: ${branchesUrl}`);
      await page.goto(branchesUrl, { waitUntil: 'load', timeout: 60000 });
      
      // Wait for the page to be interactive
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      
      // Reload the page to trigger any processing
      logger.info('🔄 Reloading page...');
      await page.reload({ waitUntil: 'load', timeout: 60000 });
      
      // Wait for the page to be interactive after reload
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      
      // Wait a bit for any async operations to complete
      await page.waitForTimeout(3000);
      
      await page.close();
      await context.close();
      logger.info('✅ Page reload completed, proceeding with API call...');
    } catch (error: any) {
      logger.warn(`⚠️ Failed to reload page: ${error.message}. Continuing with API call...`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
    
    let url = `${API_URL}/v2/${projectId}/branches?`;
    const params: string[] = ['x-pagination-page=1', 'x-pagination-per-page=5'];

    if (branch) {
      params.push(`branch=${encodeURIComponent(branch)}`);
    }

    url += params.join('&');

    const response: AxiosResponse<Branch[]> = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-pagination-page': '1',
        'x-pagination-per-page': '5',
      },
    });

    return response.data;
  }

  /**
   * Validate branch data
   */
  validateBranch(branch: Branch, expectedName: string, maxIssues: number = 300): ValidationResult {
    const errors: string[] = [];

    if (branch.name !== expectedName) {
      errors.push(`Branch name: expected '${expectedName}', got '${branch.name}'`);
    }

    if (branch.total_issues > maxIssues) {
      errors.push(`Issues: ${branch.total_issues} exceeds max ${maxIssues}`);
    }

    if (!branch.page_states || branch.page_states < 1) {
      errors.push(`Page states: should be at least 1, got ${branch.page_states}`);
    }

    if (!branch.axe_core_version) {
      errors.push(`Missing: axe_core_version`);
    }

    if (!branch.hasOwnProperty('data_source_version')) {
      errors.push(`Missing: axe_watcher_version field`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Extract number from string like "(200) total issues" -> 200
   */
  extractNumberFromString(str: string): number {
    const match = str.match(/\((\d+)\)/);
    const result = match ? parseInt(match[1], 10) : 0;
    return result;
  }

  /**
   * Sleep/delay utility
   */
  sleep(ms: number): Promise<void> {
    const seconds = ms / 1000;
    logger.info(`⏳ Waiting ${seconds} seconds before API call...`);
    return new Promise(resolve => {
      setTimeout(() => {
        logger.info(`✅ Wait completed (${seconds} seconds)`);
        resolve();
      }, ms);
    });
  }

  /**
   * Verify page states and issues count against test data
   */
  async verifyPagestateIssuesCount(
    testDataKey: string = 'autoAnalyzeMode',
    projectName: string = 'automation_Playwright Test' 
  ): Promise<void> {
    logger.info('========== API Validation Starting ==========');

    const validationErrors: string[] = [];

    try {
      // Get expected values from test data
      const expectedData: TestDataValidation | undefined = testData.issuesPageStatesValidations[testDataKey as keyof typeof testData.issuesPageStatesValidations] as TestDataValidation;
      
      if (!expectedData) {
        const errorMsg = `❌ Test data key '${testDataKey}' not found in testData.issuesPageStatesValidations`;
        logger.error(errorMsg);
        validationErrors.push(errorMsg);
        throw new Error(errorMsg);
      }

      const expectedIssues = expectedData.accessibilityIssuesCount;
      const expectedPageStates = this.extractNumberFromString(expectedData.pageStates);

      logger.info(`Expected values from test data (${testDataKey}):`);
      logger.info(`  Issues: ${expectedIssues}`);
      logger.info(`  Page States: ${expectedPageStates}`);

      // Step 1: Get Token
      logger.info('Step 1: Getting bearer token...');
      const token = await this.getToken();
      logger.info('✅ Token acquired');

      // Step 2: Get Projects
      logger.info('Step 2: Fetching all projects...');
      const projects = await this.getProjects(token);
      logger.info(`✅ Got ${projects.length} projects`);

      // Step 3: Find Target Project
      logger.info(`Step 3: Finding project '${projectName}'...`);
      const targetProject = this.findProject(projects, projectName);

      if (!targetProject) {
        const errorMsg = '❌ Project not found';
        logger.error(errorMsg);
        validationErrors.push(errorMsg);
        throw new Error(errorMsg);
      }

      logger.info(`✅ Found project: ${targetProject.name}`);
      logger.info(`   ID: ${targetProject.project_id}`);

      // Step 4: Get Branches
      logger.info('Step 4: Fetching branches...');
      const branches = await this.getBranches(targetProject.project_id, token);
      logger.info(`✅ Got ${branches.length} branches`);

      // Step 5: Validate Branches against test data
      logger.info('Step 5: Validating branches against test data...');

      // Find the main/default branch (usually the first one or the one with name 'main')
      const mainBranch = branches.find((b) => b.name === 'main' || b.name === 'default') || branches[0];
      
      if (!mainBranch) {
        const errorMsg = '❌ No branches found';
        logger.error(errorMsg);
        validationErrors.push(errorMsg);
        throw new Error(errorMsg);
      }

      logger.info(`Validating branch: ${mainBranch.name}`);
      logger.info(`  Actual Issues: ${mainBranch.total_issues}`);
      logger.info(`  Actual Page States: ${mainBranch.page_states}`);

      // Validate issues count (actual should be >= expected)
      if (mainBranch.total_issues < expectedIssues) {
        const errorMsg = `❌ Issues count is less than expected: Expected at least ${expectedIssues}, Got ${mainBranch.total_issues}`;
        logger.error(errorMsg);
        validationErrors.push(errorMsg);
      } else {
        logger.info(`  ✅ Issues count is valid: Expected at least ${expectedIssues}, Got ${mainBranch.total_issues}`);
      }

      // Validate page states count (actual should be >= expected)
      if (mainBranch.page_states < expectedPageStates) {
        const errorMsg = `❌ Page states count is less than expected: Expected at least ${expectedPageStates}, Got ${mainBranch.page_states}`;
        logger.error(errorMsg);
        validationErrors.push(errorMsg);
      } else {
        logger.info(`  ✅ Page states count is valid: Expected at least ${expectedPageStates}, Got ${mainBranch.page_states}`);
      }

      // If there are validation errors, throw an error
      if (validationErrors.length > 0) {
        const errorMessage = `API Validation FAILED:\n${validationErrors.join('\n')}`;
        logger.error('========== API Validation FAILED ==========');
        logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Summary
      logger.info('========== API Validation PASSED ==========');
    } catch (error: any) {
      // If it's already our validation error, re-throw it
      if (validationErrors.length > 0 || error.message?.includes('API Validation')) {
        throw error;
      }
      
      // Handle other errors
      const errorMsg = `API Validation Failed: ${error.message}`;
      logger.error(errorMsg);
      
      if (error.response?.status === 401) {
        logger.error('Reason: 401 Unauthorized');
      }
      
      throw new Error(errorMsg);
    }
  }
}

// Create and export a singleton instance
const axeWatcherAPI = new AxeWatcherAPI();

// Export the class for custom instantiation if needed
export default AxeWatcherAPI;

// Export instance methods for backward compatibility
export const getToken = axeWatcherAPI.getToken.bind(axeWatcherAPI);
export const getProjects = axeWatcherAPI.getProjects.bind(axeWatcherAPI);
export const findProject = axeWatcherAPI.findProject.bind(axeWatcherAPI);
export const getBranches = axeWatcherAPI.getBranches.bind(axeWatcherAPI);
export const validateBranch = axeWatcherAPI.validateBranch.bind(axeWatcherAPI);
export const verifyPagestateIssuesCount = axeWatcherAPI.verifyPagestateIssuesCount.bind(axeWatcherAPI);

// Also export the instance itself
export { axeWatcherAPI };

