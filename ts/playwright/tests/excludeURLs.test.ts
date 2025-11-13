import { testData as data } from '@resources/testData';
import { testData } from '@resources/testData';
import { assert } from 'chai';
import { allure } from 'allure-playwright';
import { config } from '@global/config';
import 'mocha';
import type { RunOnly } from 'axe-core';
import playwright from 'playwright';
import {
  playwrightConfig,
  PlaywrightController,
  wrapPlaywrightPage
} from '@axe-core/watcher';
import 'dotenv/config';
import { verifyPagestateIssuesCount } from 'utils/axeWatcherAPI';

let page: playwright.Page;
let browserContext: playwright.BrowserContext;
let controller: PlaywrightController;

const API_KEY: string = config.gitMode
  ? process.env.PLAYWRIGHT_API_KEY_GIT ?? 'PROVIDE API KEY!'
  : process.env.PLAYWRIGHT_API_KEY_GITLESS ?? 'PROVIDE API KEY!';
// ✅ Global unique build ID (reusable)
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const globalBuildID = GITHUB_RUN_ID || `RUN-${Math.floor(Math.random() * 100000)}`;
console.log("globalBuildID:", globalBuildID);
// List of Axe configurations (mimicking Java DataProvider behavior)
const axeConfigurations: {
  description: string;
  axe: Parameters<typeof playwrightConfig>[0]['axe'];
}[] = [
     {
        description: 'C130427	Exclude certain URL from the list of urls',
        axe: {
          apiKey: API_KEY,
          serverURL: testData.environment.domain,
          buildID: globalBuildID,
          excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com/support.php']
        }
      },
      {
        description: 'C130428	Exclude more than one URL from the list of urls ',
        axe: {
          apiKey: API_KEY,
          serverURL: testData.environment.domain,
          buildID: globalBuildID,
            excludeUrlPatterns: [
            '**/laptopsandnotebooks.php',
            '**/desktops.php',
            '**/support.php'
          ]
        }
      },
  {
    description: 'C130430	When ExcludeUrl pattern uses empty string value',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      buildID: globalBuildID,
        excludeUrlPatterns: ['']
    }
  },
  {
    description: 'C130432	Excluding same page URL multiple times ',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com/*.*']
    }
  },
  {
    description: 'C130433	When excluding all the other pages using `**.*`',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      
        excludeUrlPatterns: ['**/*.*']
    }
  },
  {
    description: 'C130429	When ExcludeUrl pattern uses non url pattern',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
       buildID: globalBuildID,
        excludeUrlPatterns: ['Google Page']
    }
  }
  
];

describe('Playwright: Axe Watcher with Excluded URLs Configurations', () => {
  axeConfigurations.forEach((configObj) => {
    describe(configObj.description, () => {
      before(async () => {
        browserContext = await playwright.chromium.launchPersistentContext(
          '',
          playwrightConfig({
            axe: configObj.axe,
            headless: false,
            args: ['--headless=new']
          })
        );
      });

      beforeEach(async () => {
        page = await browserContext.newPage();
        controller = new PlaywrightController(page);
        page = wrapPlaywrightPage(page, controller);
      });

      afterEach(async () => {
        await controller.flush(); // ⚠️ Required to flush results to DevHub
        if (page && !page.isClosed()) {
          await page.close();
        }
      });

      after(async () => {
        if (browserContext) {
          await browserContext.close();
        }
      });

      it('Navigate to Test page and check title', async () => {
        await page.goto(testData.testUrls.abcdPage)
        await page.click(testData.configurationTestsValidations.abcdPageSelectors.laptopsAndNotebooks);
        await page.click(testData.configurationTestsValidations.abcdPageSelectors.desktops);
        await page.click(testData.configurationTestsValidations.abcdPageSelectors.cart);
        await page.click(testData.configurationTestsValidations.abcdPageSelectors.support);
        var title = await page.title()
        assert.equal(title, testData.testTitles.abcdPage)
      });
    });
  });
  
  after(async () => {
    try {
      await verifyPagestateIssuesCount('excludeUrls', 'automation_Playwright')
    } catch (error) {
      console.error('Error in API validation:', error)
      throw error
    }
  });
});
  