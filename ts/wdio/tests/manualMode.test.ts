import { testData as data } from '@resources/testData';
import { testData } from '@resources/testData';
import { expect } from 'chai';
import 'mocha';
import { wdioConfig, WdioController, wrapWdio } from '@axe-core/watcher';
import { remote } from 'webdriverio';
import 'dotenv/config';
import type { Capabilities } from '@wdio/types'
import {
  getChromeBinaryPath,
  getChromedriverBinaryPath
} from 'utils/setup-chrome-chromedriver'
import { verifyPagestateIssuesCount } from 'utils/axeWatcherAPI'
import { createAndSwitchToBranch, getCurrentBranch } from 'utils/gitBranchManager'
let browser: WebdriverIO.Browser;
let controller: WdioController;

const API_KEY: string = process.env.WDIO_API_KEY_GIT ?? 'PROVIDE API KEY!';

before(async () => {
  // Create and switch to git branch before running tests
  createAndSwitchToBranch('wdio_manualmode')
  process.env.GIT_BRANCH = 'wdio_manualmode'
  
  browser = await remote(
    wdioConfig({
      axe: {
        apiKey: API_KEY,
        serverURL: data.environment.domain,
        autoAnalyze: false // Set to false for Manual Mode
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
  // Create a page instance, using your browser context.
  // Initialize the WdioController by passing in the WebdriverIO browser.
  controller = new WdioController(browser);

  // Use the new wrapped WebdriverIO browser instance.
  wrapWdio(browser, controller);
});

afterEach(async () => {
  try {
    await controller.flush();
  } catch (error) {
    console.error('Error occurred while flushing the results:', error);
  }
});

after(async () => {
  await browser.deleteSession();
  // Get the current git branch name to fetch results from that branch
  const currentBranch = getCurrentBranch()
  await verifyPagestateIssuesCount('manualMode', 'automation_WebdriverIO', currentBranch || undefined)
});

describe('WebdriverIO: Manual Mode Tests Validation', () => {
  // Add feature and epic tags for the entire test suite
  before(() => {
  })

  it('C130808	Verify zero findings in scan results when no Analyze() API is called ', async () => {
    await browser.url('https://abcdcomputech.dequecloud.com');
  });

  it('C130809	Verify findings in scan results when single Analyze() API is called ', async () => {
    await browser.url('https://abcdcomputech.dequecloud.com');
    await controller.analyze();
  });

  it('C130810	Verify number of pagestates in scan results for Analyze() API invoked number of times  ', async () => {
    await browser.url('https://abcdcomputech.dequecloud.com');
    await controller.analyze();
    await controller.analyze();
    await controller.analyze();
  });

  it('C130811	Verify findings in scan results when Start() and Stop() APIs are called once', async () => {
    await controller.start();
    await browser.url('https://abcdcomputech.dequecloud.com');
    await controller.stop();
  });

  it('C130814	Verify findings in scan results when multiple Start() and Stop() APIs are called once ', async () => {
    await controller.start();
    await browser.url('https://abcdcomputech.dequecloud.com');
    await controller.stop();
    await controller.start();
    await controller.stop();
  });

  it('C130812	Verify findings in scan results when Start() and Stop() APIs are called multiple times ', async () => {
    await controller.start();
    // Navigate to the target URL
    await browser.url('https://abcdcomputech.dequecloud.com');
    await browser.waitUntil(async () => {
      const state = await browser.execute(() => document.readyState);
      return state === 'complete';
    });
    await controller.stop();
    
    // Perform click actions on top navigation links
    await browser.$('#topnav > ul > li:nth-child(5) > a').click();
    await controller.start();
    await controller.stop();
    await controller.start();
    await controller.stop();
    await browser.$('#topnav > ul > li:nth-child(2) > a').click();
    await browser.$('#topnav > ul > li:nth-child(3) > a').click();
  });

  it('C130813	Verify findings in scan results when Analyze() is called between multiple Start() and Stop() APIs  ', async () => {
    await controller.start();
    // Navigate to the target URL
    await browser.url('https://abcdcomputech.dequecloud.com');
    await controller.stop();
    
    // Perform click actions on top navigation links
    await browser.$('#topnav > ul > li:nth-child(5) > a').click();
    await controller.start();
    await browser.$('#topnav > ul > li:nth-child(4) > a').click();
    await controller.analyze();
    await controller.stop();
    await browser.$('#topnav > ul > li:nth-child(3) > a').click();
    await browser.$('#topnav > ul > li:nth-child(2) > a').click();
    await controller.start();
    await controller.analyze();
    await controller.stop();
    await controller.start();
    await controller.analyze();
    await controller.stop();
  });
});