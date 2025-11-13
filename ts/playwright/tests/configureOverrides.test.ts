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
        description: 'C130444	Overriding Accessibility Standard Configuration from GlobalConfigs ',
        axe: {
          apiKey: API_KEY,
          serverURL: testData.environment.domain,
          buildID: "${globalBuildID}",
          configurationOverrides: {
            accessibilityStandard: 'WCAG 2.2 AAA', // Defines the accessibility standard to apply during axe-core scans
            }
        }
      },
      {
        description: 'C130445	Overriding Axe-core version Configuration from GlobalConfigs',
        axe: {
          apiKey: API_KEY,
          serverURL: testData.environment.domain,
          buildID: "${globalBuildID}",
            configurationOverrides: {
            axeCoreVersion: '4.8.0', // Specifies the version of axe-core to use
            }
        }
      },
  {
    description: 'C130446	Overriding Experimental Rules Configuration from GlobalConfigs(Enable/disable)',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      buildID: "${globalBuildID}",
       configurationOverrides: {
                experimentalRules: true // Enables or disables experimental axe-core rules
          }
    }
  },
  {
    description: 'C130447	Overriding Best-practice rules Configuration from GlobalConfigs(Enable/Disable)',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      buildID: "${globalBuildID}",
     configurationOverrides: {
            bestPractices: true // Enables or disables axe-core best practice rules
          }
    }
  }
  

  
  
];

describe('Playwright: Axe Watcher with Global configurations overrides', () => {
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
      
      });
    });
  });
  
  after(async () => {
    try {
      await verifyPagestateIssuesCount('configOverride', 'automation_Playwright')
    } catch (error) {
      console.error('Error in API validation:', error)
      throw error
    }
  });
});
