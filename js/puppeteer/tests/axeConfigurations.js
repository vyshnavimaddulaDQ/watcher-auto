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
const { verifyPagestateIssuesCount } = require('../../../utils/axeWatcherAPI')

require('dotenv').config({ path: '../../../.env' });

const API_KEY = config.gitMode
  ? process.env.PUPPETEER_API_KEY_GIT ?? 'PROVIDE API KEY!'
  : process.env.PUPPETEER_API_KEY_GITLESS ?? 'PROVIDE API KEY!'

const axeConfigurations = [
  {
    description: 'C130644 - RunOptions- RunOnly for single Rule',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      runOptions: {
        runOnly: {
          type: 'rule',
          values: ['color-contrast']
        }
      }
    }
  },
  {
    description: 'C130645 - RunOptions- RunOnly for multiple Rule',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      runOptions: {
        runOnly: {
          type: 'rule',
          values: ['color-contrast', 'label']
        }
      }
    }
  },
  {
    description: 'C130646-Disable certain rule',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      runOptions: {
        rules: {
          'color-contrast': { enabled: false }
        },
        ancestry: true
      }
    }
  },
  {
    description: 'C130647-Disable multiple rules',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      runOptions: {
        rules: {
          'color-contrast': { enabled: false },
          'label': { enabled: false }
        },
        ancestry: true
      }
    }
  },
  {
    description: 'C130648 - RunContext for exclude single element',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      runContext: {
        exclude: [['#wcag2aa-fail']]
      }
    }
  },
  {
    description: 'C130649 - RunContext for exclude multiple elements',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      runContext: {
        exclude: [['#wcag2aa-fail'], ['#wcag21aa-fail']]
      }
    }
  },
  {
    description: 'C130650 - RunContext for include single element',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      runContext: {
        include: [['#wcag2aa-fail']]
      }
    }
  },
  {
    description: 'C130651 - RunContext for include multiple elements',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      runContext: {
        include: [['#wcag2aa-fail'], ['#wcag21aa-fail']]
      }
    }
  },
  {
    description: 'C130652	RunOptions- RunOnly for single standard using tag',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      runOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag21aa']
        }
      }
    }
  },
  {
    description: 'C130653 - RunOptions- RunOnly for multiple standards using tag',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      runOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag21aa', 'wcag2aa']
        }
      }
    }
  }
]

describe('Puppeteer: Axe Watcher with Multiple Axe Configurations', function () {
  this.timeout(60000)
  axeConfigurations.forEach((configObj) => {
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
        await browser.close()
        await verifyPagestateIssuesCount('axeConfigs', 'automation_Puppeteer')
      })

      it('Navigate to Test page and check title', async () => {
        await page.goto('https://qateam.dequecloud.com/attest/api/test.html')
        const title = await page.title()
        expect(title).to.be.a('string')
      })
    })
  })
})