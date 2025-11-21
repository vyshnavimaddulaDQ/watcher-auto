import { testData as data } from '@resources/testData'
import { playwrightTest } from '@axe-core/watcher'
import 'dotenv/config'
import { allure } from 'allure-playwright'
import { verifyPagestateIssuesCount } from 'utils/axeWatcherAPI'
import { createAndSwitchToBranch, getCurrentBranch } from 'utils/gitBranchManager'

const API_KEY: string = process.env.PW_TEST_API_KEY_GIT ?? 'PROVIDE API KEY!'
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID
const globalBuildID = GITHUB_RUN_ID || `RUN-${Math.floor(Math.random() * 100000)}`

const { test, expect } = playwrightTest({
  axe: {
    apiKey: API_KEY,
    serverURL: data.environment.domain
  },
  headless: true, // Explicitly set to true for new headless mode
  channel: 'chromium', // Ensure channel is set to 'chromium'
  args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--ignore-ssl-errors']
})

export { test, expect }

const excludeURLs: {
  description: string
  axe: Parameters<typeof playwrightTest>[0]['axe']
}[] = [
  {
    description: 'C130531 Exclude certain URL from the list of urls',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com/support.php']
    }
  },
  {
    description: 'C130532 Exclude more than one URL from the list of urls',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: [
        '**/laptopsandnotebooks.php',
        '**/desktops.php',
        '**/support.php'
      ]
    }
  },
  {
    description: 'C130534 When ExcludeUrl pattern uses empty string value',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: ['']
    }
  },
  {
    description: 'C130534 Excluding same page URL multiple times',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com/*.*']
    }
  },
  {
    description: 'C130535 When excluding all the other pages using `**.*`',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      excludeUrlPatterns: ['**/*.*']
    }
  },
  {
    description: 'C130533 When ExcludeUrl pattern uses non url pattern',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: ['Google Page']
    }
  },
{
    description: 'C130537 Exclude URLs from the parallel run workers with BuildID',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      excludeUrlPatterns: ['Google Page']
    }
  }

]



for (const configObj of excludeURLs) {
  const { test } = playwrightTest({
    axe: configObj.axe,
    channel: 'chromium', // Ensure channel is set to 'chromium'
    headless: false, // Ensure headless is explicitly set to true
    args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--ignore-ssl-errors'] // Use new headless mode
  });

  test.describe(configObj.description, () => {
    test.beforeAll(() => {
      allure.suite(`PlaywrightTest: Exclude URLs`)
    })

    test('Navigate to Test page and check title', async ({ page }) => {
      await page.goto(data.testUrls.abcdPage)
      await page.click(data.configurationTestsValidations.abcdPageSelectors.laptopsAndNotebooks)
      await page.click(data.configurationTestsValidations.abcdPageSelectors.desktops)
      await page.click(data.configurationTestsValidations.abcdPageSelectors.cart)
      await page.click(data.configurationTestsValidations.abcdPageSelectors.support)
      const title = await page.title()
      expect(title).toBe(data.testTitles.abcdPage)
    });
  });
 
}

test.beforeAll(() => {
  // Create and switch to git branch before running tests
  createAndSwitchToBranch('playwrighttest_excludeurls')
  process.env.GIT_BRANCH = 'playwrighttest_excludeurls'
})

test.afterAll(async () => {
  // Get the current git branch name to fetch results from that branch
  const currentBranch = getCurrentBranch()
  await verifyPagestateIssuesCount('excludeUrls', 'automation_Playwright Test', currentBranch || undefined)
  
})