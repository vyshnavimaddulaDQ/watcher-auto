// cypress.config.js
const { cypressConfig } = require('@axe-core/watcher');
require('dotenv/config');
const { testData } = require('../../resources/testData');
const { defineConfig } = require('cypress');
const { config } = require('../../global/config');

const API_KEY = config.gitMode
  ? process.env.CYPRESS_API_KEY_GIT || 'PROVIDE API KEY!'
  : process.env.CYPRESS_API_KEY_GITLESS || 'PROVIDE API KEY!';

const edgeCases = [
  {
    description: 'C131019 - Validate for Invalid-api-key',
    axe: {
      apiKey: process.env.INVALID_API_KEY || 'API_KEY',
      serverURL: testData.environment.domain,
    },
    expectedError: ['Invalid API key', '401']
  },
  {
    description: 'C131023 - No Server URL Provided',
    axe: {
      apiKey: API_KEY,
      serverURL: '',
    },
    expectedError: ['Invalid API key', '401', 'URI is not absolute']
  },
  {
    description: 'C131022 - Validate if providing an invalid server url',
    axe: {
      apiKey: API_KEY,
      serverURL: 'http://invalid:1234',
    },
    expectedError: ['getaddrinfo ENOTFOUND invalid', 'Could not write to variables.json file']
  },
{
  description: 'C131020 Validate if --headless is passed via ChromeOptions',
  axe: {
    apiKey: API_KEY,
    serverURL: testData.environment.domain,
  },
  expectedError: [
    '@axe-core/watcher does not support fully headless mode',
    'Expected error was not thrown',
    '@axe-core/watcher does not support Chrome\'s older "--headless" mode'
  ],
  args: ['--headless']
},
  {
    description: 'C131020 Validate if --incognito is passed via ChromeOptions',
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
    },
    expectedError: [
      '@axe-core/watcher does not support incognito mode',
      'You cannot use the **--incognito** command-line option with Chrome'
    ],
    args: ['--incognito', '--headless']
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
      edgeCases
    },
    defaultCommandTimeout: 60000,
    video: false,
    e2e: {
      specPattern: 'cypress/e2e/edgeCases.cy.js',
      supportFile: 'cypress/support/e2e.js',
      setupNodeEvents(on, config) {
        require('@shelex/cypress-allure-plugin/writer')(on, config);
        return config;
      }
    }
  })
);


