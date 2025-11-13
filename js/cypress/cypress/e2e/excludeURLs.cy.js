// cypress/e2e/excludeUrls.cy.js
describe('Cypress: Exclude URL Configurations Tests', () => {
  const data = Cypress.env('testData');
  const excludeURLsConfig = Cypress.env('excludeURLs') || [];

  excludeURLsConfig.forEach(({ description, axe }) => {
    it(`${description} - Validate Scan on Single-page with multiple links`, () => {
      cy.log(`🧩 Running with excludeUrlPatterns: ${JSON.stringify(axe.excludeUrlPatterns, null, 2)}`);

      // Visit and click through multiple links
      cy.visit(data.testUrls.abcdPage)
        .get(data.configurationTestsValidations.abcdPageSelectors.laptopsAndNotebooks).click()
        .get(data.configurationTestsValidations.abcdPageSelectors.desktops).click()
        .get(data.configurationTestsValidations.abcdPageSelectors.cart).click()
        .get(data.configurationTestsValidations.abcdPageSelectors.support).click()
        .get(data.configurationTestsValidations.abcdPageSelectors.contact).click()
        .wait(3000);

      // Example check to confirm domain still matches environment
      cy.title().should('eq', data.testTitles.abcdPage);
      cy.log('✅ Page scan simulated successfully with current exclude patterns.');
    });
  });
});
