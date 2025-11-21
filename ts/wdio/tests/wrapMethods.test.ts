import { testData as data } from '../resources/testData';
import { testData } from '../resources/testData';
import { expect } from 'chai';
import 'mocha';
import fs from 'fs';    
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
const baseURL = data.testUrls.actions;
const API_KEY: string = process.env.WDIO_API_KEY_GIT ?? 'PROVIDE API KEY!';

// Helper timeout
const timeout = async (ms: number) => {
  await browser.pause(ms);
};

before(async () => {
  // Create and switch to git branch before running tests
  createAndSwitchToBranch('wdio_wrapmethods')
  process.env.GIT_BRANCH = 'wdio_wrapmethods'
  
  browser = await remote(
    wdioConfig({
      axe: {
        apiKey: API_KEY,
        serverURL: data.environment.domain
      },
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
});

beforeEach(async () => {
  controller = new WdioController(browser);
  wrapWdio(browser, controller);
  await browser.url(baseURL);
});

afterEach(async () => {
  try {
    await controller.flush();
  } catch (error) {
    console.error('Error occurred while flushing the results:', error);
  }
});

after(async () => {
  if (browser) {
    await browser.deleteSession();
  }
  // Get the current git branch name to fetch results from that branch
  const currentBranch = getCurrentBranch()
  await verifyPagestateIssuesCount('wrapMethods', 'automation_WebdriverIO', currentBranch || undefined)
});

describe('WebdriverIO: Wrap Methods Tests Validation', () => {
  // Add feature and epic tags for the entire test suite
  before(() => {
  })

  it('C130448 -Verify scan success and expected issues for wrap method click', async () => {
    await browser.url(baseURL);
    await browser.$('#login-form > button').click();
  });

  it('C130449 -Verify scan success and expected issues for wrap method hover', async () => {
    await browser.url(baseURL);
    await browser.$('#hover-button').moveTo();
  });

  it('C130450	Verify scan success and expected issues for wrap method type and fill() ', async () => {
    await browser.url(baseURL);
    await browser.$('input[name="username"]').setValue('username');
    await browser.$('input[name="password"]').setValue('password');
  });

  it('C130451	Verify scan success and expected issues for wrap method scroll ', async () => {
    await browser.url(baseURL);
    // Scroll the footer element into view
    await browser.$('#footer').scrollIntoView();
  });

  it('C130452	Verify scan success and expected issues for wrap method focus ', async () => {
    await browser.url(baseURL);
    await browser.$('#focus-input').click();
    await browser.$('#focus-input').click();
  });
});