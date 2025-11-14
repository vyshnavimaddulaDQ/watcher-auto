const puppeteer = require('puppeteer')
const { expect } = require('chai')
const { allure } = require('allure-mocha')
const { testData } = require('../resources/testData')
const {
  puppeteerConfig,
  PuppeteerController,
  wrapPuppeteerPage
} = require('@axe-core/watcher')
const logger = require('../util/logger')
const { verifyPagestateIssuesCount } = require('../util/axeWatcherAPI')


const API_KEY = process.env.PUPPETEER_API_KEY_GIT ?? 'PROVIDE API KEY!'


const configureOverrides = [
  {
    description: 'C130659 Overriding Accessibility Standard Configuration from GlobalConfigs',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      configurationOverrides: {
        accessibilityStandard: 'WCAG 2.2 AAA'
      }
    }
  },
  {
    description: 'C130660 Overriding Axe-core version Configuration from GlobalConfigs',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      configurationOverrides: {
        axeCoreVersion: '4.8.0'
      }
    }
  },
  {
    description: 'C130661 Overriding Experimental Rules Configuration from GlobalConfigs(Enable/disable)',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      configurationOverrides: {
        experimentalRules: true
      }
    }
  },
  {
    description: 'C130662 Overriding Best-practice rules Configuration from GlobalConfigs(Enable/Disable)',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      configurationOverrides: {
        bestPractices: true
      }
    }
  }
]

describe('Puppeteer: Axe Watcher with Global configurations overrides', function() {
  this.timeout(180000) // 3 minutes timeout
  
  configureOverrides.forEach((configObj) => {
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
            args: [
              '--headless=new',
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--ignore-certificate-errors',
              '--ignore-ssl-errors'
            ]
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
        this.timeout(30000)
        await testPage.goto(testData.testUrls.abcdPage)
        const title = await testPage.title()
        expect(title).to.be.a('string')
      })
    })
  })
  
  after(async function() {
    this.timeout(300000) // 5 minutes for API validation
    await new Promise(resolve => setTimeout(resolve, 20000))
    await verifyPagestateIssuesCount('configOverride', 'automation_Puppeteer')
  })
})
