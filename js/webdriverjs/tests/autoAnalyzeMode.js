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

describe('Autoanalyse mode test cases', () => {
  let browser
  let controller

  before(async () => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('webdriverjs_autoanalyzemode')
    process.env.GIT_BRANCH = 'webdriverjs_autoanalyzemode'
    
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
    await verifyPagestateIssuesCount('autoAnalyzeMode', 'automation_WebdriverJS', currentBranch || undefined)
  })

  afterEach(async () => {
    await controller.flush()
  })

  describe('WebdriverJS: AutoAnalyze Mode Tests Validation', () => {
    
    it('C130706: Validate  Scan on Clean-Page to zero issues found', async () => {
      await browser.get('https://qateam.dequecloud.com/testfiles/cleanpage.html')

    })
  
     it('C130707: Validate Scan on Dynamic-page ', async () => {
      await browser.get('https://dequeuniversity.com/demo/mars/')
    })
    it('C130708: Validate Scan on Static-page ', async () => {
      await browser.get('https://broken-workshop.dequelabs.com/')
    })
    it('C130709: Verify Scan results when dom changes', async () => {
      await browser.get('https://dequeuniversity.com/demo/mars/')
      await (await browser.findElement(By.css('#widget-controls-activities-label'))).click()
    await browser.sleep(1000)

    await (await browser.findElement(By.css('#widget-controls-passes-label'))).click()
    await browser.sleep(1000)

    await (await browser.findElement(By.css('#widget-controls-hotels-label'))).click()
    await browser.sleep(1000)

    await (await browser.findElement(By.css('#widget-controls-reservations-label'))).click()
    await browser.sleep(1000)

    await (await browser.findElement(By.css('span:nth-child(2) > label'))).click()
    await browser.sleep(1000)

    })

     it('C130710: Validate the page whether WebdriverJS able to scan iframes ', async () => {
      await browser.get('https://qateam.dequecloud.com/attest/api/test.html')
    })
    
    it('C130710: Validate Scan on Single-page with multiple links ', async () => {
      await browser.get('https://abcdcomputech.dequecloud.com/')
        await (await browser.findElement(By.css('#topnav > ul > li:nth-child(5) > a'))).click()
    await browser.sleep(1000)

    await (await browser.findElement(By.css('#topnav > ul > li:nth-child(2) > a'))).click()
    await browser.sleep(1000)

    await (await browser.findElement(By.css('#topnav > ul > li:nth-child(3) > a'))).click()
    await browser.sleep(1000)
    })
      it('C130792: Create a CI/CD job to be able to run the suite using webdriverjs integration ', async () => {
      await browser.get('https://abcdcomputech.dequecloud.com/')
    })
    
  })
})
