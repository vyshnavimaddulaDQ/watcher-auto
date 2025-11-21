const { Builder, By } = require('selenium-webdriver')
const {
  wrapWebdriver,
  webdriverConfig,
  WebdriverController
} = require('@axe-core/watcher')
const { Options } = require('selenium-webdriver/chrome')
const { testData: data } = require('../resources/testData')
const {
  getChromeBinaryPath
} = require('../util/setup-chrome-chromedriver')
const { verifyPagestateIssuesCount } = require('../util/axeWatcherAPI')
const { createAndSwitchToBranch, getCurrentBranch } = require('../util/gitBranchManager')
const API_KEY = process.env.WDJS_API_KEY_GIT ?? 'PROVIDE API KEY!'

  // ✅ Global unique build ID (reusable)
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const globalBuildID = GITHUB_RUN_ID || `RUN-${Math.floor(Math.random() * 100000)}`;

const axeConfigurations = [
  {
    description: 'C130837: Overriding Accessibility Standard Configuration from GlobalConfigs',
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
    description: 'C130838: Overriding Axe-core version Configuration from GlobalConfigs',
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
    description: 'C130839: Overriding Experimental Rules Configuration from GlobalConfigs(Enable/disable)',
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
    description: 'C130840: Overriding Best-practice Rules Configuration from GlobalConfigs(Enable/disable)',
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

describe('WebdriverJS: Axe Watcher with Configuration overrides', function () {
  this.timeout(60000);
  
  before(() => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('webdriverjs_configureoverrides')
    process.env.GIT_BRANCH = 'webdriverjs_configureoverrides'
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
        await verifyPagestateIssuesCount('configOverride', 'automation_WebdriverJS', currentBranch || undefined)
      });

       it('Abcd computech pages', async () => {
            await browser.get('https://abcdcomputech.dequecloud.com/')
              
          await browser.sleep(1000)
          })
    });
  });
});
