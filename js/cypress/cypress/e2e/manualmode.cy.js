describe('Cypress: Manual  mode tests', () => {
   const data = Cypress.env('testData')
  it('C130952	Verify zero findings in scan results when no Analyze() API is called', () => {
    cy.visit(data.testUrls.cleanPage).wait(1000)
    cy.title().should('eq', data.testTitles.cleanPage)
  })
   it('C130953	Verify findings in scan results when single Analyze() API is called', () => {
    cy.visit(data.testUrls.abcdPage)
    .axeWatcherAnalyze()
  })
   it('C130954	Verify findings in scan results when Start() and Stop() APIs are called once', () => {
    cy.axeWatcherStart()
    cy.visit(data.testUrls.brokenWorkshop)
    cy.axeWatcherStop()
  })
   it('C130955	Verify findings in scan results when chaining Analyze() API is called ', () => {

    cy.visit(data.testUrls.abcdPage)
    cy.axeWatcherAnalyze()
    cy.axeWatcherAnalyze()
    cy.axeWatcherAnalyze()
    cy.axeWatcherAnalyze()
      
  })

  it('C130956	Verify x number of pagestates in scan results for Analyze() API invoked x number of times ', () => {

    cy.visit(data.testUrls.abcdPage)
    cy.axeWatcherAnalyze()
    cy.axeWatcherAnalyze()
    cy.axeWatcherAnalyze()
    cy.axeWatcherAnalyze()
      
  })
  
  it('C130957	Verify findings in scan results when Start() and Stop() APIs are called multiple times', () => {
    cy.axeWatcherStart()
    cy.visit(data.testUrls.marsPage)
    .wait(1000)
    .axeWatcherStop()
        .get(data.configurationTestsValidations.dynamicPageSelectors.activitiesLabel).click().wait(1000)
        .axeWatcherStart()
        .axeWatcherStop()
        .get(data.configurationTestsValidations.dynamicPageSelectors.passesLabel).click().wait(1000)
         .axeWatcherStart()
        .axeWatcherStop()
        .get(data.configurationTestsValidations.dynamicPageSelectors.hotelsLabel).click().wait(1000)
         .axeWatcherStart()
        .get(data.configurationTestsValidations.dynamicPageSelectors.reservationsLabel).click().wait(1000)
        .axeWatcherStop()
         .axeWatcherStart()
        .get(data.configurationTestsValidations.dynamicPageSelectors.roundtripRadioButton).click().wait(1000)
        .axeWatcherStop()
  })

  it('C130958	Verify findings in scan results when Analyze() is called between multiple Start() and Stop() APIs', () => {
    cy.axeWatcherStart()
    cy.visit(data.testUrls.marsPage)
    .wait(1000)
    .axeWatcherAnalyze()
    .axeWatcherStop()
        .get(data.configurationTestsValidations.dynamicPageSelectors.activitiesLabel).click().wait(1000)
        .axeWatcherStart()
         .axeWatcherAnalyze()
        .axeWatcherStop()
        .get(data.configurationTestsValidations.dynamicPageSelectors.passesLabel).click().wait(1000)
         .axeWatcherStart()
        .axeWatcherStop()
        .get(data.configurationTestsValidations.dynamicPageSelectors.hotelsLabel).click().wait(1000)
         .axeWatcherStart()
        .get(data.configurationTestsValidations.dynamicPageSelectors.reservationsLabel).click().wait(1000)
        .axeWatcherStop()
         .axeWatcherStart()
          .axeWatcherAnalyze()
        .get(data.configurationTestsValidations.dynamicPageSelectors.roundtripRadioButton).click().wait(1000)
        .axeWatcherStop()
  })
})
