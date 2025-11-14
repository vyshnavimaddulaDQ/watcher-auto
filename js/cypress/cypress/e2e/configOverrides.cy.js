// cypress/e2e/configOverrides.cy.js
describe('Cypress: Configure Overrides tests', () => {
  const data = Cypress.env('testData');
  const overrides = Cypress.env('configOverrides') || [];

  overrides.forEach(({ description, axe }) => {
    it(`${description} - Validate Scans for Global configurations overriding`, () => {
      cy.log(`Running test with overrides: ${JSON.stringify(axe.configurationOverrides)}`);
      cy.visit(data.testUrls.abcdPage).wait(1000);
      cy.title().should('eq', data.testTitles.abcdPage);

      // Example assertion for demonstration
      expect(axe.apiKey).to.exist;
      expect(axe.serverURL).to.eq(data.environment.domain);
    });
  });
});
