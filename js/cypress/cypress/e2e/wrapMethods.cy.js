describe('Cypress: Wrap Methods Tests Validation', () => {
  const data = Cypress.env('testData')
  const baseUrl = data.testUrls.actions
 

  it('C131100	Verify scan success and expected issues for wrap method type and fill()', () => {
    cy.visit(baseUrl)
    cy.get('input[name="username"]').type('testuser')
    cy.get('input[name="password"]').type('password123')
    cy.get('select[name="options"]').select('Option1')
    cy.get('input[type="checkbox"]').check()
    cy.get('input[type="checkbox"]').uncheck()
    cy.get('input[type="radio"][value="radio1"]').check()
  })

  it('C131098	Verify scan success and expected issues for wrap method click', () => {
    cy.visit(baseUrl)
    cy.get('button[type="submit"]').click()
  })

  it('C131099	Verify scan success and expected issues on verify text on the page', () => {
    cy.visit(baseUrl)
    cy.get('button[type="submit"]').click()
    cy.contains('Welcome, testuser')
  })

  it('C131101	Verify scan success and expected issues to verify element visibility', () => {
    cy.visit(baseUrl)
    cy.get('button[type="submit"]').click()
    cy.get('#welcome-message').should('be.visible')
  })

 

  Cypress.Commands.add('login', (username, password) => {
    cy.get('input[name="username"]').type(username)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
  })

  it('Verify scan success and expected issues for wrap method Login with Command', () => {
    cy.visit(baseUrl)
    cy.login('testuser', 'password123')
    cy.get('#welcome-message').should('be.visible')
  })

 

  it('Verify scan success and expected issues for wrap method  to handle alerts', () => {
    cy.visit(baseUrl)
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Alert message')
    })
    cy.get('button#trigger-alert').click()
  })
})


  