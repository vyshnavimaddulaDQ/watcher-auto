import playwright from 'playwright';
import tokenManager from './tokenManager';
import logger from './logger';
import { testData } from '../resources/testData';
import 'dotenv/config';

const DEVHUB_URL = 'https://axe-qa.dequelabs.com/axe-watcher/projects';
const AUTH_URL = 'https://auth-qa.dequelabs.com/auth';
const REALM = 'axe-qa';

/**
 * Authenticate browser session using API token and open DevHub URL
 * @param url - The URL to open after authentication (defaults to projects page)
 * @returns Authenticated browser context and page
 */
export async function authenticateAndOpenDevHub(
  url: string = DEVHUB_URL
): Promise<{ browser: playwright.Browser; context: playwright.BrowserContext; page: playwright.Page }> {
  logger.info('🔐 Starting DevHub authentication flow...');

  // Step 1: Get access token using tokenManager
  logger.info('Step 1: Getting access token...');
  const accessToken = await tokenManager.getToken();
  logger.info('✅ Access token acquired');

  // Step 2: Launch browser
  logger.info('Step 2: Launching browser...');
  const browser = await playwright.chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--ignore-ssl-errors']
  });

  // Step 3: Create browser context
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  // Step 4: Navigate to auth endpoint to set authentication cookies
  logger.info('Step 3: Setting up authentication...');
  const page = await context.newPage();

  try {
    // Method 1: Set Authorization header for API requests
    logger.info('🔑 Setting Authorization header...');
    await context.setExtraHTTPHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    // Method 2: Navigate to the target URL first
    // The application might redirect to login if not authenticated
    logger.info(`📍 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    const currentUrl = page.url();
    
    // Method 3: If redirected to login, authenticate via form
    if (currentUrl.includes('/auth/') || currentUrl.includes('/login')) {
      logger.info('🔐 Detected login page, authenticating via form...');
      await loginViaForm(page);
      
      // Wait for redirect after login
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      
      // If still on auth page, try navigating again
      if (page.url().includes('/auth/') || page.url().includes('/login')) {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      }
    } else {
      // Already authenticated or API accepts token via header
      logger.info('✅ Already authenticated or token accepted via header');
    }

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    
    logger.info('✅ Successfully authenticated and navigated to DevHub');

    return { browser, context, page };
  } catch (error: any) {
    logger.error(`❌ Authentication failed: ${error.message}`);
    throw error;
  }
}

/**
 * Alternative login method via form submission
 */
async function loginViaForm(page: playwright.Page): Promise<void> {
  try {
    // Wait for login form to appear
    await page.waitForSelector('input[name="username"], input[id="username"], input[type="email"]', { timeout: 10000 });
    
    // Find and fill username
    const usernameInput = await page.locator('input[name="username"], input[id="username"], input[type="email"]').first();
    await usernameInput.fill('vyshnavi.maddula+qauser@deque.com');
    
    // Find and fill password
    await page.waitForSelector('input[name="password"], input[id="password"], input[type="password"]', { timeout: 10000 });
    const passwordInput = await page.locator('input[name="password"], input[id="password"], input[type="password"]').first();
    await passwordInput.fill(process.env.AXE_PASSWORD || 'Password@123');
    
    // Find and click login button
    await page.waitForSelector('button[type="submit"], input[type="submit"], button:has-text("Sign in"), button:has-text("Log in")', { timeout: 10000 });
    const loginButton = await page.locator('button[type="submit"], input[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first();
    await loginButton.click();
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    logger.info('✅ Login form submitted successfully');
  } catch (error: any) {
    logger.error(`❌ Form login failed: ${error.message}`);
    throw error;
  }
}

/**
 * Open DevHub projects page with authentication
 * @param projectUrl - Optional specific project URL to open
 */
export async function openDevHubProjects(projectUrl?: string): Promise<{ browser: playwright.Browser; context: playwright.BrowserContext; page: playwright.Page }> {
  const url = projectUrl || DEVHUB_URL;
  return authenticateAndOpenDevHub(url);
}

/**
 * Navigate to projects page, verify title, click on project, and verify branches page title
 * @param projectName - Name of the project to click on (e.g., 'automation_Playwright')
 * @param expectedIssuesCount - Expected issues count from test data (optional, for verification)
 * @param expectedPageStatesCount - Expected page states count from test data (optional, for verification)
 * @returns Authenticated browser, context, page on the branches page, and extracted counts
 */
export async function navigateToProjectBranches(
  projectName: string,
  expectedIssuesCount?: number,
  expectedPageStatesCount?: number
): Promise<{ 
  browser: playwright.Browser; 
  context: playwright.BrowserContext; 
  page: playwright.Page;
  firstBranchIssuesCount: number | null;
  firstBranchPageStatesCount: number | null;
  verificationPassed: boolean;
}> {
  logger.info(`🔍 Navigating to project: ${projectName}`);
  
  // Step 1: Authenticate and open projects page
  const { browser, context, page } = await authenticateAndOpenDevHub(DEVHUB_URL);
  
  try {
    // Step 2: Verify projects page title
    logger.info('Step 2: Verifying projects page title...');
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    
    const projectsPageTitle = await page.title();
    const expectedProjectsTitle = 'Projects | axe Developer Hub | axe DevTools';
    
    if (projectsPageTitle !== expectedProjectsTitle) {
      logger.warn(`⚠️ Projects page title mismatch. Expected: "${expectedProjectsTitle}", Got: "${projectsPageTitle}"`);
    } else {
      logger.info(`✅ Projects page title verified: "${projectsPageTitle}"`);
    }
    
    // Step 3: Wait for projects table to load
    logger.info('Step 3: Waiting for projects table to load...');
    await page.waitForSelector('h1:has-text("Projects"), table, [data-testid="main-content"]', { timeout: 15000 });
    
    // Step 4: Find and click on the specified project
    logger.info(`Step 4: Looking for project: ${projectName}...`);
    
    // Wait for the project link to be visible
    await page.waitForSelector(`a:has-text("${projectName}"), a[href*="${projectName}"]`, { timeout: 15000 });
    
    // Find the project link
    const projectLink = await page.locator(`a:has-text("${projectName}"), a[href*="${projectName}"]`).first();
    
    // Verify the link is visible and clickable
    const isVisible = await projectLink.isVisible();
    if (!isVisible) {
      throw new Error(`Project link "${projectName}" is not visible`);
    }
    
    logger.info(`✅ Found project link: ${projectName}`);
    
    // Click on the project link
    logger.info(`Step 5: Clicking on project: ${projectName}...`);
    await projectLink.click();
    
    // Step 5: Wait for branches page to load
    logger.info('Step 6: Waiting for branches page to load...');
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    
    // Step 6: Verify branches page title
    logger.info('Step 7: Verifying branches page title...');
    const branchesPageTitle = await page.title();
    const expectedBranchesTitle = `${projectName} | Branches | axe DevTools`;
    
    if (!branchesPageTitle.includes(projectName) || !branchesPageTitle.includes('Branches')) {
      logger.warn(`⚠️ Branches page title may not match expected format. Expected to contain "${projectName}" and "Branches", Got: "${branchesPageTitle}"`);
    } else {
      logger.info(`✅ Branches page title verified: "${branchesPageTitle}"`);
    }
    
    // Verify we're on the branches page by checking for branch-related elements
    await page.waitForSelector('h1:has-text("' + projectName + '"), [data-testid="branch"]', { timeout: 15000 });
    logger.info(`✅ Successfully navigated to branches page for project: ${projectName}`);
    
    // Step 8: Wait for first branch card to be ready and verify counts
    logger.info('Step 8: Waiting for first branch card to be ready...');
    
    // Wait for branch card to appear
    await page.waitForSelector('[data-testid="branch"]', { timeout: 30000 });
    
    // Wait for processing indicators to disappear and actual data to appear
    // Use page.evaluate to check if card is ready
    await page.waitForFunction(
      `() => {
        const branchSection = document.querySelector('[data-testid="branch"]');
        if (!branchSection) return false;
        
        const card = branchSection.querySelector('section.Panel');
        if (!card) return false;
        
        const text = card.textContent || '';
        
        // Check for processing/loading indicators
        const isProcessing = /processing|loading|scanning/i.test(text);
        if (isProcessing) return false;
        
        // Check if we have actual numbers (not "processing" or "loading")
        const hasIssuesCount = /\\(?\\d+\\)?\\s+total issues/i.test(text);
        const hasPageStatesCount = /\\(?\\d+\\)?\\s+total page states/i.test(text);
        
        // Also check for the threshold element which indicates the card is ready
        const thresholdElement = card.querySelector('[data-testid="a11y-count-threshold-run-card"]');
        const hasThreshold = thresholdElement !== null && thresholdElement.textContent?.trim() !== '';
        
        return hasIssuesCount && hasPageStatesCount && hasThreshold;
      }`,
      { timeout: 120000, polling: 2000 }
    );
    
    logger.info('✅ First branch card is ready!');
    
    // Step 9: Extract and verify page states and issues count from the first card
    logger.info('Step 9: Extracting counts from first branch card...');
    const firstBranchCard = await page.locator('[data-testid="branch"] section.Panel').first();
    
    let extractedIssuesCount: number | null = null;
    let extractedPageStatesCount: number | null = null;
    
    // Method 1: Extract from list items (most reliable based on HTML structure)
    try {
      const listItems = await firstBranchCard.locator('ul li').all();
      for (const item of listItems) {
        const itemText = await item.textContent();
        if (itemText) {
          // Match "(218) total issues" or "218 total issues"
          const issuesMatch = itemText.match(/\(?(\d+)\)?\s+total issues/i);
          if (issuesMatch && !extractedIssuesCount) {
            extractedIssuesCount = parseInt(issuesMatch[1], 10);
          }
          
          // Match "(14) total page states" or "14 total page states"
          const pageStatesMatch = itemText.match(/\(?(\d+)\)?\s+total page states/i);
          if (pageStatesMatch && !extractedPageStatesCount) {
            extractedPageStatesCount = parseInt(pageStatesMatch[1], 10);
          }
        }
      }
    } catch (e) {
      logger.warn(`Could not extract from list items: ${e}`);
    }
    
    // Method 2: Using data-testid for issues count threshold (fallback)
    if (!extractedIssuesCount) {
      try {
        const thresholdElement = await firstBranchCard.locator('[data-testid="a11y-count-threshold-run-card"]').first();
        if (await thresholdElement.isVisible({ timeout: 2000 })) {
          const thresholdText = await thresholdElement.textContent();
          extractedIssuesCount = thresholdText ? parseInt(thresholdText.trim(), 10) : null;
        }
      } catch (e) {
        logger.warn('Could not find threshold element');
      }
    }
    
    // Method 3: Extract using text locators (fallback)
    if (!extractedIssuesCount || !extractedPageStatesCount) {
      try {
        const cardText = await firstBranchCard.textContent();
        if (cardText) {
          if (!extractedIssuesCount) {
            const issuesMatch = cardText.match(/\(?(\d+)\)?\s+total issues/i);
            if (issuesMatch) {
              extractedIssuesCount = parseInt(issuesMatch[1], 10);
            }
          }
          if (!extractedPageStatesCount) {
            const pageStatesMatch = cardText.match(/\(?(\d+)\)?\s+total page states/i);
            if (pageStatesMatch) {
              extractedPageStatesCount = parseInt(pageStatesMatch[1], 10);
            }
          }
        }
      } catch (e) {
        logger.warn('Could not extract from card text');
      }
    }
    
    // Log the extracted counts
    logger.info(`\n=== First Branch Card Counts ===`);
    logger.info(`Issues Count: ${extractedIssuesCount ?? 'Not found'}`);
    logger.info(`Page States Count: ${extractedPageStatesCount ?? 'Not found'}`);
    
    if (extractedIssuesCount === null || extractedPageStatesCount === null) {
      logger.warn('⚠️ Could not extract all counts from the first branch card');
    } else {
      logger.info(`✅ Successfully extracted counts from first branch card`);
    }
    
    // Step 10: Verify counts against expected test data (if provided)
    let verificationPassed = true;
    if (expectedIssuesCount !== undefined || expectedPageStatesCount !== undefined) {
      logger.info('Step 10: Verifying counts against expected test data...');
      
      if (expectedIssuesCount !== undefined) {
        if (extractedIssuesCount === null) {
          logger.error(`❌ Issues count verification failed: Could not extract issues count`);
          verificationPassed = false;
        } else if (extractedIssuesCount < expectedIssuesCount) {
          logger.error(`❌ Issues count verification failed: Expected at least ${expectedIssuesCount}, Got ${extractedIssuesCount}`);
          verificationPassed = false;
        } else {
          logger.info(`✅ Issues count verified: Expected at least ${expectedIssuesCount}, Got ${extractedIssuesCount}`);
        }
      }
      
      if (expectedPageStatesCount !== undefined) {
        if (extractedPageStatesCount === null) {
          logger.error(`❌ Page states count verification failed: Could not extract page states count`);
          verificationPassed = false;
        } else if (extractedPageStatesCount < expectedPageStatesCount) {
          logger.error(`❌ Page states count verification failed: Expected at least ${expectedPageStatesCount}, Got ${extractedPageStatesCount}`);
          verificationPassed = false;
        } else {
          logger.info(`✅ Page states count verified: Expected at least ${expectedPageStatesCount}, Got ${extractedPageStatesCount}`);
        }
      }
      
      if (verificationPassed) {
        logger.info('✅ All verifications passed!');
      } else {
        logger.warn('⚠️ Some verifications failed. Check the logs above for details.');
      }
    } else {
      logger.info('ℹ️ No expected values provided, skipping verification');
    }
    
    return { 
      browser, 
      context, 
      page,
      firstBranchIssuesCount: extractedIssuesCount,
      firstBranchPageStatesCount: extractedPageStatesCount,
      verificationPassed
    };
  } catch (error: any) {
    logger.error(`❌ Failed to navigate to project branches: ${error.message}`);
    throw error;
  }
}

/**
 * Helper function to extract number from string like "(200) total issues" -> 200
 */
function extractNumberFromString(str: string): number {
  const match = str.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Navigate to project branches and verify counts using test data key
 * @param projectName - Name of the project to click on (e.g., 'automation_Playwright')
 * @param testDataKey - Key from testData.issuesPageStatesValidations (e.g., 'autoAnalyzeMode')
 * @returns Authenticated browser, context, page, extracted counts, and verification result
 */
export async function navigateToProjectBranchesWithTestData(
  projectName: string,
  testDataKey: string
): Promise<{ 
  browser: playwright.Browser; 
  context: playwright.BrowserContext; 
  page: playwright.Page;
  firstBranchIssuesCount: number | null;
  firstBranchPageStatesCount: number | null;
  verificationPassed: boolean;
}> {
  logger.info(`🔍 Navigating to project with test data key: ${testDataKey}`);
  
  // Get expected values from test data
  const expectedData = testData.issuesPageStatesValidations[testDataKey as keyof typeof testData.issuesPageStatesValidations];
  
  if (!expectedData) {
    throw new Error(`Test data key '${testDataKey}' not found in testData.issuesPageStatesValidations`);
  }
  
  const expectedIssues = expectedData.accessibilityIssuesCount;
  const expectedPageStates = extractNumberFromString(expectedData.pageStates);
  
  logger.info(`Expected values from test data (${testDataKey}):`);
  logger.info(`  Issues: ${expectedIssues}`);
  logger.info(`  Page States: ${expectedPageStates}`);
  
  // Call the main function with expected values
  return navigateToProjectBranches(projectName, expectedIssues, expectedPageStates);
}

