import { testData as data } from '@resources/testData'
import { playwrightTest } from '@axe-core/watcher'
import 'dotenv/config'
import { allure } from 'allure-playwright'
import { verifyPagestateIssuesCount } from 'utils/axeWatcherAPI'
import { createAndSwitchToBranch, getCurrentBranch } from 'utils/gitBranchManager'

const API_KEY: string = process.env.PW_TEST_API_KEY_GIT ?? 'PROVIDE API KEY!'

const baseURL = data.testUrls.actions
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

test.describe('PlaywrightTest: Wrap Methods Tests Validation', () => {
  test.beforeAll(() => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('playwrighttest_wrapmethods')
    process.env.GIT_BRANCH = 'playwrighttest_wrapmethods'
  })

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
    // Get the current git branch name to fetch results from that branch
    const currentBranch = getCurrentBranch()
    await verifyPagestateIssuesCount('wrapMethods', 'automation_Playwright Test', currentBranch || undefined)
    
  })
})