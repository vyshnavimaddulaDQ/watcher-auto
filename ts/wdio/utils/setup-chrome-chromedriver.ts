import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
  const arch = os.arch();

  // Look for Chrome for Testing in common locations
  if (platform === 'darwin') {
    // macOS
    const chromePath = path.join(process.cwd(), 'chrome', `mac_arm-${getChromeVersion()}`, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
    
    // Try system Chrome
    const systemChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(systemChrome)) {
      return systemChrome;
    }
  } else if (platform === 'linux') {
    // Linux
    const chromePath = path.join(process.cwd(), 'chrome', `linux-${getChromeVersion()}`, 'chrome-linux64', 'chrome');
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
    
    // Try system Chrome
    const systemChromePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium'
    ];
    for (const chromePath of systemChromePaths) {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    }
  } else if (platform === 'win32') {
    // Windows
    const chromePath = path.join(process.cwd(), 'chrome', `win64-${getChromeVersion()}`, 'chrome-win64', 'chrome.exe');
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
    
    // Try system Chrome
    const systemChromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];
    for (const chromePath of systemChromePaths) {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    }
  }

  // Return undefined if not found (will use default Chrome)
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

  // Look for ChromeDriver in common locations
  if (platform === 'darwin') {
    // macOS
    const chromedriverPath = path.join(process.cwd(), 'chrome', `mac_arm-${getChromeVersion()}`, 'chromedriver-mac-arm64', 'chromedriver');
    if (fs.existsSync(chromedriverPath)) {
      return chromedriverPath;
    }
  } else if (platform === 'linux') {
    // Linux
    const chromedriverPath = path.join(process.cwd(), 'chrome', `linux-${getChromeVersion()}`, 'chromedriver-linux64', 'chromedriver');
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
    const chromedriverPath = path.join(process.cwd(), 'chrome', `win64-${getChromeVersion()}`, 'chromedriver-win64', 'chromedriver.exe');
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
    const chromeDir = path.join(process.cwd(), 'chrome');
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

