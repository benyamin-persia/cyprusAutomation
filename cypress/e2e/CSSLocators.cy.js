describe('CSS Selector Examples on OrangeHRM Login', () => {
  beforeEach(() => {
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')
  })

  it('Tag Selector: input', () => {
    cy.get('input').should('have.length.at.least', 1)
  })

  it('ID Selector: #username', () => {
    cy.get('#username').should('exist')
  })

  it('Class Selector: .orangehrm-login-button', () => {
    cy.get('.orangehrm-login-button').should('exist')
  })

  it('Attribute Selector: [placeholder="Username"]', () => {
    cy.get('[placeholder="Username"]').should('exist')
  })

  it('Tag + ID Selector: input#username', () => {
    cy.get('input#username').should('exist')
  })

  it('Tag + Class Selector: button.orangehrm-login-button', () => {
    cy.get('button.orangehrm-login-button').should('exist')
  })

  it('Tag + Attribute Selector: input[name="username"]', () => {
    cy.get('input[name="username"]').should('exist')
  })

  it('Tag + Class + Attribute Selector: input.orangehrm-login-button[type="submit"]', () => {
    cy.get('button.orangehrm-login-button[type="submit"]').should('exist')
  })
})
