import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Gets the project root directory by looking for common markers
 * @returns Project root path
 */
function getProjectRoot(): string {
  let currentDir = __dirname;
  while (currentDir !== path.dirname(currentDir)) {
    // Look for .git directory or package.json at root level
    if (fs.existsSync(path.join(currentDir, '.git')) || 
        (fs.existsSync(path.join(currentDir, 'package.json')) && 
         (fs.existsSync(path.join(currentDir, 'ts')) || fs.existsSync(path.join(currentDir, 'js'))))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  // Fallback to process.cwd() if we can't find project root
  return process.cwd();
}

/**
 * Gets the Chrome binary path
 * Checks CHROME_BIN environment variable first, then looks for Chrome for Testing
 * @returns Path to Chrome binary
 */
export function getChromeBinaryPath(): string | undefined {
  // Check if CHROME_BIN is set in environment
  if (process.env.CHROME_BIN) {
    return process.env.CHROME_BIN;
  }

  const platform = os.platform();
  const projectRoot = getProjectRoot();

  // Look for Chrome for Testing in common locations
  // NOTE: We do NOT fall back to system Chrome as it may be v139+ which is not supported
  if (platform === 'darwin') {
    // macOS
    const chromePath = path.join(projectRoot, 'chrome', `mac_arm-${getChromeVersion()}`, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
    
    // Also check for mac_x64 architecture
    const chromePathX64 = path.join(projectRoot, 'chrome', `mac_x64-${getChromeVersion()}`, 'chrome-mac-x64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
    if (fs.existsSync(chromePathX64)) {
      return chromePathX64;
    }
  } else if (platform === 'linux') {
    // Linux
    const chromePath = path.join(projectRoot, 'chrome', `linux-${getChromeVersion()}`, 'chrome-linux64', 'chrome');
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
  } else if (platform === 'win32') {
    // Windows
    const chromePath = path.join(projectRoot, 'chrome', `win64-${getChromeVersion()}`, 'chrome-win64', 'chrome.exe');
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
  }

  // Return undefined if Chrome for Testing not found
  // Do NOT fall back to system Chrome as it may be v139+ which is not supported
  console.warn('⚠️ Chrome for Testing not found. Please install Chrome for Testing or set CHROME_BIN environment variable.');
  return undefined;
}

/**
 * Gets the ChromeDriver binary path
 * Checks CHROMEDRIVER_BIN environment variable first, then looks for ChromeDriver
 * @returns Path to ChromeDriver binary
 */
export function getChromedriverBinaryPath(): string | undefined {
  // Check if CHROMEDRIVER_BIN is set in environment
  if (process.env.CHROMEDRIVER_BIN) {
    return process.env.CHROMEDRIVER_BIN;
  }

  const platform = os.platform();
  const projectRoot = getProjectRoot();

  // Look for ChromeDriver in common locations
  if (platform === 'darwin') {
    // macOS
    const chromedriverPath = path.join(projectRoot, 'chrome', `mac_arm-${getChromeVersion()}`, 'chromedriver-mac-arm64', 'chromedriver');
    if (fs.existsSync(chromedriverPath)) {
      return chromedriverPath;
    }
    
    // Also check for mac_x64 architecture
    const chromedriverPathX64 = path.join(projectRoot, 'chrome', `mac_x64-${getChromeVersion()}`, 'chromedriver-mac-x64', 'chromedriver');
    if (fs.existsSync(chromedriverPathX64)) {
      return chromedriverPathX64;
    }
  } else if (platform === 'linux') {
    // Linux
    const chromedriverPath = path.join(projectRoot, 'chrome', `linux-${getChromeVersion()}`, 'chromedriver-linux64', 'chromedriver');
    if (fs.existsSync(chromedriverPath)) {
      return chromedriverPath;
    }
    
    // Try system chromedriver
    const systemChromedriver = '/usr/bin/chromedriver';
    if (fs.existsSync(systemChromedriver)) {
      return systemChromedriver;
    }
  } else if (platform === 'win32') {
    // Windows
    const chromedriverPath = path.join(projectRoot, 'chrome', `win64-${getChromeVersion()}`, 'chromedriver-win64', 'chromedriver.exe');
    if (fs.existsSync(chromedriverPath)) {
      return chromedriverPath;
    }
  }

  // Return undefined if not found (will use default ChromeDriver)
  return undefined;
}

/**
 * Gets Chrome version from installed Chrome directory
 * @returns Chrome version string or default version
 */
function getChromeVersion(): string {
  try {
    const projectRoot = getProjectRoot();
    const chromeDir = path.join(projectRoot, 'chrome');
    if (fs.existsSync(chromeDir)) {
      const entries = fs.readdirSync(chromeDir);
      for (const entry of entries) {
        // Look for version pattern like "mac_arm-142.0.7444.162"
        const match = entry.match(/\d+\.\d+\.\d+\.\d+/);
        if (match) {
          return match[0];
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  // Return default version if not found
  return '142.0.7444.162';
}
