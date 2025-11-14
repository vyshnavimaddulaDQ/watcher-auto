// cypress.config.js
const { cypressConfig } = require('@axe-core/watcher');
require('dotenv/config');
const { testData } = require('../../../resources/testData');
const { defineConfig } = require('cypress');
const { config } = require('../../../global/config');

const API_KEY = config.gitMode
  ? process.env.CYPRESS_API_KEY_GIT || 'PROVIDE API KEY!'
  : process.env.CYPRESS_API_KEY_GITLESS || 'PROVIDE API KEY!';

const axeConfigurations = [
  {
    description: 'C130966:	RunOptions- RunOnly for single Rule',
    axe: {
      runOptions: {
        runOnly: {
          type: 'rule',
          values: ['color-contrast']
        }
      }
    }
  },
  {
    description: 'C130967: RunOptions- RunOnly for multiple Rule',
    axe: {
      runOptions: {
        runOnly: {
          type: 'rule',
          values: ['color-contrast', 'label']
        }
      }
    }
  },
  {
    description: 'C130968: Disable certain rule',
    axe: {
      runOptions: {
        rules: {
          'color-contrast': { enabled: false }
        },
        ancestry: true
      }
    }
  },
  {
    description: 'C130969: Disable multiple rules',
    axe: {
      runOptions: {
        rules: {
          'color-contrast': { enabled: false },
          label: { enabled: false }
        },
        ancestry: true
      }
    }
  },
  {
    description: 'C130970: RunContext for exclude single element',
    axe: {
      runContext: {
        exclude: [['#wcag2aa-fail']]
      }
    }
  },
  {
    description: 'C130971: RunContext for exclude multiple elements',
    axe: {
      runContext: {
        exclude: [['#wcag2aa-fail'], ['#wcag21aa-fail']]
      }
    }
  },
  {
    description: 'C130972: RunContext for include single element',
    axe: {
      runContext: {
        include: [['#wcag2aa-fail']]
      }
    }
  },
  {
    description: 'C130973: RunContext for include multiple elements',
    axe: {
      runContext: {
        include: [['#wcag2aa-fail'], ['#wcag21aa-fail']]
      }
    }
  },
  {
    description: 'C130974: RunOptions- RunOnly for single standard using tag',
    axe: {
      runOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag21aa']
        }
      }
    }
  },
  {
    description: 'C130975: RunOptions- RunOnly for multiple standards using tag',
    axe: {
      runOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag21aa', 'wcag2aa']
        }
      }
    }
  }
];

module.exports = defineConfig(
  cypressConfig({
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain
    },
    env: {
      testData,
      axeConfigurations
    },
    defaultCommandTimeout: 60000,
    video: false,
    e2e: {
      specPattern: 'cypress/e2e/runConfigTest.cy.js',
      supportFile: 'cypress/support/e2e.js',
      setupNodeEvents(on, config) {
        require('@shelex/cypress-allure-plugin/writer')(on, config);
        return config;
      }
    }
  })
);
