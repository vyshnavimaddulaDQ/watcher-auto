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
  headless: false,
  channel: 'chromium',
  args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--ignore-ssl-errors']
})

export { test, expect }

const axeConfigurations: {
  description: string
  axe: Parameters<typeof playwrightTest>[0]['axe']
}[] = [
  {
    description: 'C130538 - RunOptions- RunOnly for single Rule',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: { type: 'rule', values: ['color-contrast'] }
      }
    }
  },
  {
    description: 'C130539 - RunOptions- RunOnly for multiple Rule',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: { type: 'rule', values: ['color-contrast', 'label'] }
      }
    }
  },
  {
    description: 'C130540-Disable certain rule',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        rules: { 'color-contrast': { enabled: false } },
        ancestry: true
      }
    }
  },
  {
    description: 'C130541-Disable multiple rules',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        rules: {
          'color-contrast': { enabled: false },
          'label': { enabled: false }
        },
        ancestry: true
      }
    }
  },
  {
    description: 'C130542 - RunContext for exclude single element',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runContext: {
        exclude: [['#wcag2aa-fail']]
      }
    }
  },
  {
    description: 'C130543 - RunContext for exclude multiple elements',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runContext: {
        exclude: [['#wcag2aa-fail'], ['#wcag21aa-fail']]
      }
    }
  },
  {
    description: 'C130544 - RunContext for include single element',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runContext: {
        include: [['#wcag2aa-fail']]
      }
    }
  },
  {
    description: 'C130545 - RunContext for include multiple elements',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runContext: {
        include: [['#wcag2aa-fail'], ['#wcag21aa-fail']]
      }
    }
  },
  {
    description: 'C130546	RunOptions- RunOnly for single standard using tag',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: { type: 'tag', values: ['wcag21aa'] }
      }
    }
  },
  {
    description: 'C130547 - RunOptions- RunOnly for multiple standards using tag',
    axe: {
      apiKey: API_KEY,
      serverURL: data.environment.domain,
      buildID: globalBuildID,
      runOptions: {
        runOnly: { type: 'tag', values: ['wcag21aa', 'wcag2aa'] }
      }
    }
  }
]

// Loop through each configuration and create a Playwright test suite
for (const configObj of axeConfigurations) {
  const { test } = playwrightTest({
    axe: configObj.axe,
    headless: false, // Explicitly set headless mode
    channel: 'chromium', // Explicitly set channel to 'chromium'
    args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--ignore-ssl-errors'] // Use new headless mode
  });

  test.describe(configObj.description, () => {
    test.beforeAll(() => {
      allure.suite(`PlaywrightTest: Axe Configurations`)
    })

    test('Navigate to Test page and check title', async ({ page }) => {
      await page.goto('https://qateam.dequecloud.com/attest/api/test.html');
      // You can add assertions here if needed
      // const title = await page.title();
      // expect(title).toBe('Expected Title');
    });
  });
}

// Run afterAll once after all test suites are executed
test.afterAll(async () => {
  await verifyPagestateIssuesCount('axeConfigs', 'automation_Playwright Test')
});