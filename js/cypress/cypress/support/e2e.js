// Import the axe-watcher commands.
require('@axe-core/watcher/dist/cypressCommands')
require('dotenv/config');
import '@shelex/cypress-allure-plugin'
beforeEach(() => {
  Cypress.on('uncaught:exception', () => {
    // Handle the error here or simply prevent Cypress from failing the test
    return false;
  });
})
// Flush axe-watcher results after each test.
afterEach(() => {
  cy.axeWatcherFlush()
})

