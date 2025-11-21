import 'mocha'
import { expect } from 'chai'
import { testData as data } from '@resources/testData'
import { wdioConfig, WdioController, wrapWdio } from '@axe-core/watcher'
import { remote } from 'webdriverio'
import 'dotenv/config'

import type { Capabilities } from '@wdio/types'
import {
  getChromeBinaryPath,
  getChromedriverBinaryPath
} from 'utils/setup-chrome-chromedriver'
import { verifyPagestateIssuesCount } from 'utils/axeWatcherAPI'
import { createAndSwitchToBranch, getCurrentBranch } from 'utils/gitBranchManager'

let browser: WebdriverIO.Browser
let controller: WdioController

const API_KEY: string = process.env.WDIO_API_KEY_GIT ?? 'PROVIDE API KEY!'

before(async () => {
  // Create and switch to git branch before running tests
  createAndSwitchToBranch('wdio_autoanalyzemode')
  process.env.GIT_BRANCH = 'wdio_autoanalyzemode'
  
  browser = await remote(
    wdioConfig({
      axe: {
        apiKey: API_KEY,
        serverURL: data.environment.domain
      },
      capabilities: {
        browserName: 'chrome',
       'goog:chromeOptions': {
          args: ['--headless=new', '--no-sandbox'],
          /*
           * You can use the utility to get the Chrome binary path, including installing Chrome, if needed.
           * This can be overridden by setting CHROME_BIN in the environment variables.
           * If you do not specify a binary, the default Chrome installation will be used.
           * This may cause issues, as Watcher does not support branded Chrome >= 139.
           */
          binary: getChromeBinaryPath()
      }
    }
    }) as Capabilities.WebdriverIOConfig
  )
  controller = new WdioController(browser)
  wrapWdio(browser, controller)
})

afterEach(async () => {
  try {
    await controller.flush()
  } catch (error) {
    console.error('Error occurred while flushing the results:', error)
  }
})

after(async () => {
  await browser.deleteSession()
  // Get the current git branch name to fetch results from that branch
  const currentBranch = getCurrentBranch()
  await verifyPagestateIssuesCount('autoAnalyzeMode', 'automation_WebdriverIO', currentBranch || undefined)
})

describe('WebdriverIO: AutoAnalyze Mode Tests Validation', () => {
  // Add feature and epic tags for the entire test suite
  before(() => {
  })
  
  it('C130795 Validate Scan on Clean-Page to zero issues found', async () => {

    await browser.url(data.testUrls.cleanPage)
    const title = await browser.getTitle()
    expect(title).to.equal(data.testTitles.cleanPage, 'Title is not as expected')
  })

  it('C130796 Validate Scan on Dynamic-page', async () => {
    await browser.url(data.testUrls.marsPage)
    const title = await browser.getTitle()
    expect(title).to.equal(data.testTitles.marsPage, 'Title is not as expected')
  })

  it('C130797 - Validate Scan on Static-page', async () => {
    await browser.url(data.testUrls.brokenWorkshop)
    const title = await browser.getTitle()
    expect(title).to.equal(data.testTitles.brokenWorkshop, 'Title is not as expected')
  })

  it('C130798 - Verify Scan results when dom changes', async () => {
    await browser.url(data.testUrls.marsPage)
    await browser.pause(1000)

    const expectedTitle = 'Mars Commuter: Travel to Mars for Work or Pleasure!'
    const actualTitle = await browser.getTitle()
    
    if (actualTitle !== expectedTitle) {
      console.error(` Expected title: ${expectedTitle}, but got: ${actualTitle}`)
    } else {
      console.log(`✅ Title matched: ${actualTitle}`)
    }

    await browser.$('#widget-controls-activities-label').click()
    await browser.pause(1000)

    await browser.$('#widget-controls-passes-label').click()
    await browser.pause(1000)

    await browser.$('#widget-controls-hotels-label').click()
    await browser.pause(1000)

    await browser.$('#widget-controls-reservations-label').click()
    await browser.pause(1000)

    await browser.$('span:nth-child(2) > label').click()
    await browser.pause(1000)
  })

  it('C130800 - Validate Scan on Single-page with multiple links', async () => {
    // Navigate to the target URL
    await browser.url('https://abcdcomputech.dequecloud.com')
    await browser.waitUntil(async () => {
      const state = await browser.execute(() => document.readyState)
      return state === 'complete'
    })

    // Perform click actions on top navigation links
    await browser.$('#topnav > ul > li:nth-child(5) > a').click()
    await browser.pause(1000)

    await browser.$('#topnav > ul > li:nth-child(2) > a').click()
    await browser.pause(1000)

    await browser.$('#topnav > ul > li:nth-child(3) > a').click()
    await browser.pause(1000)
  })
})