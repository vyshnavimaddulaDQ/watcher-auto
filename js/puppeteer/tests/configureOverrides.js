const puppeteer = require('puppeteer')
const { expect } = require('chai')
const { allure } = require('allure-mocha')
const { testData } = require('../../../resources/testData')
const { config } = require('../../../global/config')
const {
  puppeteerConfig,
  PuppeteerController,
  wrapPuppeteerPage
} = require('@axe-core/watcher')
const { default: logger } = require('../../../global/logger')
const { verifyPagestateIssuesCount } = require('../../../utils/axeWatcherAPI')
require('dotenv').config()

const API_KEY = config.gitMode
  ? process.env.PUPPETEER_API_KEY_GIT ?? 'PROVIDE API KEY!'
  : process.env.PUPPETEER_API_KEY_GITLESS ?? 'PROVIDE API KEY!'


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

describe('Puppeteer: Axe Watcher with Global configurations overrides', function () {
  this.timeout(60000)
  configureOverrides.forEach((configObj) => {
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
        await verifyPagestateIssuesCount('configOverride', 'automation_Puppeteer')
      })

      it('Navigate to Test page and check title', async () => {
        await page.goto(testData.testUrls.abcdPage)
        const title = await page.title()
        expect(title).to.be.a('string')
      })
    })
  })
  })
