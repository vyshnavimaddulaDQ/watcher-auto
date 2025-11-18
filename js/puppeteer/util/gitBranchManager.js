const { execSync } = require('child_process')
const logger = require('./logger')

/**
 * Creates a git branch if it doesn't exist and switches to it
 * @param {string} branchName - Name of the branch to create/switch to
 * @returns {boolean} true if successful, false otherwise
 */
function createAndSwitchToBranch(branchName) {
  try {
    // Check if we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' })
    } catch (error) {
      logger.warn('⚠️ Not in a git repository. Skipping branch creation.')
      return false
    }

    // Check if branch already exists
    try {
      execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { stdio: 'ignore' })
      logger.info(`✅ Branch "${branchName}" already exists. Switching to it...`)
      
      // Switch to existing branch
      execSync(`git checkout ${branchName}`, { stdio: 'inherit' })
      logger.info(`✅ Switched to branch "${branchName}"`)
    } catch (error) {
      // Branch doesn't exist, create it
      logger.info(`📝 Creating new branch "${branchName}"...`)
      
      // Get current branch name
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
      
      // Create and switch to new branch
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' })
      logger.info(`✅ Created and switched to branch "${branchName}" from "${currentBranch}"`)
    }

    // Set environment variable for Axe Watcher to read
    // The watcher reads branch name from git metadata, but setting env var ensures it's available
    process.env.GIT_BRANCH = branchName
    
    // Also set GITHUB_REF format for CI compatibility (if not already set)
    if (!process.env.GITHUB_REF) {
      process.env.GITHUB_REF = `refs/heads/${branchName}`
    }
    
    logger.info(`✅ Set GIT_BRANCH environment variable to: ${branchName}`)
    return true
  } catch (error) {
    logger.error(`❌ Failed to create/switch to branch "${branchName}": ${error.message}`)
    return false
  }
}

/**
 * Gets the current git branch name
 * @returns {string|null} Current branch name or null if not in a git repository
 */
function getCurrentBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
    return branch
  } catch (error) {
    logger.warn('⚠️ Could not determine current git branch')
    return null
  }
}

module.exports = {
  createAndSwitchToBranch,
  getCurrentBranch
}

