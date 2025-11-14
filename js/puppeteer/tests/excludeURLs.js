const puppeteer = require('puppeteer')
const { expect, assert } = require('chai')
const { allure } = require('allure-mocha')
const { testData } = require('../resources/testData')
const {
  puppeteerConfig,
  PuppeteerController,
  wrapPuppeteerPage
} = require('@axe-core/watcher')
const { verifyPagestateIssuesCount } = require('../util/axeWatcherAPI')

const API_KEY = process.env.PUPPETEER_API_KEY_GIT ?? 'PROVIDE API KEY!'

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

describe('Puppeteer: Axe Watcher with Excluded URLs Configurations', function() {
  this.timeout(180000) // 3 minutes timeout
  
  excludeUrls.forEach((configObj) => {
    describe(configObj.description, function() {
      let testBrowser
      let testPage
      let testController

      before(async function() {
        this.timeout(60000) // 60 seconds for browser launch
        testBrowser = await puppeteer.launch(
          puppeteerConfig({
            axe: configObj.axe,
            headless: false,
            args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox']
          })
        )
      })

      beforeEach(async function() {
        this.timeout(30000)
        testPage = await testBrowser.newPage()
        testController = new PuppeteerController(testPage)
        testPage = wrapPuppeteerPage(testPage, testController)
      })

      afterEach(async function() {
        this.timeout(30000)
        if (testController) {
          await testController.flush()
        }
        if (testPage) {
          await testPage.close()
        }
      })

      after(async function() {
        this.timeout(30000)
        if (testBrowser) {
          await testBrowser.close()
        }
      })

      it('Navigate to Test page and check title', async function() {
        this.timeout(60000)
        await testPage.goto(testData.testUrls.abcdPage)
        await testPage.click(testData.configurationTestsValidations.abcdPageSelectors.laptopsAndNotebooks)
        await testPage.click(testData.configurationTestsValidations.abcdPageSelectors.desktops)
        await testPage.click(testData.configurationTestsValidations.abcdPageSelectors.cart)
        await testPage.click(testData.configurationTestsValidations.abcdPageSelectors.support)
        const title = await testPage.title()
        assert.equal(title, testData.testTitles.abcdPage)
      })
    })
  })
  
  after(async function() {
    this.timeout(300000) // 5 minutes for API validation
    await this.sleep(20000)
    await verifyPagestateIssuesCount('excludeUrls', 'automation_Puppeteer')
  })
})
