const { expect } = require('chai')
const puppeteer = require('puppeteer')
const axios = require('axios')
const {
  wrapPuppeteerPage,
  PuppeteerController,
  puppeteerConfig
} = require('@axe-core/watcher')

const { allure } = require('allure-mocha')
const { testData: data } = require('../resources/testData')
const { verifyPagestateIssuesCount } = require('../util/axeWatcherAPI')
const API_KEY = process.env.PUPPETEER_API_KEY_GIT ?? 'PROVIDE API KEY!'


/* Get your configuration from environment variables. */
describe('Puppeteer: AutoAnalyze Mode Tests Validation', () => {
  let browser
  let page
  let controller

  before(async () => {
    browser = await puppeteer.launch(
      puppeteerConfig({
        axe: {
           apiKey: API_KEY,
           serverURL: data.environment.domain,
        },
        headless: false,
        args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox']
      })
    )
    // Create a page instance, using your browser instance.
    page = await browser.newPage()
    await page.setViewport({
      width: 1280,
      height: 720
    })

    // Initialize the PuppeteerController by passing in the Puppeteer page.
    controller = new PuppeteerController(page)

    // Use the new wrapped Puppeteer page instance.
    page = wrapPuppeteerPage(page, controller)
  })

  after(async () => {
    await browser.close()
    await verifyPagestateIssuesCount('autoAnalyzeMode', 'automation_Puppeteer')
  })

  afterEach(async () => {
    /* Flush axe-watcher results after each test. */
    await controller.flush()
    //await page.close()

  })

  it('C130617 Validate Scan on Clean-Page to zero issues found', async () => {
    await page.goto(data.testUrls.cleanPage)
    const title = await page.title()
    expect(title).to.equal(data.testTitles.cleanPage)
  })

  it('C130618 Validate Scan on Dynamic-page', async () => {
    await page.goto(data.testUrls.marsPage)
    const title = await page.title()
    expect(title).to.equal(data.testTitles.marsPage)
  })

  it('C130619 - Validate Scan on Static-page', async () => {
    await page.goto(data.testUrls.brokenWorkshop)
    const title = await page.title()
    expect(title).to.equal(data.testTitles.brokenWorkshop)
  })

  it('C130620 - Verify Scan results when dom changes', async () => {
    await page.goto('https://dequeuniversity.com/demo/mars/')

    const expectedTitle = 'Mars Commuter: Travel to Mars for Work or Pleasure!'
    const actualTitle = await page.title()
    expect(actualTitle).to.equal(expectedTitle)

    await page.click('#widget-controls-activities-label')
    await new Promise(resolve => setTimeout(resolve, 1000))

    await page.click('#widget-controls-passes-label')
    await new Promise(resolve => setTimeout(resolve, 1000))

    await page.click('#widget-controls-hotels-label')
    await new Promise(resolve => setTimeout(resolve, 1000))

    await page.click('#widget-controls-reservations-label')
    await new Promise(resolve => setTimeout(resolve, 1000))

    await page.click('#route-type-radio-group > span:nth-child(2) > label')
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  it('C130621 Validate the page whether playwright able to scan iframes', async () => {
    await page.goto(data.testUrls.testPage)
    const title = await page.title()
    expect(title).to.equal(data.testTitles.testPage)
  })

  it('C130622 - Validate Scan on Single-page with multiple links', async () => {
    await page.goto('https://abcdcomputech.dequecloud.com')
    await page.waitForSelector('#topnav > ul > li:nth-child(5) > a')

    await page.click('#topnav > ul > li:nth-child(5) > a')
    await new Promise(resolve => setTimeout(resolve, 1000))

    await page.click('#topnav > ul > li:nth-child(2) > a')
    await new Promise(resolve => setTimeout(resolve, 1000))

    await page.click('#topnav > ul > li:nth-child(3) > a')
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  it('C130703 - Create a CI/CD job to be able to run the suite ', async () => {
    await page.goto(data.testUrls.brokenWorkshop)
    const title = await page.title()
    expect(title).to.equal(data.testTitles.brokenWorkshop)
  })
})
