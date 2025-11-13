const puppeteer = require('puppeteer')
const { assert } = require('chai')
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

let browser
let page
let controller
const baseURL = testData.testUrls.actions

const API_KEY = config.gitMode
  ? process.env.PUPPETEER_API_KEY_GIT ?? 'PROVIDE API KEY!'
  : process.env.PUPPETEER_API_KEY_GITLESS ?? 'PROVIDE API KEY!'

// Helper timeout
const timeout = async (ms) => {
  await page.waitForTimeout(ms)
}
describe('Puppeteer: Wrap Methods Tests Validation', function () {

before(async () => {
  browser = await puppeteer.launch(
    puppeteerConfig({
      axe: {
        apiKey: API_KEY,
        serverURL: testData.environment.domain
      },
      headless: false,
       args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox']
    })
  )
})

beforeEach(async () => {
  page = await browser.newPage()
  controller = new PuppeteerController(page)
  page = wrapPuppeteerPage(page, controller)
  await page.goto(baseURL)
})

afterEach(async () => {
  await controller.flush()
  if (page) {
    await page.close()
  }
})

after(async () => {
  if (browser) {
    await browser.close()
  }
  await verifyPagestateIssuesCount('wrapMethods', 'automation_Puppeteer')
})

describe('Puppeteer: Wrap Methods Tests Validation', function () {
  this.timeout(60000)

  it('C130666 - Verify scan success and expected issues for wrap method click', async () => {
    await page.goto(baseURL)
    await page.click('#login-form > button')
  })

  it('C130667 - Verify scan success and expected issues for wrap method hover', async () => {
    await page.goto(baseURL)
    await page.hover('#hover-button')
  })

  it('C130668 - Verify scan success and expected issues for wrap method type and fill()', async () => {
    await page.goto(baseURL)
    await page.type('input[name="username"]', 'username')
    await page.type('input[name="password"]', 'password')
  })

  it('C130669 - Verify scan success and expected issues for wrap method scroll', async () => {
    await page.goto(baseURL)
    await page.evaluate(() => {
      document.querySelector('#footer').scrollIntoView({ behavior: 'smooth' })
    })
  })

  it('C130670 - Verify scan success and expected issues for wrap method focus and click', async () => {
    await page.goto(baseURL)
    await page.focus('#focus-input')
    await page.click('#focus-input')
  })
})
})