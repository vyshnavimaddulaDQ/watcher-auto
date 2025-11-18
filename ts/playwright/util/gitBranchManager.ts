import { execSync } from 'child_process';
import logger from './logger';

/**
 * Creates a git branch if it doesn't exist and switches to it
 * @param branchName - Name of the branch to create/switch to
 * @returns true if successful, false otherwise
 */
export function createAndSwitchToBranch(branchName: string): boolean {
  try {
    // Check if we're in a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    } catch (error) {
      logger.warn('⚠️ Not in a git repository. Skipping branch creation.');
      return false;
    }

    // Check if branch already exists
    try {
      execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { stdio: 'ignore' });
      logger.info(`✅ Branch "${branchName}" already exists. Switching to it...`);
      
      // Switch to existing branch
      execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
      logger.info(`✅ Switched to branch "${branchName}"`);
      return true;
    } catch (error) {
      // Branch doesn't exist, create it
      logger.info(`📝 Creating new branch "${branchName}"...`);
      
      // Get current branch name
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
      
      // Create and switch to new branch
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
      logger.info(`✅ Created and switched to branch "${branchName}" from "${currentBranch}"`);
      return true;
    }
  } catch (error: any) {
    logger.error(`❌ Failed to create/switch to branch "${branchName}": ${error.message}`);
    return false;
  }
}

/**
 * Gets the current git branch name
 * @returns Current branch name or null if not in a git repository
 */
export function getCurrentBranch(): string | null {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    return branch;
  } catch (error) {
    logger.warn('⚠️ Could not determine current git branch');
    return null;
  }
}

