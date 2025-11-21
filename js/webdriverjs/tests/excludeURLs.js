const { Builder, By } = require('selenium-webdriver')

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
const { verifyPagestateIssuesCount } = require('../util/axeWatcherAPI')
const { createAndSwitchToBranch, getCurrentBranch } = require('../util/gitBranchManager')
const API_KEY = process.env.WDJS_API_KEY_GIT ?? 'PROVIDE API KEY!'


// ✅ Global unique build ID (reusable)
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const globalBuildID = GITHUB_RUN_ID || `RUN-${Math.floor(Math.random() * 100000)}`;

const axeConfigurations = [
  {
    description: '	C130726: Exclude certain URL from the list of urls',
    axe: {
     apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com/support.php']
    }
  },
  {
    description: '	C130727: Exclude more than one URL from the list of urls',
    axe: {
     apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: [
            '**/laptopsandnotebooks.php',
            '**/desktops.php',
            '**/support.php'
          ]
    }
  },
  {
    description: 'C130729: When ExcludeUrl pattern uses empty string value',
    axe: {
    apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: ['']
    }
  },
  {
    description: 'C130731: Excluding same page URL multiple times',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com/*.*' , 'http://abcdcomputech.dequecloud.com/']
    }
  },
  {
    description: 'C130732: When excluding all the other pages using `**.*`',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
       excludeUrlPatterns: ['**/*.*']
    }
  },
  {
    description: 'C130728: Exclude non url pattern',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
       excludeUrlPatterns: ['Google Page']
    }
  }
  
  
  
];

describe('WebdriverJS: Axe Watcher with Exclude URLs Configurations', function () {
  this.timeout(60000);
  
  before(() => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('webdriverjs_excludeurls')
    process.env.GIT_BRANCH = 'webdriverjs_excludeurls'
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
        await verifyPagestateIssuesCount('excludeUrls', 'automation_WebdriverJS', currentBranch || undefined)
        });

       it('Abcd computech pages', async () => {
            await browser.get('https://abcdcomputech.dequecloud.com/')
              await (await browser.findElement(By.css('#topnav > ul > li:nth-child(5) > a'))).click()
          await browser.sleep(1000)
           await (await browser.findElement(By.css('#topnav > ul > li:nth-child(4) > a'))).click()
          await browser.sleep(1000)
          await (await browser.findElement(By.css('#topnav > ul > li:nth-child(2) > a'))).click()
          await browser.sleep(1000)
      
          await (await browser.findElement(By.css('#topnav > ul > li:nth-child(3) > a'))).click()
          await browser.sleep(1000)
          })
    });
  });
});
