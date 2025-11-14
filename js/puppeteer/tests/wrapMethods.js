const puppeteer = require('puppeteer')
const { assert } = require('chai')
const { allure } = require('allure-mocha')
const { testData } = require('../resources/testData')
const {
  puppeteerConfig,
  PuppeteerController,
  wrapPuppeteerPage
} = require('@axe-core/watcher')
const { verifyPagestateIssuesCount } = require('../util/axeWatcherAPI')

const baseURL = testData.testUrls.actions

const API_KEY = process.env.PUPPETEER_API_KEY_GIT ?? 'PROVIDE API KEY!'

describe('Puppeteer: Wrap Methods Tests Validation', function() {
  this.timeout(180000) // 3 minutes timeout
  
  let browser
  let page
  let controller

  before(async function() {
    this.timeout(60000) // 60 seconds for browser launch
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

  beforeEach(async function() {
    this.timeout(30000)
    page = await browser.newPage()
    controller = new PuppeteerController(page)
    page = wrapPuppeteerPage(page, controller)
    await page.goto(baseURL)
  })

  afterEach(async function() {
    this.timeout(30000)
    if (controller) {
      await controller.flush()
    }
    if (page) {
      await page.close()
    }
  })

  after(async function() {
    this.timeout(300000) // 5 minutes for API validation
    if (browser) {
      await browser.close()
    }
    await this.sleep(20000)
    await verifyPagestateIssuesCount('wrapMethods', 'automation_Puppeteer')
  })

  it('C130666 - Verify scan success and expected issues for wrap method click', async function() {
    this.timeout(30000)
    await page.goto(baseURL)
    await page.click('#login-form > button')
  })

  it('C130667 - Verify scan success and expected issues for wrap method hover', async function() {
    this.timeout(30000)
    await page.goto(baseURL)
    await page.hover('#hover-button')
  })

  it('C130668 - Verify scan success and expected issues for wrap method type and fill()', async function() {
    this.timeout(30000)
    await page.goto(baseURL)
    await page.type('input[name="username"]', 'username')
    await page.type('input[name="password"]', 'password')
  })

  it('C130669 - Verify scan success and expected issues for wrap method scroll', async function() {
    this.timeout(30000)
    await page.goto(baseURL)
    await page.evaluate(() => {
      document.querySelector('#footer').scrollIntoView({ behavior: 'smooth' })
    })
  })

  it('C130670 - Verify scan success and expected issues for wrap method focus and click', async function() {
    this.timeout(30000)
    await page.goto(baseURL)
    await page.focus('#focus-input')
    await page.click('#focus-input')
  })
})