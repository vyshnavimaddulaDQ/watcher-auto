import { testData as data } from '@resources/testData'
import { playwrightTest } from '@axe-core/watcher'
import 'dotenv/config'
import { allure } from 'allure-playwright'
import { verifyPagestateIssuesCount } from 'utils/axeWatcherAPI'

const API_KEY: string = process.env.PW_TEST_API_KEY_GIT ?? 'PROVIDE API KEY!'

const { test, expect } = playwrightTest({
  axe: {
    apiKey: API_KEY,
    serverURL: data.environment.domain
  },
  headless: false,
  channel: 'chromium',
  args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--ignore-ssl-errors']
})

export { test, expect }

test.describe('PlaywrightTest: Manual Mode Tests Validation', () => {
  test.beforeEach(() => {
    allure.suite('PlaywrightTest: Manual Mode Tests Validation')
  })

  test('C130524 Verify zero findings in scan results when no Analyze() API is called', async ({ page }) => {
    await page.goto('https://abcdcomputech.dequecloud.com')
    // No analyze call here
  })

  test('C130525 Verify findings in scan results when single Analyze() API is called', async ({ page }) => {
    await page.goto('https://abcdcomputech.dequecloud.com')
    await page.axeWatcher.analyze()
  })

  test('C130527 Verify findings in scan results when Analyze() API is called multiple times', async ({ page }) => {
    await page.goto('https://abcdcomputech.dequecloud.com')
    await page.axeWatcher.analyze()
    await page.axeWatcher.analyze()
    await page.axeWatcher.analyze()
    await page.axeWatcher.analyze()
  })

  test('C130528 Verify x number of pagestates in scan results for Analyze() API invoked x number of times', async ({ page }) => {
    await page.axeWatcher.start()
    await page.goto('https://abcdcomputech.dequecloud.com')
    await page.axeWatcher.stop()
    await page.axeWatcher.start()
    await page.axeWatcher.stop()
  })

  test('C130526 Verify x number of pagestates in scan results for Analyze() API invoked x number of times', async ({ page }) => {
    await page.axeWatcher.start()
    await page.goto('https://abcdcomputech.dequecloud.com')
    await page.axeWatcher.stop()
  })

  test('C130529 Verify findings in scan results when Start() and Stop() APIs are called multiple times', async ({ page }) => {
    await page.axeWatcher.start()
    await page.goto('https://abcdcomputech.dequecloud.com')
    await page.waitForLoadState('load')
    await page.axeWatcher.stop()
    await page.click('#topnav > ul > li:nth-child(5) > a')
    await page.axeWatcher.start()
    await page.axeWatcher.stop()
    await page.axeWatcher.start()
    await page.axeWatcher.stop()
    await page.waitForTimeout(1000)
    await page.click('#topnav > ul > li:nth-child(2) > a')
    await page.waitForTimeout(1000)
    await page.click('#topnav > ul > li:nth-child(3) > a')
    await page.waitForTimeout(1000)
  })

  test('C130530 Verify findings in scan results when Analyze() is called between multiple Start() and Stop() APIs', async ({ page }) => {
    await page.axeWatcher.start()
    await page.goto('https://abcdcomputech.dequecloud.com')
    await page.axeWatcher.stop()
    await page.click('#topnav > ul > li:nth-child(5) > a')
    await page.axeWatcher.start()
    await page.click('#topnav > ul > li:nth-child(4) > a')
    await page.axeWatcher.analyze()
    await page.axeWatcher.stop()
    await page.click('#topnav > ul > li:nth-child(3) > a')
    await page.waitForTimeout(1000)
    await page.click('#topnav > ul > li:nth-child(2) > a')
    await page.axeWatcher.start()
    await page.axeWatcher.analyze()
    await page.axeWatcher.stop()
    await page.axeWatcher.start()
    await page.axeWatcher.analyze()
    await page.axeWatcher.stop()
  })
  test.afterAll(async () => {
    await verifyPagestateIssuesCount('manualMode')
    
  })
})