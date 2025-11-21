const { Builder, By } = require('selenium-webdriver')
const {
  wrapWebdriver,
  webdriverConfig,
  WebdriverController
} = require('@axe-core/watcher')

const { Options } = require('selenium-webdriver/chrome')
const { testData: data } = require('../resources/testData')
const {
  getChromeBinaryPath
} = require('../util/setup-chrome-chromedriver')
const { verifyPagestateIssuesCount } = require('../util/axeWatcherAPI')
const { createAndSwitchToBranch, getCurrentBranch } = require('../util/gitBranchManager')
const API_KEY = process.env.WDJS_API_KEY_GIT ?? 'PROVIDE API KEY!'

describe('WebdriverJS: Manual mode tests', () => {
  let browser
  let controller

  before(async () => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('webdriverjs_manualmode')
    process.env.GIT_BRANCH = 'webdriverjs_manualmode'
    
    const options = new Options()
   options.addArguments('--headless=new')
    const chromeBinaryPath = getChromeBinaryPath()
    if (chromeBinaryPath) {
      options.setBinaryPath(chromeBinaryPath)
    }
    browser = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(
        webdriverConfig({
          axe: {
            apiKey: API_KEY,
      serverURL: data.environment.domain,
      autoAnalyze:false,
          },
          options
        })
      )
      .build()
    controller = new WebdriverController(browser)
    browser = wrapWebdriver(browser, controller)
  })

  after(async () => {
    await browser.quit()
    // Get the current git branch name to fetch results from that branch
    const currentBranch = getCurrentBranch()
    await verifyPagestateIssuesCount('manualMode', 'automation_WebdriverJS', currentBranch || undefined)
    })

  afterEach(async () => {
    await controller.flush()
  })

  describe('WebdriverJS: Manual Mode Tests', () => {
    it('C130720: Verify findings in scan results when single Analyze() API is called ', async () => {
      await browser.get('https://qateam.dequecloud.com/testfiles/cleanpage.html')
        await controller.analyze()

    })
    it('C130721: Verify findings in scan results when Start() and Stop() APIs are called once ', async () => {
       await controller.start()
      await browser.get('https://abcdcomputech.dequecloud.com/')
      await controller.stop()

    })
     it('C130719: 	Verify zero findings in scan results when no Analyze() API is called ', async () => {
      await browser.get('https://broken-workshop.dequelabs.com/')

    })
    it('C130722	Verify findings in scan results when chaining Analyze() API is called', async () => {
      await browser.get('https://abcdcomputech.dequecloud.com/')
      await controller.analyze()
      await browser.sleep(1000)
      await controller.analyze()
      await controller.analyze()
      await controller.analyze()

    })
      it('C130723	Verfiy x number of pagestates in scan results for Analyze() API invoked x number of times', async () => {
      await browser.get('https://abcdcomputech.dequecloud.com/')
      await controller.analyze()
      await browser.sleep(1000)
      await controller.analyze()
      await controller.analyze()
      await controller.analyze()
    })

    it('C130724: Verify findings in scan results when Start() and Stop() APIs are called multiple times', async () => {
       await controller.start()
      await browser.get('https://abcdcomputech.dequecloud.com/')
       await browser.sleep(1000)
       await controller.stop()
      await (await browser.findElement(By.css('#topnav > ul > li:nth-child(5) > a'))).click()
      await controller.start()
      await controller.stop()
      await controller.start()
      await controller.stop()
      await (await browser.findElement(By.css('#topnav > ul > li:nth-child(2) > a'))).click()
      await browser.sleep(1000)
      await (await browser.findElement(By.css('#topnav > ul > li:nth-child(3) > a'))).click()
      await browser.sleep(1000)
    })

     it('C130725 Verify findings in scan results when Analyze() is called between multiple Start() and Stop() APIs', async () => {
    await controller.start()
    await browser.get('https://abcdcomputech.dequecloud.com/')
    await controller.stop()
    await browser.findElement(By.css('#topnav > ul > li:nth-child(5) > a')).click()
    await controller.start()
    await browser.findElement(By.css('#topnav > ul > li:nth-child(4) > a')).click()
    await controller.analyze()
    await controller.stop()
    await browser.findElement(By.css('#topnav > ul > li:nth-child(3) > a')).click()
    await browser.findElement(By.css('#topnav > ul > li:nth-child(2) > a')).click()
    await controller.start()
    await controller.analyze()
    await controller.stop()
    await controller.start()
    await controller.analyze()
    await controller.stop()
  })
})
})



    
    