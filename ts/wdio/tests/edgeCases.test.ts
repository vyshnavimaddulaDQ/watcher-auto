import { expect } from 'chai';
import { testData as data } from '@resources/testData';
import { WdioController, wdioConfig, wrapWdio } from '@axe-core/watcher';
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

const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const globalBuildID = GITHUB_RUN_ID || `RUN-${Math.floor(Math.random() * 100000)}`;

//  Negative Test Configurations
const negativeAxeConfigs: {
  description: string;
  axe: Parameters<typeof wdioConfig>[0]['axe'];
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
      apiKey: process.env.WDIO_API_KEY_GIT || 'API_KEY',
      serverURL: '',
      buildID: globalBuildID
    },
    expectedError: 'URI is not absolute'
  },
  {
    description: 'C130875	Valdiate if providing an invalid server url provided ',
    axe: {
      apiKey: process.env.WDIO_API_KEY_GIT || 'API_KEY',
      serverURL: 'http://invalid:1234',
      buildID: globalBuildID
    },
    expectedError: 'Could not write to variables.json file'
  },
  {
    description: 'C130602	Validate if --headless and/or --incognito are passed via ChromeOptions ',
    axe: {
      apiKey: process.env.WDIO_API_KEY_GIT || 'API_KEY',
      serverURL: data.environment.domain,
      buildID: globalBuildID
    },
    expectedError: '@axe-core/watcher does not support fully headless mode',
    args: ['--headless']
  },
  {
    description: 'C130602	Validate if --headless and/or --incognito are passed via ChromeOptions ',
    axe: {
      apiKey: process.env.WDIO_API_KEY_GIT || 'API_KEY',
      serverURL: data.environment.domain,
      buildID: globalBuildID
    },
    expectedError: '@axe-core/watcher does not support fully headless mode',
    args: ['--headless']
  },
  {
    description: 'C130602	Validate if --headless and/or --incognito are passed via ChromeOptions ',
    axe: {
      apiKey: process.env.WDIO_API_KEY_GIT || 'API_KEY',
      serverURL: data.environment.domain,
      buildID: globalBuildID
    },
    expectedError: '@axe-core/watcher does not support incognito mode',
    args: ['--incognito']
  }
];

describe('WebdriverIO: Axe Watcher - Negative Test Scenarios', () => {
  // Add feature and epic tags for the entire test suite
  before(() => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('wdio_edgecases')
    process.env.GIT_BRANCH = 'wdio_edgecases'
  })

  negativeAxeConfigs.forEach(({ description, axe, expectedError, args }) => {
    it(description, async () => {
      // Extract test ID from description
      const testId = description.split(' ')[0];
      
      try {
        browser = await remote(
          wdioConfig({
            axe,
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

        await browser.url('https://abcdcomputech.dequecloud.com');
        await controller.flush();

        expect.fail('Expected error was not thrown');
      } catch (error: any) {
        expect(error.message).to.include(
          expectedError,
          `Expected error to contain "${expectedError}", but got "${error.message}"`
        );
        console.log(`Caught expected error: ${error.message}`);
      } finally {
        if (browser) {
          await browser.deleteSession();
        }
      }
    });
  });

});