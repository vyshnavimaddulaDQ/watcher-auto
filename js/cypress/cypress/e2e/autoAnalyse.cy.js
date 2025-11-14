describe('Cypress: AutoAnalyse mode tests', () => {
  const data = Cypress.env('testData')
  it('C130939	Validate Scan on Clean-Page to zero issues found', () => {
    cy.visit(data.testUrls.cleanPage).wait(1000)
    cy.title().should('eq', data.testTitles.cleanPage)
  })
  it('C130940	Validate Scan on Dynamic-page',  () => {
      cy.visit(data.testUrls.marsPage)
      cy.title().should('eq',data.testTitles.marsPage)
    })
    it('C130941	Validate Scan on Static-page', () => {
    cy.visit(data.testUrls.brokenWorkshop)
    cy.title().should('eq', data.testTitles.brokenWorkshop)
  })
  it('C130942	Verify Scan results when dom changes ', () => {
   cy.visit(data.testUrls.marsPage)
    .wait(1000)
    .get(data.configurationTestsValidations.dynamicPageSelectors.activitiesLabel).click().wait(1000)
     .get(data.configurationTestsValidations.dynamicPageSelectors.passesLabel).click().wait(1000)
     .get(data.configurationTestsValidations.dynamicPageSelectors.hotelsLabel).click().wait(1000)
     .get(data.configurationTestsValidations.dynamicPageSelectors.reservationsLabel).click().wait(1000)
      .get(data.configurationTestsValidations.dynamicPageSelectors.roundtripRadioButton).click().wait(1000)

  })
   it('C130943	Validate the page whether playwright able to scan iframes', () => {
    cy.visit(data.testUrls.qaTestPage).wait(1000)
    cy.title().should('eq',data.testTitles.qaTestPage)
  })
   it('C130944	Validate Scan on Single-page with multiple links', () => {
   
    cy.visit(data.testUrls.abcdPage)
      .get(data.configurationTestsValidations.abcdPageSelectors.laptopsAndNotebooks).click()
      .get(data.configurationTestsValidations.abcdPageSelectors.desktops).click()
      .get(data.configurationTestsValidations.abcdPageSelectors.cart).click()
      .get(data.configurationTestsValidations.abcdPageSelectors.support).click()
      .get(data.configurationTestsValidations.abcdPageSelectors.contact).click()
       .wait(3000)
  })
  
  
   it('C131025	Create a CI/CD job to be able to run the suite using java-selenium integration', () => {
      cy.visit(data.testUrls.brokenWorkshop)
      cy.title().should('eq',data.testTitles.brokenWorkshop)
    })
})
