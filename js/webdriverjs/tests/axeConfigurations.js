const { Builder } = require('selenium-webdriver')
const { verifyPagestateIssuesCount } = require('../util/axeWatcherAPI')
const {
  webdriverConfig,
  WebdriverController,
  wrapWebdriver
} = require('@axe-core/watcher');
const { Options } = require('selenium-webdriver/chrome')
const { testData: data } = require('../resources/testData')
const {
  getChromeBinaryPath
} = require('../util/setup-chrome-chromedriver')
const { createAndSwitchToBranch, getCurrentBranch } = require('../util/gitBranchManager')

const API_KEY = process.env.WDJS_API_KEY_GIT ?? 'PROVIDE API KEY!'

// ✅ Global unique build ID (reusable)
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const globalBuildID = GITHUB_RUN_ID || `RUN-${Math.floor(Math.random() * 100000)}`;

const axeConfigurations = [
  {
    description: 'C130733: RunOptions- RunOnly for single Rule',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: {
          type: 'rule',
          values: ['color-contrast']
        }
      }
    }
  },
  {
    description: 'C130734: RunOptions- RunOnly for multiple Rule',
    axe: {
     apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: {
          type: 'rule',
          values: ['color-contrast', 'label']
        }
      }
    }
  },
  {
    description: 'C130735: Disable certain rule',
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
    description: 'C130736: Disable multiple rules',
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
    description: 'C130737: RunContext for exclude single element',
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
    description: 'C130738: RunContext for exclude multiple elements',
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
    description: 'C130739: RunContext for include single element',
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
    description: 'C130740: RunContext for include multiple elements',
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
    description: 'C130741: RunOptions- RunOnly for single standard using tag',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag21aa']
        }
      }
    }
  },
  {
    description: 'C130742: RunOptions- RunOnly for multiple standards using tag',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag21aa', 'wcag2aa']
        }
      }
    }
  }
];

describe('WebdriverJS: Axe Watcher with Multiple Axe Configurations', function () {
  this.timeout(60000);
  
  before(() => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('webdriverjs_axeconfigurations')
    process.env.GIT_BRANCH = 'webdriverjs_axeconfigurations'
  })
  
  axeConfigurations.forEach((configObj) => {
    describe(configObj.description, () => {
      let browser;
      let controller;

      before(async () => {
        const options = new Options()
            options.addArguments('--headless=new')
            const chromeBinaryPath = getChromeBinaryPath()
            if (chromeBinaryPath) {
              options.setBinaryPath(chromeBinaryPath)
            }
        browser = await new Builder()
          .forBrowser('chrome')
          .setChromeOptions(
            webdriverConfig({
              axe: configObj.axe,
              headless: false,
              args: ['--headless=new']
            })
          )
          .build();
        controller = new WebdriverController(browser);
        browser = wrapWebdriver(browser, controller);
      });

      afterEach(async () => {
        await controller.flush();
      });

      after(async () => {
        await browser.quit();
        // Get the current git branch name to fetch results from that branch
        const currentBranch = getCurrentBranch()
        await verifyPagestateIssuesCount('axeConfigs', 'automation_WebdriverJS', currentBranch || undefined)
      });

      it('Navigate to Test page and check title', async () => {
        await browser.get('https://qateam.dequecloud.com/attest/api/test.html');
       
      });
    });
  });
});
