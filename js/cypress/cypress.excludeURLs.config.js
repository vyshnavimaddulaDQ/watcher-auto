// cypress.config.js
const { cypressConfig } = require('@axe-core/watcher');
require('dotenv/config');
const { testData } = require('../../../resources/testData');
const { defineConfig } = require('cypress');
const { config } = require('../../../global/config');

const API_KEY = config.gitMode
  ? process.env.CYPRESS_API_KEY_GIT || 'PROVIDE API KEY!'
  : process.env.CYPRESS_API_KEY_GITLESS || 'PROVIDE API KEY!';

const excludeURLs = [
  {
    description: 'C130959 Exclude certain URL from the list of urls',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com/support.php']
    }
  },
  {
    description: 'C130960 Exclude more than one URL from the list of urls',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: [
        '**/laptopsandnotebooks.php',
        '**/desktops.php',
        '**/support.php'
      ]
    }
  },
  {
    description: 'C130962 When ExcludeUrl pattern uses empty string value',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['']
    }
  },
  {
    description: 'C130964 Excluding same page URL multiple times',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com/*.*']
    }
  },
  {
    description: 'C130965 When excluding all the other pages using `**.*`',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['**/*.*']
    }
  },
  {
    description: 'C130963 Exclude URLs from the parallel run workers with BuildID',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['http://abcdcomputech.dequecloud.com']
    }
  },
  {
    description: 'C130961 When ExcludeUrl pattern uses non url pattern',
    axe: {
     apiKey: API_KEY,
      serverURL: testData.environment.domain,
      excludeUrlPatterns: ['Google Page']
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
      excludeURLs
    },
    defaultCommandTimeout: 60000,
    video: false,
    e2e: {
      specPattern: 'cypress/e2e/excludeURLs.cy.js',
      supportFile: 'cypress/support/e2e.js',
      setupNodeEvents(on, config) {
        require('@shelex/cypress-allure-plugin/writer')(on, config);
        return config;
      }
    }
  })
);
