import { testData as data } from '@resources/testData'
import { playwrightTest } from '@axe-core/watcher'
import 'dotenv/config'
import { config } from '@global/config'
// @ts-ignore
import { allure } from 'allure-playwright'
import { verifyPagestateIssuesCount } from '../../../utils/axeWatcherAPI'

const API_KEY: string = config.gitMode
  ? process.env.PW_TEST_API_KEY_GIT ?? 'PROVIDE API KEY!'
  : process.env.PW_TEST_API_KEY_GITLESS ?? 'PROVIDE API KEY!'

const { test, expect } = playwrightTest({
  axe: {
    apiKey: API_KEY,
    serverURL: data.environment.domain
  },
  headless: false,
  channel: 'chromium',
  args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage']
})

export { test, expect }

test.describe('PlaywrightTest: AutoAnalyze Mode Tests Validation', () => {
  test.beforeEach(() => {
    allure.suite('PlaywrightTest: AutoAnalyze Mode Tests Validation')
  })

  test('C130414 Validate Scan on Clean-Page to zero issues found', async ({ page }) => {
    await page.goto(data.testUrls.cleanPage)
    const title = await page.title()
    expect(title).toBe(data.testTitles.cleanPage)
  })

  test('C130415 Validate Scan on Dynamic-page', async ({ page }) => {
    await page.goto(data.testUrls.marsPage)
    const title = await page.title()
    expect(title).toBe(data.testTitles.marsPage)
  })

  test('C130416 - Validate Scan on Static-page', async ({ page }) => {
    await page.goto(data.testUrls.brokenWorkshop)
    const title = await page.title()
    expect(title).toBe(data.testTitles.brokenWorkshop)
  })

  test('C130417 - Verify Scan results when dom changes', async ({ page }) => {
    await page.goto('https://dequeuniversity.com/demo/mars/')
    await page.waitForTimeout(1000)

    const expectedTitle = 'Mars Commuter: Travel to Mars for Work or Pleasure!'
    const actualTitle = await page.title()
    expect(actualTitle).toBe(expectedTitle)

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

  test('C130418 Navigate to static page', async ({ page }) => {
    await page.goto(data.testUrls.testPage)
    const title = await page.title()
    expect(title).toBe(data.testTitles.testPage)
  })

  test('C130419 - Validate Scan on Single-page with multiple links', async ({ page }) => {
    await page.goto('https://abcdcomputech.dequecloud.com')
    await page.waitForLoadState('load')

    await page.click('#topnav > ul > li:nth-child(5) > a')
    await page.waitForTimeout(1000)

    await page.click('#topnav > ul > li:nth-child(2) > a')
    await page.waitForTimeout(1000)

    await page.click('#topnav > ul > li:nth-child(3) > a')
    await page.waitForTimeout(1000)
  })

  test.afterAll(async () => {
    await verifyPagestateIssuesCount('autoAnalyzeMode')
    
  })
})