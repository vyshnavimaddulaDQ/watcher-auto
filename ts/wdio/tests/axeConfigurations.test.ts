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

// List of Axe configurations (mimicking Java DataProvider behavior)
const axeConfigurations: {
  description: string;
  axe: Parameters<typeof wdioConfig>[0]['axe'];
}[] = [
  {
    description: 'C130822 - RunOptions- RunOnly for single Rule',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: {
          type: 'rule' as const,
          values: ['color-contrast']
        }
      }
    }
  },
  {
    description: 'C130823 - RunOptions- RunOnly for multiple Rule',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: {
          type: 'rule' as const,
          values: ['color-contrast', 'label']
        }
      }
    }
  },
  {
    description: 'C130824-Disable certain rule',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        rules: {
          'color-contrast': { enabled: false }
        },
        ancestry: true
      }
    }
  },
  {
    description: 'C130825-Disable multiple rules',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        rules: {
          'color-contrast': { enabled: false },
          'label': { enabled: false }
        },
        ancestry: true
      }
    }
  },
  {
    description: 'C130826 - RunContext for exclude single element',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runContext: {
        exclude: [['#wcag2aa-fail']]
      }
    }
  },
  {
    description: 'C130827 - RunContext for exclude multiple elements',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runContext: {
        exclude: [['#wcag2aa-fail'], ['#wcag21aa-fail']]
      }
    }
  },
  {
    description: 'C130828 - RunContext for include single element',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runContext: {
        include: [['#wcag2aa-fail']]
      }
    }
  },
  {
    description: 'C130829 - RunContext for include multiple elements',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runContext: {
        include: [['#wcag2aa-fail'], ['#wcag21aa-fail']]
      }
    }
  },
  {
    description: 'C130830	RunOptions- RunOnly for single standard using tag',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: {
          type: 'tag' as const,
          values: ['wcag21aa']
        }
      }
    }
  },
  {
    description: 'C130831 - RunOptions- RunOnly for multiple standards using tag',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: {
          type: 'tag' as const,
          values: ['wcag21aa', 'wcag2aa']
        }
      }
    }
  }
];

describe('WebdriverIO: Axe Watcher with Multiple Configurations', () => {
  // Add feature and epic tags for the entire test suite
  before(() => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('wdio_axeconfigurations')
    process.env.GIT_BRANCH = 'wdio_axeconfigurations'
  })

  axeConfigurations.forEach((configObj) => {
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
          })as Capabilities.WebdriverIOConfig
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
        await verifyPagestateIssuesCount('axeConfigs', 'automation_WebdriverIO', currentBranch || undefined)
      });

      it('Navigate to Test page and check title', async () => {
        // Extract test ID from description
        const testId = configObj.description.split(' ')[0];
        await browser.url('https://qateam.dequecloud.com/attest/api/test.html');
      });
    });
  });
});