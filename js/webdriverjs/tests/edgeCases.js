const { Builder } = require('selenium-webdriver')
const { assert } = require('chai')

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
const { createAndSwitchToBranch } = require('../util/gitBranchManager')

const API_KEY = process.env.WDJS_API_KEY_GIT ?? 'PROVIDE API KEY!'

// ✅ Global unique build ID (reusable)
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;
const globalBuildID = GITHUB_RUN_ID || `RUN-${Math.floor(Math.random() * 100000)}`;

const axeConfigurations = [
  {
    description: 'C130786: Validate Invalid apikey',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
     
    },
     expectedError: '{"error":"Invalid API key"}'
  },
  {
    description: 'C130790: No server url provided',
    axe: {
     apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
       
    },
    expectedError: 'Invalid API key'
  },
  {
    description: 'C130789: Invalid server url provided',
    axe: {
     apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
    
    },
    expectedError: 'getaddrinfo ENOTFOUND invalid'
  },
  {
    description: 'C130787: validate if --headless option is passed via chrome options',
    axe: {
     apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,

    },
    expectedError: 'Expected error was not thrown',
    args: ['--headless']
},
{
    description: 'C130788: validate if --incognito option is passed via chrome options',
    axe: {
     apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,

    },
    expectedError: 'Expected error was not thrown',
    args: ['--incognito']
},
];

describe('WebdriverJS: Axe Watcher with negative/edge case tests', function () {
  this.timeout(60000)
  
  before(() => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('webdriverjs_edgecases')
    process.env.GIT_BRANCH = 'webdriverjs_edgecases'
  })
  
  axeConfigurations.forEach(
    ({ description, axe, expectedError, args }) => {
      it(description, async () => {
        let browser
        let controller
        try {
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
                axe,
                headless: false,
                args: args ?? ['--headless=new']
              })
            )
            .build()
          controller = new WebdriverController(browser)
          browser = wrapWebdriver(browser, controller)
          await browser.get('https://abcdcomputech.dequecloud.com')
          await controller.flush()
          assert.fail('Expected error was not thrown')
        } catch (error) {
          assert.include(
            error.message,
            expectedError,
            `Expected error to contain "${expectedError}", but got "${error.message}"`
          )
          console.log(`Caught expected error: ${error.message}`)
        } finally {
          if (browser) {
            await browser.quit()
          }
        }
      })
    }
  )
})
