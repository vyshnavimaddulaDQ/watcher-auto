const axios = require('axios')
require('dotenv/config')
const tokenManager = require('./tokenManager')
const logger = require('./logger')
const { testData } = require('../resources/testData')
const { Builder } = require('selenium-webdriver')
const { Options } = require('selenium-webdriver/chrome')
const { getChromeBinaryPath } = require('./setup-chrome-chromedriver')

const API_URL = 'https://axe-qa.dequelabs.com/api/axe-watcher'

/**
 * AxeWatcherAPI - Class for interacting with Axe Watcher API
 */
class AxeWatcherAPI {
  /**
   * Get Bearer Token (uses TokenManager for caching/refresh)
   */
  async getToken() {
    const token = await tokenManager.getToken()
    return token
  }

  /**
   * Get all projects
   */
  async getProjects(token) {
    const url = `${API_URL}/projects`
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    return response.data
  }

  /**
   * Find a project by name
   */
  findProject(projects, projectName) {
    const foundProject = projects.find(
      p => p.name === projectName || p.name.toLowerCase().includes(projectName.toLowerCase())
    )
    
    return foundProject
  }

  /**
   * Get branches for a project
   */
  async getBranches(projectId, token, branch) {
    // Wait 30 seconds before making the API call to allow API to sync (min 60s total, max 120s total)
    logger.info('🕐 Starting 30 second wait before fetching branches...')
    await this.sleep(30000)
    logger.info('🕐 Wait completed, proceeding with API call...')
    // Reload the branches page in headless browser using Selenium WebDriver
    logger.info('🔄 Reloading branches page in headless browser using Selenium WebDriver...')
    const branchesUrl = `https://axe-qa.dequelabs.com/axe-watcher/projects/${projectId}/branches`
    
    let browser = null
    try {
      const options = new Options()
      options.addArguments('--headless=new')
      options.addArguments('--no-sandbox')
      options.addArguments('--disable-dev-shm-usage')
      options.addArguments('--ignore-certificate-errors')
      options.addArguments('--ignore-ssl-errors')
      
      const chromeBinaryPath = getChromeBinaryPath()
      if (chromeBinaryPath) {
        options.setBinaryPath(chromeBinaryPath)
      }
      
      browser = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build()
      
      // Set window size
      await browser.manage().window().setRect({ width: 1920, height: 1080 })
      
      // Navigate to branches page
      logger.info(`📍 Navigating to: ${branchesUrl}`)
      await browser.get(branchesUrl)
      
      // Wait for page to load
      await browser.wait(async () => {
        const state = await browser.executeScript('return document.readyState')
        return state === 'complete'
      }, 10000)
      
      // Wait a bit for page to be fully interactive
      await browser.sleep(2000)
      
      // Reload the page to trigger any processing
      logger.info('🔄 Reloading page...')
      await browser.navigate().refresh()
      
      // Wait for page to load after reload
      await browser.wait(async () => {
        const state = await browser.executeScript('return document.readyState')
        return state === 'complete'
      }, 8000)
      
      // Wait a bit for any async operations to complete after reload
      await browser.sleep(2000)
      
      logger.info('✅ Page reload completed, proceeding with API call...')
    } catch (error) {
      logger.warn(`⚠️ Failed to reload page: ${error.message}. Continuing with API call...`)
    } finally {
      if (browser) {
        try {
          await browser.quit()
        } catch (error) {
          logger.warn(`⚠️ Error closing browser: ${error.message}`)
        }
      }
    }
    
    let url = `${API_URL}/v2/${projectId}/branches?`
    const params = ['x-pagination-page=1', 'x-pagination-per-page=5']

    if (branch) {
      params.push(`branch=${encodeURIComponent(branch)}`)
    }

    // Add cache-busting timestamp to ensure fresh data
    params.push(`_t=${Date.now()}`)

    url += params.join('&')

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-pagination-page': '1',
        'x-pagination-per-page': '5',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

    return response.data
  }

  /**
   * Validate branch data
   */
  validateBranch(branch, expectedName, maxIssues = 300) {
    const errors = []

    if (branch.name !== expectedName) {
      errors.push(`Branch name: expected '${expectedName}', got '${branch.name}'`)
    }

    if (branch.total_issues > maxIssues) {
      errors.push(`Issues: ${branch.total_issues} exceeds max ${maxIssues}`)
    }

    if (!branch.page_states || branch.page_states < 1) {
      errors.push(`Page states: should be at least 1, got ${branch.page_states}`)
    }

    if (!branch.axe_core_version) {
      errors.push(`Missing: axe_core_version`)
    }

    if (!branch.hasOwnProperty('data_source_version')) {
      errors.push(`Missing: axe_watcher_version field`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Extract number from string like "(200) total issues" -> 200
   */
  extractNumberFromString(str) {
    const match = str.match(/\((\d+)\)/)
    const result = match ? parseInt(match[1], 10) : 0
    return result
  }

  /**
   * Sleep/delay utility
   */
  sleep(ms) {
    const seconds = ms / 1000
    logger.info(`⏳ Waiting ${seconds} seconds before API call...`)
    return new Promise(resolve => {
      setTimeout(() => {
        logger.info(`✅ Wait completed (${seconds} seconds)`)
        resolve()
      }, ms)
    })
  }

  /**
   * Verify page states and issues count against test data
   * @param {string} testDataKey - Key from testData.issuesPageStatesValidations
   * @param {string} projectName - Name of the project to validate
   * @param {string} [branchName] - Optional branch name to fetch results from. If not provided, uses main/default branch
   */
  async verifyPagestateIssuesCount(
    testDataKey = 'autoAnalyzeMode',
    projectName = 'automation_Playwright Test',
    branchName
  ) {
    logger.info('========== API Validation Starting ==========')
    logger.info(`Test Suite: ${testDataKey}`)
    logger.info(`Validation started at: ${new Date().toISOString()}`)

    const validationErrors = []

    try {
      // Get expected values from test data
      const expectedData = testData.issuesPageStatesValidations[testDataKey]
      
      if (!expectedData) {
        const errorMsg = `❌ Test data key '${testDataKey}' not found in testData.issuesPageStatesValidations`
        logger.error(errorMsg)
        validationErrors.push(errorMsg)
        throw new Error(errorMsg)
      }

      const expectedIssues = expectedData.accessibilityIssuesCount
      const expectedPageStates = this.extractNumberFromString(expectedData.pageStates)

      logger.info(`Expected values from test data (${testDataKey}):`)
      logger.info(`  Issues: ${expectedIssues}`)
      logger.info(`  Page States: ${expectedPageStates}`)

      // Step 1: Get Token
      logger.info('Step 1: Getting bearer token...')
      const token = await this.getToken()
      logger.info('✅ Token acquired')

      // Step 2: Get Projects
      logger.info('Step 2: Fetching all projects...')
      const projects = await this.getProjects(token)
      logger.info(`✅ Got ${projects.length} projects`)

      // Step 3: Find Target Project
      logger.info(`Step 3: Finding project '${projectName}'...`)
      const targetProject = this.findProject(projects, projectName)

      if (!targetProject) {
        const errorMsg = '❌ Project not found'
        logger.error(errorMsg)
        validationErrors.push(errorMsg)
        throw new Error(errorMsg)
      }

      logger.info(`✅ Found project: ${targetProject.name}`)
      logger.info(`   ID: ${targetProject.project_id}`)

      // Step 4: Get Branches with retry logic to ensure fresh data
      logger.info('Step 4: Fetching branches...')
      if (branchName) {
        logger.info(`📍 Fetching results for branch: ${branchName}`)
      } else {
        logger.info('📍 No branch specified, will use main/default branch')
      }
      
      // Fetch branches multiple times with delays to ensure we get fresh data
      // This is important when multiple test suites run sequentially
      let branches = await this.getBranches(targetProject.project_id, token, branchName)
      logger.info(`✅ Got ${branches.length} branches (first fetch)`)
      
      // Wait a bit and fetch again to ensure we have the latest data after all flushes
      logger.info('🔄 Waiting and fetching fresh branch data to ensure latest counts...')
      await this.sleep(0) // No additional wait between fetches
      branches = await this.getBranches(targetProject.project_id, token, branchName)
      logger.info(`✅ Got ${branches.length} branches (fresh fetch)`)

      // Step 5: Validate Branches against test data
      logger.info('Step 5: Validating branches against test data...')

      // Find the specified branch, or fall back to main/default branch
      let targetBranch
      if (branchName) {
        targetBranch = branches.find((b) => b.name === branchName)
        if (!targetBranch) {
          logger.warn(`⚠️ Branch "${branchName}" not found in results. Available branches: ${branches.map(b => b.name).join(', ')}`)
          logger.info('📍 Falling back to main/default branch')
        }
      }
      
      // If branch not found or not specified, use main/default
      if (!targetBranch) {
        targetBranch = branches.find((b) => b.name === 'main' || b.name === 'default') || branches[0]
      }
      
      if (!targetBranch) {
        const errorMsg = '❌ No branches found'
        logger.error(errorMsg)
        validationErrors.push(errorMsg)
        throw new Error(errorMsg)
      }

      logger.info(`Validating branch: ${targetBranch.name}`)
      if (branchName && targetBranch.name !== branchName) {
        logger.warn(`⚠️ Requested branch "${branchName}" but validating "${targetBranch.name}" instead`)
      }
      logger.info(`  Actual Issues: ${targetBranch.total_issues}`)
      logger.info(`  Actual Page States: ${targetBranch.page_states}`)
      logger.info(`  Fetch timestamp: ${new Date().toISOString()}`)

      // Validate issues count (actual should be >= expected)
      if (targetBranch.total_issues < expectedIssues) {
        const errorMsg = `❌ Issues count is less than expected: Expected at least ${expectedIssues}, Got ${targetBranch.total_issues}`
        logger.error(errorMsg)
        validationErrors.push(errorMsg)
      } else {
        logger.info(`  ✅ Issues count is valid: Expected at least ${expectedIssues}, Got ${targetBranch.total_issues}`)
      }

      // Validate page states count (actual should be >= expected)
      if (targetBranch.page_states < expectedPageStates) {
        const errorMsg = `❌ Page states count is less than expected: Expected at least ${expectedPageStates}, Got ${targetBranch.page_states}`
        logger.error(errorMsg)
        validationErrors.push(errorMsg)
      } else {
        logger.info(`  ✅ Page states count is valid: Expected at least ${expectedPageStates}, Got ${targetBranch.page_states}`)
      }

      // If there are validation errors, throw an error
      if (validationErrors.length > 0) {
        const errorMessage = `API Validation FAILED:\n${validationErrors.join('\n')}`
        logger.error('========== API Validation FAILED ==========')
        logger.error(errorMessage)
        throw new Error(errorMessage)
      }

      // Summary
      logger.info('========== API Validation PASSED ==========')
    } catch (error) {
      // If it's already our validation error, re-throw it
      if (validationErrors.length > 0 || (error.message && error.message.includes('API Validation'))) {
        throw error
      }
      
      // Handle other errors
      const errorMsg = `API Validation Failed: ${error.message}`
      logger.error(errorMsg)
      
      if (error.response && error.response.status === 401) {
        logger.error('Reason: 401 Unauthorized')
      }
      
      throw new Error(errorMsg)
    }
  }
}

// Create and export a singleton instance
const axeWatcherAPI = new AxeWatcherAPI()

// Export the class for custom instantiation if needed
module.exports = AxeWatcherAPI

// Export instance methods for backward compatibility
module.exports.getToken = axeWatcherAPI.getToken.bind(axeWatcherAPI)
module.exports.getProjects = axeWatcherAPI.getProjects.bind(axeWatcherAPI)
module.exports.findProject = axeWatcherAPI.findProject.bind(axeWatcherAPI)
module.exports.getBranches = axeWatcherAPI.getBranches.bind(axeWatcherAPI)
module.exports.validateBranch = axeWatcherAPI.validateBranch.bind(axeWatcherAPI)
module.exports.verifyPagestateIssuesCount = axeWatcherAPI.verifyPagestateIssuesCount.bind(axeWatcherAPI)

// Also export the instance itself
module.exports.default = axeWatcherAPI
module.exports.axeWatcherAPI = axeWatcherAPI
