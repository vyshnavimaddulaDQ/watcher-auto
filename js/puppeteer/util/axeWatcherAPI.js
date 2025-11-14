const axios = require('axios')
require('dotenv/config')
const tokenManager = require('./tokenManager')
const logger = require('./logger')
const { testData } = require('../resources/testData')

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
    // Wait 20 seconds before making the API call to allow API to sync
    logger.info('🕐 Starting 20 second wait before fetching branches...')
    await this.sleep(20000)
    logger.info('🕐 Wait completed, proceeding with API call...')
    
    let url = `${API_URL}/v2/${projectId}/branches?`
    const params = ['x-pagination-page=1', 'x-pagination-per-page=5']

    if (branch) {
      params.push(`branch=${encodeURIComponent(branch)}`)
    }

    url += params.join('&')

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-pagination-page': '1',
        'x-pagination-per-page': '5',
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
   */
  async verifyPagestateIssuesCount(
    testDataKey = 'autoAnalyzeMode',
    projectName = 'automation_Playwright Test' 
  ) {
    logger.info('========== API Validation Starting ==========')

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

      // Step 4: Get Branches
      logger.info('Step 4: Fetching branches...')
      const branches = await this.getBranches(targetProject.project_id, token)
      logger.info(`✅ Got ${branches.length} branches`)

      // Step 5: Validate Branches against test data
      logger.info('Step 5: Validating branches against test data...')

      // Find the main/default branch (usually the first one or the one with name 'main')
      const mainBranch = branches.find((b) => b.name === 'main' || b.name === 'default') || branches[0]
      
      logger.info(`Validating branch: ${mainBranch.name}`)
      logger.info(`  Actual Issues: ${mainBranch.total_issues}`)
      logger.info(`  Actual Page States: ${mainBranch.page_states}`)

      // Validate issues count (actual should be >= expected)
      if (mainBranch.total_issues < expectedIssues) {
        const errorMsg = `❌ Issues count is less than expected: Expected at least ${expectedIssues}, Got ${mainBranch.total_issues}`
        logger.error(errorMsg)
        validationErrors.push(errorMsg)
      } else {
        logger.info(`  ✅ Issues count is valid: Expected at least ${expectedIssues}, Got ${mainBranch.total_issues}`)
      }

      // Validate page states count (actual should be >= expected)
      if (mainBranch.page_states < expectedPageStates) {
        const errorMsg = `❌ Page states count is less than expected: Expected at least ${expectedPageStates}, Got ${mainBranch.page_states}`
        logger.error(errorMsg)
        validationErrors.push(errorMsg)
      } else {
        logger.info(`  ✅ Page states count is valid: Expected at least ${expectedPageStates}, Got ${mainBranch.page_states}`)
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
      if (validationErrors.length > 0 || error.message.includes('API Validation')) {
        throw error
      }
      
      // Handle other errors
      const errorMsg = `API Validation Failed: ${error.message}`
      logger.error(errorMsg)
      
      if (error.response?.status === 401) {
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

