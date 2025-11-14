var cypressConfig = require('@axe-core/watcher').cypressConfig;
require('dotenv/config');
var testData = require('../../resources/testData').testData;
var defineConfig = require('cypress').defineConfig;
var config = require('../../global/config').config;

const API_KEY = config.gitMode
  ? process.env.CYPRESS_API_KEY_GIT || 'PROVIDE API KEY!'
  : process.env.CYPRESS_API_KEY_GITLESS || 'PROVIDE API KEY!';


module.exports = defineConfig(
  cypressConfig({
    axe: {
      apiKey: API_KEY,
      serverURL: testData.environment.domain,
      autoAnalyze: false
    },
    env: {
      testData: testData
    },
    defaultCommandTimeout: 10000,
     e2e: {
      specPattern: 'cypress/e2e/manualmode.cy.js',
      supportFile: 'cypress/support/e2e.js',
      setupNodeEvents(on, config) {
        require('@shelex/cypress-allure-plugin/writer')(on, config)
        return config
      }
    }
  })
)
