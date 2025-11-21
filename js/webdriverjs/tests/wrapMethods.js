const { Builder, By } = require('selenium-webdriver')
// const { testData } = require('../../../resources/testData')
// const { config } = require('../../../global/config')
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


const baseURL = "https://qateam.dequecloud.com/testfiles/CypressActions.html"
/* Get your configuration from environment variables. */
//const { API_KEY, SERVER_URL = 'https://axe.deque.com' } = process.env
//2 issues 7 ps
describe('WebdriverJS: WrapMethod  tests', () => {
  let browser
  let controller

  before(async () => {
    // Create and switch to git branch before running tests
    createAndSwitchToBranch('webdriverjs_wrapmethods')
    process.env.GIT_BRANCH = 'webdriverjs_wrapmethods'
    
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
    await verifyPagestateIssuesCount('wrapMethods', 'automation_WebdriverJS', currentBranch || undefined)
  })

  afterEach(async () => {
    await controller.flush()
  })

  describe('Wrap Methods', () => {
    it('C131180- Verify scan success and expected issues for wrap method click', async () => {
      await browser.get('https://qateam.dequecloud.com/testfiles/CypressActions.html')
        // Find the element and click it
        const element = await browser.findElement(By.css('#login-form > button'));
    await element.click();
   
    })
   

  it('C131181 - Verify scan success and expected issues for wrap method hover', async () => {
    await browser.get('https://qateam.dequecloud.com/testfiles/CypressActions.html')
    const element = await browser.findElement(By.css('#hover-button'))
    const actions = browser.actions({ async: true });
    await actions.move({origin: element}).perform();
  })

  it('C131182 - Verify scan success and expected issues for wrap method type and fill()', async () => {
    await browser.get('https://qateam.dequecloud.com/testfiles/CypressActions.html')
    const username = await browser.findElement(By.css('input[name="username"]'))
    await username.clear()
    await username.sendKeys('username')
    const password = await browser.findElement(By.css('input[name="password"]'))
    await password.clear()
    await password.sendKeys('password')
     const element = await browser.findElement(By.css('#login-form > button'));
    await element.click();
  })

  it('C131183 - Verify scan success and expected issues for wrap method scroll', async () => {
    await browser.get('https://qateam.dequecloud.com/testfiles/CypressActions.html')
    await browser.executeScript(`document.querySelector('#footer').scrollIntoView({ behavior: 'smooth' })`)
  })

  it('C131184 - Verify scan success and expected issues for wrap method focus and click', async () => {
    await browser.get('https://qateam.dequecloud.com/testfiles/CypressActions.html')
    const element = await browser.findElement(By.css('#focus-input'))
    await element.sendKeys('')
    await element.click()
  })
  })
})
