import { testData as data } from '@resources/testData'
import { testData } from '@resources/testData'
import { assert } from 'chai'
import { config } from '@global/config'
import 'mocha'
import playwright from 'playwright'
import {
  playwrightConfig,
  PlaywrightController,
  wrapPlaywrightPage
} from '@axe-core/watcher'
import 'dotenv/config'
import { verifyPagestateIssuesCount } from 'utils/axeWatcherAPI'

let page: playwright.Page
let browserContext: playwright.BrowserContext
let controller: PlaywrightController

const API_KEY: string = config.gitMode
  ? process.env.PLAYWRIGHT_API_KEY_GIT ?? 'PROVIDE API KEY!'
  : process.env.PLAYWRIGHT_API_KEY_GITLESS ?? 'PROVIDE API KEY!'

before(async () => {
  browserContext = await playwright.chromium.launchPersistentContext(
    '',
    playwrightConfig({
      axe: {
        apiKey: API_KEY,
        serverURL: testData.environment.domain,
      },
      headless: false,
      args: ['--headless=new']
    })
  )
})

beforeEach(async () => {
  // Create a page instance, using your browser context.
  page = await browserContext.newPage()

  // Initialize the PlaywrightController by passing in the Playwright page.
  controller = new PlaywrightController(page)

  // Use the new wrapped Playwright page instance.
  page = wrapPlaywrightPage(page, controller)
})

afterEach(async () => {
  await controller.flush()
})

after(async () => {
  await browserContext.close()
  await verifyPagestateIssuesCount('autoAnalyzeMode', 'automation_Playwright')
})

describe('Playwright: AutoAnalyze Mode Tests Validation)', () => {
  it('C130414 Validate Scan on Clean-Page to zero issues found ', async () => {
    await page.goto(data.testUrls.cleanPage)
    const title = await page.title()
    assert(title === data.testTitles.cleanPage, 'Title is not as expected')
  })

  it('C130415 Validate Scan on Dynamic-page ', async () => {
    await page.goto(data.testUrls.marsPage)
    const title = await page.title()
    assert(title === data.testTitles.marsPage, 'Title is not as expected')
  })

  it('C130416 - Validate Scan on Static-page', async () => {
    await page.goto(data.testUrls.brokenWorkshop)
    const title = await page.title()
    assert(
      title === data.testTitles.brokenWorkshop,
      'Title is not as expected'
    )
  })

  it('C130417 - Verify Scan results when dom changes', async () => {
    await page.goto('https://dequeuniversity.com/demo/mars/')
    await page.waitForTimeout(1000)

    const expectedTitle = 'Mars Commuter: Travel to Mars for Work or Pleasure!'
    const actualTitle = await page.title()
    if (actualTitle !== expectedTitle) {
      console.error(` Expected title: ${expectedTitle}, but got: ${actualTitle}`)
    } else {
      console.log(`✅ Title matched: ${actualTitle}`)
    }

    await page.click('#widget-controls-activities-label')
    await page.waitForTimeout(1000)

    await page.click('#widget-controls-passes-label')
    await page.waitForTimeout(1000)

    await page.click('#widget-controls-hotels-label')
    await page.waitForTimeout(1000)

    await page.click('#widget-controls-reservations-label')
    await page.waitForTimeout(1000)

    await page.click('#route-type-radio-group > span:nth-child(2) > label')
    await page.waitForTimeout(1000)
  })

  it('C130418 Navigate to static page', async () => {
    await page.goto(data.testUrls.testPage)
    const title = await page.title()
    assert(
      title === data.testTitles.testPage,
      'Title is not as expected'
    )
  })

  it('C130419 - Validate Scan on Single-page with multiple links', async () => {
    // Navigate to the target URL
    await page.goto('https://abcdcomputech.dequecloud.com')
    await page.waitForLoadState('load')

    // Perform click actions on top navigation links
    await page.click('#topnav > ul > li:nth-child(5) > a')
    await page.waitForTimeout(1000)

    await page.click('#topnav > ul > li:nth-child(2) > a')
    await page.waitForTimeout(1000)

    await page.click('#topnav > ul > li:nth-child(3) > a')
    await page.waitForTimeout(1000)
  })
})