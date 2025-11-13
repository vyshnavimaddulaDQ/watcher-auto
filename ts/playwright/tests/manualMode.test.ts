
import { testData as data } from '@resources/testData'
import { testData  } from '@resources/testData'
import { assert } from 'chai'
import { allure } from 'allure-playwright'
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

const API_KEY: string = config.gitMode ? process.env.PLAYWRIGHT_API_KEY_GIT ?? 'PROVIDE API KEY!' : process.env.PLAYWRIGHT_API_KEY_GITLESS ?? 'PROVIDE API KEY!'

before(async () => {
  browserContext = await playwright.chromium.launchPersistentContext(
    '',
    playwrightConfig({
      axe: {
        apiKey: API_KEY,
        serverURL: testData.environment.domain,
        autoAnalyze: false // Set to false for Manual Mode
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
  try {
    if (browserContext) {
      await browserContext.close()
    }
  } catch (error) {
    console.error('Error closing browser context:', error)
  }
  
  try {
    await verifyPagestateIssuesCount('manualMode', 'automation_Playwright')
  } catch (error) {
    console.error('Error in API validation:', error)
    throw error
  }
})

describe('Playwright: Manual Mode Tests Validation', () => {
    it('C130420	Verify zero findings in scan results when no Analyze() API is called ', async () => {
      await page.goto('https://abcdcomputech.dequecloud.com')
      
    })

     it('C130421	Verify findings in scan results when single Analyze() API is called ', async () => {
      await page.goto('https://abcdcomputech.dequecloud.com')
      await controller.analyze()
    })

   
    it('C130422	Verify findings in scan results when Start() and Stop() APIs are called once ', async () => {
      await page.goto('https://abcdcomputech.dequecloud.com')
      await controller.analyze()
      await controller.analyze()
      await controller.analyze()
      await controller.analyze()

    })
 
  it('C130423	Verify findings in scan results when chaining Analyze() API is called', async () => {
   await page.goto('https://abcdcomputech.dequecloud.com')
     
    })
  

 
    it('C130424	Verify x number of pagestates in scan results for Analyze() API invoked x number of times ', async () => {
      await controller.start()
      await page.goto('https://abcdcomputech.dequecloud.com')
      await controller.stop()
      
    })
  


    it('C130425	Verify findings in scan results when Start() and Stop() APIs are called multiple times ', async () => {
     await controller.start()
      // Navigate to the target URL
     await page.goto('https://abcdcomputech.dequecloud.com');
     await page.waitForLoadState('load');
     await controller.stop()
      // Perform click actions on top navigation links
     await page.click('#topnav > ul > li:nth-child(5) > a');
     await controller.start()
     await controller.stop()
     await controller.start()
     await controller.stop()
     await page.waitForTimeout(1000);
     await page.click('#topnav > ul > li:nth-child(2) > a');
     await page.waitForTimeout(1000);
     await page.click('#topnav > ul > li:nth-child(3) > a');
     await page.waitForTimeout(1000);
    })

    it('C130426	Verify findings in scan results when Analyze() is called between multiple Start() and Stop() APIs  ', async () => {
      await controller.start()
      // Navigate to the target URL
      await page.goto('https://abcdcomputech.dequecloud.com');
      await controller.stop()
        // Perform click actions on top navigation links
      await page.click('#topnav > ul > li:nth-child(5) > a');
      await controller.start()
      await page.click('#topnav > ul > li:nth-child(4) > a');
      await controller.analyze()
      await controller.stop()
      await page.click('#topnav > ul > li:nth-child(3) > a');
      await page.waitForTimeout(1000);
      await page.click('#topnav > ul > li:nth-child(2) > a');
      await controller.start()
      await controller.analyze()
      await controller.stop()
      await controller.start()
      await controller.analyze()
      await controller.stop()

    })

  })

