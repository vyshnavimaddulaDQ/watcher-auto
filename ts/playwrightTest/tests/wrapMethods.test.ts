import { testData as data } from '@resources/testData'
import { playwrightTest } from '@axe-core/watcher'
import 'dotenv/config'
import { config } from '@global/config'
import { allure } from 'allure-playwright'
import { verifyPagestateIssuesCount } from '../../../utils/axeWatcherAPI'

const API_KEY: string = config.gitMode
  ? process.env.PW_TEST_API_KEY_GIT ?? 'PROVIDE API KEY!'
  : process.env.PW_TEST_API_KEY_GITLESS ?? 'PROVIDE API KEY!'

const baseURL = data.testUrls.actions
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

test.describe('PlaywrightTest: Wrap Methods Tests Validation', () => {
  test.beforeEach(() => {
    allure.suite('PlaywrightTest: Wrap Methods Tests Validation')
  })

  test('C130570 - Verify scan success and expected issues for wrap method click', async ({ page }) => {
    allure.label('testId', 'C130570')
    await page.goto(baseURL)
    await page.locator('#login-form > button').click()
  })

  test('C130571 - Verify scan success and expected issues for wrap method hover', async ({ page }) => {
    allure.label('testId', 'C130571')
    await page.goto(baseURL)
    await page.locator('#hover-button').hover()
  })

  test('C130572 - Verify scan success and expected issues for wrap method type and fill()', async ({ page }) => {
    allure.label('testId', 'C130572')
    await page.goto(baseURL)
    await page.locator('input[name="username"]').fill('username')
    await page.locator('input[name="password"]').fill('password')
  })

  test('C130573 - Verify scan success and expected issues for wrap method scroll', async ({ page }) => {
    allure.label('testId', 'C130573')
    await page.goto(baseURL)
    await page.locator('#footer').scrollIntoViewIfNeeded()
  })

  test('C130574 - Verify scan success and expected issues for wrap method focus and dispatchEvent', async ({ page }) => {
    allure.label('testId', 'C130574')
    await page.goto(baseURL)
    await page.locator('#focus-input').focus()
    await page.dispatchEvent('#focus-input', 'click')
  })
  test.afterAll(async () => {
    await verifyPagestateIssuesCount('wrapMethods')
    
  })
})