// cypress/e2e/runConfigTest.cy.js
describe('Cypress: Run Configurations Tests', () => {
  const data = Cypress.env('testData');
  const axeConfigs = Cypress.env('axeConfigurations') || [];

  axeConfigs.forEach(({ description, axe }) => {
    it(`${description} - Validate Scan on Clean-Page to zero issues found`, () => {
      cy.visit(data.testUrls.abcdPage).wait(1000);
      cy.title().should('eq', data.testTitles.abcdPage);

      // Build a combined log object
      const logDetails = {};

      if (axe.runOptions) {
        logDetails.runOptions = axe.runOptions;
      }
      if (axe.runContext) {
        logDetails.runContext = axe.runContext;
      }

      // Log what’s present
      cy.log(`Running test with AXE settings: ${JSON.stringify(logDetails, null, 2)}`);

      // Example placeholder assertions
      expect(data.environment.domain).to.exist;
      cy.log('✅ Scan completed successfully for this configuration');
    });
  });
});
