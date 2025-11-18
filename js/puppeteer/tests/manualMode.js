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
const { createAndSwitchToBranch, getCurrentBranch } = require('../util/gitBranchManager')

const API_KEY = process.env.PUPPETEER_API_KEY_GIT ?? 'PROVIDE API KEY!'

describe('Puppeteer: Manual Mode Tests Validation', function () {
  this.timeout(60000)
  let browser
  let page
  let controller

  before(async () => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('puppeteer_manualmode')
    process.env.GIT_BRANCH = 'puppeteer_manualmode'
    browser = await puppeteer.launch(
      puppeteerConfig({
        axe: {
          apiKey: API_KEY,
          serverURL: testData.environment.domain,
          autoAnalyze: false // Set to false for Manual Mode
        },
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
    await new Promise(resolve => setTimeout(resolve, 20000))
    // Get the current git branch name to fetch results from that branch
    const currentBranch = getCurrentBranch()
    await verifyPagestateIssuesCount('manualMode', 'automation_Puppeteer', currentBranch || undefined)
  })

  it('C130630 Verify zero findings in scan results when no Analyze() API is called', async () => {
   await page.goto('https://abcdcomputech.dequecloud.com')
    // No analyze call here
  })

  it('C130631 Verify findings in scan results when single Analyze() API is called', async () => {
    await page.goto('https://abcdcomputech.dequecloud.com')
    await controller.analyze()
  })

  it('C130632 Verify findings in scan results when Start() and Stop() APIs are called once', async () => {
    await controller.start()
    await page.goto('https://abcdcomputech.dequecloud.com')
    await controller.stop()
  })

  it('C130633 Verify findings in scan results when Analyze() API is called multiple times', async () => {
    await page.goto('https://abcdcomputech.dequecloud.com')
    await controller.analyze()
    await controller.analyze()
    await controller.analyze()
    await controller.analyze()
  })

  it('C130634 Verify findings in scan results when chaining Analyze() API is called', async () => {
   await page.goto('https://abcdcomputech.dequecloud.com')
   await controller.analyze()
   await controller.analyze()
   await controller.analyze()
   await controller.analyze()
  })



  it('C130635 Verify findings in scan results when Start() and Stop() APIs are called multiple times', async () => {
    await controller.start()
    await page.goto('https://abcdcomputech.dequecloud.com')
    await controller.stop()
    await page.click('#topnav > ul > li:nth-child(5) > a')
    await controller.start()
    await controller.stop()
    await controller.start()
    await controller.stop()
    await page.click('#topnav > ul > li:nth-child(2) > a')
    await page.click('#topnav > ul > li:nth-child(3) > a')
  })

  it('C130636 Verify findings in scan results when Analyze() is called between multiple Start() and Stop() APIs', async () => {
    await controller.start()
    await page.goto('https://abcdcomputech.dequecloud.com')
    await controller.stop()
    await page.click('#topnav > ul > li:nth-child(5) > a')
    await controller.start()
    await page.click('#topnav > ul > li:nth-child(4) > a')
    await controller.analyze()
    await controller.stop()
    await page.click('#topnav > ul > li:nth-child(3) > a')
    await page.click('#topnav > ul > li:nth-child(2) > a')
    await controller.start()
    await controller.analyze()
    await controller.stop()
    await controller.start()
    await controller.analyze()
    await controller.stop()
  })
})