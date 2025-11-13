const puppeteer = require('puppeteer')
const { expect, assert } = require('chai')
const { allure } = require('allure-mocha')
const { testData } = require('../../../resources/testData')
const { config } = require('../../../global/config')
const {
  puppeteerConfig,
  PuppeteerController,
  wrapPuppeteerPage
} = require('@axe-core/watcher')
const { verifyPagestateIssuesCount } = require('../../../utils/axeWatcherAPI')
require('dotenv').config()

const API_KEY = config.gitMode
  ? process.env.PUPPETEER_API_KEY_GIT ?? 'PROVIDE API KEY!'
  : process.env.PUPPETEER_API_KEY_GITLESS ?? 'PROVIDE API KEY!'

const excludeUrls = [
  {
    description: 'C130637 Exclude certain URL from the list of urls',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com/support.php']
    }
  },
  {
    description: 'C130638 Exclude more than one URL from the list of urls',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: [
        '**/laptopsandnotebooks.php',
        '**/desktops.php',
        '**/support.php'
      ]
    }
  },
  {
    description: 'C130639 When ExcludeUrl pattern uses empty string value',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['']
    }
  },
  {
    description: 'C130640 Excluding same page URL multiple times',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com/*.*']
    }
  },
  {
    description: 'C130643 When excluding all the other pages using `**.*`',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['**/*.*']
    }
  },
  {
    description: 'C130642 When ExcludeUrl pattern uses non url pattern',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['Google Page']
    }
  }
]

describe('Puppeteer: Axe Watcher with Excluded URLs Configurations', function () {
  this.timeout(60000)
  excludeUrls.forEach((configObj) => {
    describe(configObj.description, () => {
      let browser
      let page
      let controller

      before(async () => {
        browser = await puppeteer.launch(
          puppeteerConfig({
            axe: configObj.axe,
            headless: false,
             args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox']
          })
        )
      })

      beforeEach(async () => {
        page = await browser.newPage()
        controller = new PuppeteerController(page)
        page = wrapPuppeteerPage(page, controller)
      })

      afterEach(async () => {
        await controller.flush()
        await page.close()
      })

      after(async () => {
        if (browser) {
          await browser.close()
        }
        await verifyPagestateIssuesCount('excludeUrls', 'automation_Puppeteer')
      })

      it('Navigate to Test page and check title', async () => {
        await page.goto(testData.testUrls.abcdPage)
        await page.click(testData.configurationTestsValidations.abcdPageSelectors.laptopsAndNotebooks)
        await page.click(testData.configurationTestsValidations.abcdPageSelectors.desktops)
        await page.click(testData.configurationTestsValidations.abcdPageSelectors.cart)
        await page.click(testData.configurationTestsValidations.abcdPageSelectors.support)
        const title = await page.title()
        assert.equal(title, testData.testTitles.abcdPage)
      })
    })
})
})
