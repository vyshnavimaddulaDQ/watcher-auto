import { assert } from 'chai';
import { testData as data } from '@resources/testData';
import { allure } from 'allure-playwright';
import { PlaywrightController, playwrightConfig, wrapPlaywrightPage } from '@axe-core/watcher';
import playwright from 'playwright';
import 'dotenv/config';

let page: playwright.Page;
let browserContext: playwright.BrowserContext;
let controller: PlaywrightController;

const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const globalBuildID = GITHUB_RUN_ID || `RUN-${Math.floor(Math.random() * 100000)}`;

//  Negative Test Configurations
const negativeAxeConfigs: {
  description: string;
  axe: Parameters<typeof playwrightConfig>[0]['axe'];
  expectedError: string;
  args?: string[];
}[] = [
  // {
  //   description: 'C130601	Validate for Invalid-api-key ',
  //   axe: {
  //     apiKey: 'INVALID_API_KEY',
  //     serverURL: data.environment.domain,
  //     buildID: globalBuildID
  //   },
  //   expectedError: '{"error":"Invalid API key"}'
  // },
  {
    description: 'C129409 - No Server URL Provided',
    axe: {
      apiKey: process.env.PLAYWRIGHT_API_KEY_GIT || 'API_KEY',
      serverURL: '',
      buildID: globalBuildID
    },
    expectedError: 'URI is not absolute'
  },
  {
    description: 'C130604	Valdiate if providing an invalid server url provided ',
    axe: {
      apiKey: process.env.PLAYWRIGHT_API_KEY_GIT || 'API_KEY',
      serverURL: 'http://invalid:1234',
      buildID: globalBuildID
    },
    expectedError: 'Could not write to variables.json file'
  },
  {
    description: 'C130602	Validate if --headless and/or --incognito are passed via ChromeOptions ',
    axe: {
      apiKey: process.env.PLAYWRIGHT_API_KEY_GIT || 'API_KEY',
      serverURL: data.environment.domain,
      buildID: globalBuildID
    },
    expectedError: '@axe-core/watcher does not support fully headless mode',
    args: ['--headless']
  },
  {
    description: 'C130602	Validate if --headless and/or --incognito are passed via ChromeOptions ',
    axe: {
      apiKey: process.env.PLAYWRIGHT_API_KEY_GIT || 'API_KEY',
      serverURL: data.environment.domain,
      buildID: globalBuildID
    },
    expectedError: '@axe-core/watcher does not support fully headless mode',
    args: ['--headless']
  },
  {
    description: 'C130602	Validate if --headless and/or --incognito are passed via ChromeOptions ',
    axe: {
      apiKey: process.env.PLAYWRIGHT_API_KEY_GIT || 'API_KEY',
      serverURL: data.environment.domain,
      buildID: globalBuildID
    },
    expectedError: '@axe-core/watcher does not support incognito mode',
    args: ['--incognito']
  }
];

describe('Playwright: Edge Cases Tests Validation', () => {
  negativeAxeConfigs.forEach(({ description, axe, expectedError, args }) => {
    it(description, async () => {
      try {
        browserContext = await playwright.chromium.launchPersistentContext(
          '',
          playwrightConfig({
            axe,
            headless: false,
            args: args ?? []
          })
        );

        page = await browserContext.newPage();
        controller = new PlaywrightController(page);
        page = wrapPlaywrightPage(page, controller);

        await page.goto('https://abcdcomputech.dequecloud.com');
        await controller.flush();

        assert.fail('Expected error was not thrown');
      } catch (error: any) {
        assert.include(
          error.message,
          expectedError,
          `Expected error to contain "${expectedError}", but got "${error.message}"`
        );
        console.log(`Caught expected error: ${error.message}`);
      } finally {
        await browserContext?.close();
      }
    });
  });
});
