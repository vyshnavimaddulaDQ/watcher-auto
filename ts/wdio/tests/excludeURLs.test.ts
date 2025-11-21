import { testData as data } from '../resources/testData';
import { testData } from '../resources/testData';
import { expect } from 'chai';
import 'mocha';
import { wdioConfig, WdioController, wrapWdio } from '@axe-core/watcher';
import { remote } from 'webdriverio';
import 'dotenv/config';
import type { Capabilities } from '@wdio/types'
import {
  getChromeBinaryPath,
  getChromedriverBinaryPath
} from '../utils/setup-chrome-chromedriver'
import { verifyPagestateIssuesCount } from '../utils/axeWatcherAPI'
import { createAndSwitchToBranch, getCurrentBranch } from '../utils/gitBranchManager'
let browser: WebdriverIO.Browser;
let controller: WdioController;

const API_KEY: string = process.env.WDIO_API_KEY_GIT ?? 'PROVIDE API KEY!';

// ✅ Global unique build ID (reusable)
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const globalBuildID = GITHUB_RUN_ID || `RUN-${Math.floor(Math.random() * 100000)}`;
console.log("globalBuildID:", globalBuildID);

// List of Axe configurations (mimicking Java DataProvider behavior)
const excludeURLs: {
  description: string;
  axe: Parameters<typeof wdioConfig>[0]['axe'];
}[] = [
  {
    description: 'C130837	Overriding Accessibility Standard Configuration from GlobalConfigs ',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      configurationOverrides: {
        accessibilityStandard: 'WCAG 2.2 AAA', // Defines the accessibility standard to apply during axe-core scans
      }
    }
  },
  {
    description: 'C130838	Overriding Axe-core version Configuration from GlobalConfigs',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      configurationOverrides: {
        axeCoreVersion: '4.8.0', // Specifies the version of axe-core to use
      }
    }
  },
  {
    description: 'C130839	Overriding Experimental Rules Configuration from GlobalConfigs(Enable/disable)',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      configurationOverrides: {
        experimentalRules: true // Enables or disables experimental axe-core rules
      }
    }
  },
  {
    description: 'C130840	Overriding Best-practice rules Configuration from GlobalConfigs(Enable/Disable)',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      configurationOverrides: {
        bestPractices: true // Enables or disables axe-core best practice rules
      }
    }
  }
];

describe('WebdriverIO: Axe Watcher with Global configurations overrides', () => {
  // Add feature and epic tags for the entire test suite
  before(() => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('wdio_excludeurls')
    process.env.GIT_BRANCH = 'wdio_excludeurls'
  })

  excludeURLs.forEach((configObj) => {
    describe(configObj.description, () => {
      before(async () => {
        browser = await remote(
          wdioConfig({
            axe: configObj.axe,
            capabilities: {
              browserName: 'chrome',
       'goog:chromeOptions': {
          args: ['--headless=new', '--no-sandbox'],
          /*
           * You can use the utility to get the Chrome binary path, including installing Chrome, if needed.
           * This can be overridden by setting CHROME_BIN in the environment variables.
           * If you do not specify a binary, the default Chrome installation will be used.
           * This may cause issues, as Watcher does not support branded Chrome >= 139.
           */
          binary: getChromeBinaryPath()
              }
            }
          }) as Capabilities.WebdriverIOConfig
        );
        controller = new WdioController(browser);
        wrapWdio(browser, controller);
      });

      afterEach(async () => {
        try {
          await controller.flush(); // ⚠️ Required to flush results to DevHub
        } catch (error) {
          console.error('Error occurred while flushing the results:', error);
        }
      });

      after(async () => {
        await browser.deleteSession();
        // Get the current git branch name to fetch results from that branch
        const currentBranch = getCurrentBranch()
        await verifyPagestateIssuesCount('excludeUrls', 'automation_WebdriverIO', currentBranch || undefined)
      });

      it('Navigate to Test page and check title', async () => {
        // Extract test ID from description
        const testId = configObj.description.split(' ')[0];

        
        await browser.url(data.testUrls.abcdPage);
      });
    });
  });
});