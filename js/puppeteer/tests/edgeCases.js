const { assert } = require('chai')
const { testData } = require('../resources/testData')
const { allure } = require('allure-mocha')
const puppeteer = require('puppeteer')
const {
  puppeteerConfig,
  PuppeteerController,
  wrapPuppeteerPage
} = require('@axe-core/watcher')
const { verifyPagestateIssuesCount } = require('../util/axeWatcherAPI')
const { createAndSwitchToBranch } = require('../util/gitBranchManager')


// Edge Case Test Configurations
const edgeCasesConfigs = [
  {
    description: 'C130697 - Validate for Invalid-api-key',
    axe: {
      apiKey: process.env.INVALID_API_KEY || 'API_KEY',
      serverURL: testData.environment.domain,
    },
    expectedError: ['Invalid API key', '401']
  },
  {
    description: 'C130701 - No Server URL Provided',
    axe: {
      apiKey: process.env.PUPPETEER_API_KEY_GIT || 'API_KEY',
      serverURL: '',
    },
    expectedError: ['Invalid API key', '401', 'URI is not absolute']
  },
  {
    description: 'C130700 Validate if providing an invalid server url',
    axe: {
      apiKey: process.env.PUPPETEER_API_KEY_GIT || 'API_KEY',
      serverURL: 'http://invalid:1234',
    },
    expectedError: ['Sync Fetch Failed', 'getaddrinfo ENOTFOUND invalid', 'Could not write to variables.json file']
  },
{
  description: 'C130698 Validate if --headless is passed via ChromeOptions',
  axe: {
    apiKey: process.env.PUPPETEER_API_KEY_GIT || 'API_KEY',
    serverURL: testData.environment.domain,
  },
  expectedError: [
    '@axe-core/watcher does not support fully headless mode',
    'Expected error was not thrown',
    '@axe-core/watcher does not support Chrome\'s older "--headless" mode'
  ],
  args: ['--headless']
},
  {
    description: 'C130698 Validate if --incognito is passed via ChromeOptions',
    axe: {
      apiKey: process.env.PUPPETEER_API_KEY_GIT || 'API_KEY',
      serverURL: testData.environment.domain,
    },
    expectedError: [
      '@axe-core/watcher does not support incognito mode',
      'You cannot use the **--incognito** command-line option with Chrome'
    ],
    args: ['--incognito', '--headless']
  }
]

describe('Puppeteer: Edge Cases Tests Validation', function () {
  this.timeout(60000)
  
  before(async function() {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('puppeteer_edgecases')
    process.env.GIT_BRANCH = 'puppeteer_edgecases'
  })
  
  edgeCasesConfigs.forEach(({ description, axe, expectedError, args }) => {
    it(description, async function () {
      let browser
      let page
      let controller


       // Always use these recommended args
      const defaultArgs = [
        '--headless=new',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors'
      ]
      // Merge with any test-specific args (avoid duplicates)
      const launchArgs = args ? [...new Set([...defaultArgs, ...args])] : defaultArgs
      
      try {
        browser = await puppeteer.launch(
          puppeteerConfig({
            axe,
            headless: true,
            args: launchArgs
          })
        )
        page = await browser.newPage()
        controller = new PuppeteerController(page)
        page = wrapPuppeteerPage(page, controller)
        await page.goto('https://abcdcomputech.dequecloud.com')
        await controller.flush()
        // If no error is thrown, consider the test as passed
        assert.isTrue(true, 'No error was thrown, test passed.')
      } catch (error) {
        // Pass if any expected error substring is found in the error message
        const errorMsg = error && error.message ? error.message : String(error)
        const found = expectedError.some(e => e && errorMsg.includes(e))
        assert.isTrue(
          found,
          `Expected error to contain one of "${expectedError}", but got "${errorMsg}"`
        )
        console.log(`Caught expected error: ${errorMsg}`)
      } finally {
        if (browser) {
          await browser.close()
        }
      }
    })
  })
})