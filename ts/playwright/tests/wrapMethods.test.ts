import { testData as data } from '@resources/testData'
import { testData } from '@resources/testData'
import { assert } from 'chai'
import { allure } from 'allure-playwright'
import 'mocha'
import fs from 'fs'
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
const baseURL = data.testUrls.actions
const API_KEY: string = process.env.PLAYWRIGHT_API_KEY_GIT ?? 'PROVIDE API KEY!'

  // Helper timeout function
  const timeout = async (ms: number) => {
    await page.waitForTimeout(ms);
  };
before(async () => {
  browserContext = await playwright.chromium.launchPersistentContext(
    '',
    playwrightConfig({
      axe: {
        apiKey: API_KEY,
        serverURL: testData.environment.domain
      },
      headless: false,
      args: ['--headless=new']
    })
  )
})

beforeEach(async () => {
  page = await browserContext.newPage()
  controller = new PlaywrightController(page)
  page = wrapPlaywrightPage(page, controller)
  await page.goto(baseURL)
})

afterEach(async () => {
  await controller.flush();
  if (page && !page.isClosed()) {
    await page.close();
  }
});

after(async () => {
  try {
    if (browserContext) {
      await browserContext.close();
    }
  } catch (error) {
    console.error('Error closing browser context:', error)
  }
  
  try {
    await verifyPagestateIssuesCount('wrapMethods', 'automation_Playwright')
  } catch (error) {
    console.error('Error in API validation:', error)
    throw error
  }
});

describe('Playwright: Wrap Methods Tests Validation', () => {
  it('C130448 -Verify scan success and expected issues for wrap method click', async () => {
    await page.goto(baseURL);
    await page.locator('#login-form > button').click();
  });

  it('C130449 -Verify scan success and expected issues for wrap method hover', async () => {
    await page.goto(baseURL);
    await page.locator('#hover-button').hover();
  });

  it('C130450	Verify scan success and expected issues for wrap method type and fill() ', async () => {
    await page.goto(baseURL);
    await page.locator('input[name="username"]').fill('username');
    await page.locator('input[name="password"]').fill('password');
  });

  it('C130451	Verify scan success and expected issues for wrap method scroll ', async () => {
    await page.goto(baseURL);
    // Scroll the footer element into view
    await page.locator('#footer').scrollIntoViewIfNeeded();
  });
   it('C130452	Verify scan success and expected issues for wrap method scroll ', async () => {
    await page.goto(baseURL);
    const input = await page.locator('#focus-input').focus();
    await  page.dispatchEvent('#focus-input', 'click')
  });
})


 