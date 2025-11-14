// cypress.config.js
const { cypressConfig } = require('@axe-core/watcher');
require('dotenv/config');
const { testData } = require('../../resources/testData');
const { defineConfig } = require('cypress');
const { config } = require('../../global/config');

const API_KEY = config.gitMode
  ? process.env.CYPRESS_API_KEY_GIT || 'PROVIDE API KEY!'
  : process.env.CYPRESS_API_KEY_GITLESS || 'PROVIDE API KEY!';

const configOverrides = [
  {
    description: 'C130981	Overriding Accessibility Standard Configuration from GlobalConfigs',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      configurationOverrides: {
        accessibilityStandard: 'WCAG 2.2 AAA'
      }
    }
  },
  {
    description: 'C130982 Overriding Axe-core version Configuration from GlobalConfigs',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      configurationOverrides: {
        axeCoreVersion: '4.8.0'
      }
    }
  },
  {
    description: 'C130983 Overriding Experimental Rules Configuration from GlobalConfigs(Enable/disable)',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      configurationOverrides: {
        experimentalRules: true
      }
    }
  },
  {
    description: 'C130984 Overriding Best-practice rules Configuration from GlobalConfigs(Enable/Disable)',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      configurationOverrides: {
        bestPractices: true
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
      configOverrides
    },
    defaultCommandTimeout: 60000,
    video: false,
    e2e: {
      specPattern: 'cypress/e2e/configOverrides.cy.js',
      supportFile: 'cypress/support/e2e.js',
      setupNodeEvents(on, config) {
        require('@shelex/cypress-allure-plugin/writer')(on, config);
        return config;
      }
    }
  })
);
