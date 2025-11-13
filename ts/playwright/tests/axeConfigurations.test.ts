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
// List of Axe configurations (mimicking Java DataProvider behavior)
const axeConfigurations: {
  description: string;
  axe: Parameters<typeof playwrightConfig>[0]['axe'];
}[] = [
    {
    description: 'C130434 - RunOptions- RunOnly for single Rule',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
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
    description: 'C130435 - RunOptions- RunOnly for multiple Rule',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: {
          type: 'rule' as const,
          values: ['color-contrast' , 'label']
        }
      }
    }
  },
  {
    description: 'C130436-Disable certain rule',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
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
    description: 'C130437-Disable multiple rules',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
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
    description: 'C130438 - RunContext for exclude single element',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      buildID: globalBuildID,
      runContext: {
        exclude: [['#wcag2aa-fail']]
      }
    }
  },
  {
    description: 'C130439 - RunContext for exclude multiple elements',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
       buildID: globalBuildID,
      runContext: {
        exclude: [['#wcag2aa-fail'], ['#wcag21aa-fail']]
      }
        
    }
  },
  {
    description: 'C130440 - RunContext for include single element',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
       buildID: globalBuildID,
      runContext: {
        include: [['#wcag2aa-fail']]
      }
    }
  },
  {
    description: 'C130441 - RunContext for include multiple elements',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
       buildID: globalBuildID,
      runContext: {
        include: [['#wcag2aa-fail'], ['#wcag21aa-fail']]
      }
     }
  },
  {
    description: 'C130442	RunOptions- RunOnly for single standard using tag',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      buildID: "globalBuildID",
      runOptions: {
        runOnly: {
          type: 'tag' as const,
          values: ['wcag21aa']
        }
      }
    }
  },
  {
    description: 'C130443 - RunOptions- RunOnly for multiple standards using tag',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      buildID: "globalBuildID",
      runOptions: {
        runOnly: {
          type: 'tag' as const,
          values: ['wcag21aa', 'wcag2aa']
        }
      }
    }
  }
];

describe('Playwright: Axe Watcher with Multiple Configurations', () => {
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
        await page.goto('https://qateam.dequecloud.com/attest/api/test.html');
      });
    });
  });
  
  after(async () => {
    try {
      await verifyPagestateIssuesCount('axeConfigs', 'automation_Playwright')
    } catch (error) {
      console.error('Error in API validation:', error)
      throw error
    }
  });
});
