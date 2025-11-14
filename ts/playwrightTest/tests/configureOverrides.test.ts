import { testData as data } from '@resources/testData'
import { playwrightTest } from '@axe-core/watcher'
import 'dotenv/config'
import { allure } from 'allure-playwright'
import { verifyPagestateIssuesCount } from 'utils/axeWatcherAPI'

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

const configureOverrides: {
  description: string
  axe: Parameters<typeof playwrightTest>[0]['axe']
}[] = [
  {
    description: 'C130553 Overriding Accessibility Standard Configuration from GlobalConfigs',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      configurationOverrides: {
        accessibilityStandard: 'WCAG 2.2 AAA'
      }
    }
  },
  {
    description: 'C130554 Overriding Axe-core version Configuration from GlobalConfigs',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      configurationOverrides: {
        axeCoreVersion: '4.8.0'
      }
    }
  },
  {
    description: 'C130555 Overriding Experimental Rules Configuration from GlobalConfigs(Enable/disable)',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      configurationOverrides: {
        experimentalRules: true
      }
    }
  },
  {
    description: 'C130556 Overriding Best-practice rules Configuration from GlobalConfigs(Enable/Disable)',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      configurationOverrides: {
        bestPractices: true
      }
    }
  }
]

// Loop through each configuration and create a Playwright test suite
for (const configObj of configureOverrides) {
  const { test } = playwrightTest({
    axe: configObj.axe,
    channel: 'chromium', // Explicitly set channel to 'chromium'
    headless: false, // Explicitly set headless to true
    args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--ignore-ssl-errors'] // Use new headless mode
  });

  test.describe(configObj.description, () => {
    test.beforeAll(() => {
      allure.suite(`PlaywrightTest: Configure Overrides`)
    })

    test('Navigate to Test page and check title', async ({ page }) => {
      await page.goto(data.testUrls.abcdPage);
    });
  });
 
} 
test.afterAll(async () => {
  await verifyPagestateIssuesCount('configOverride')
  
})