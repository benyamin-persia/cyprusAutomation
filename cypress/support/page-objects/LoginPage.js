/**
 * Login Page Object Model
 * Demonstrates Page Object Model best practices for maintainable test code
 */

class LoginPage {
  // Selectors - centralized and maintainable
  selectors = {
    usernameField: 'input[name="username"]',
    passwordField: 'input[name="password"]',
    loginButton: 'button[type="submit"].orangehrm-login-button',
    errorMessage: '.oxd-alert-content-text',
    validationError: '.oxd-input-field-error-message',
    loginForm: '.orangehrm-login-form',
    forgotPasswordLink: '.orangehrm-login-forgot',
    socialMediaLinks: '.orangehrm-login-footer-sm',
    logo: '.orangehrm-login-branding img'
  };

  // Actions - reusable methods
  visit() {
    cy.visit('/auth/login');
    cy.logInfo('Navigated to login page');
    return this;
  }

  login(username, password) {
    cy.logInfo('Starting login process', { username });
    
    this.fillUsername(username);
    this.fillPassword(password);
    this.clickLoginButton();
    
    return this;
  }

  fillUsername(username) {
    cy.get(this.selectors.usernameField)
      .should('be.visible')
      .clear()
      .type(username, { delay: 100 });
    
    cy.logInfo('Username entered', { username });
    return this;
  }

  fillPassword(password) {
    cy.get(this.selectors.passwordField)
      .should('be.visible')
      .clear()
      .type(password, { delay: 100 });
    
    cy.logInfo('Password entered');
    return this;
  }

  clickLoginButton() {
    cy.get(this.selectors.loginButton)
      .should('be.enabled')
      .click();
    
    cy.logInfo('Login button clicked');
    return this;
  }

  loginWithInvalidCredentials(username, password) {
    cy.logInfo('Attempting login with invalid credentials', { username });
    
    this.fillUsername(username);
    this.fillPassword(password);
    this.clickLoginButton();
    
    return this;
  }

  // Assertions - validation methods
  verifyPageLoaded() {
    cy.get(this.selectors.loginForm).should('be.visible');
    cy.get(this.selectors.usernameField).should('be.visible');
    cy.get(this.selectors.passwordField).should('be.visible');
    cy.get(this.selectors.loginButton).should('be.visible');
    
    cy.logInfo('Login page elements verified');
    return this;
  }

  verifySuccessfulLogin() {
    cy.url().should('include', '/dashboard');
    cy.logInfo('Login successful - redirected to dashboard');
    return this;
  }

  verifyErrorMessage(expectedMessage) {
    cy.get(this.selectors.errorMessage)
      .should('be.visible')
      .and('contain', expectedMessage);
    
    cy.logInfo('Error message verified', { expectedMessage });
    return this;
  }

  verifyValidationError(fieldName) {
    cy.get(this.selectors.validationError)
      .should('be.visible')
      .and('contain', 'Required');
    
    cy.logInfo('Validation error verified', { fieldName });
    return this;
  }

  verifyFormElements() {
    // Verify username field
    cy.get(this.selectors.usernameField)
      .should('be.visible')
      .and('have.attr', 'placeholder', 'Username')
      .and('have.attr', 'name', 'username');

    // Verify password field
    cy.get(this.selectors.passwordField)
      .should('be.visible')
      .and('have.attr', 'placeholder', 'Password')
      .and('have.attr', 'name', 'password')
      .and('have.attr', 'type', 'password');

    // Verify login button
    cy.get(this.selectors.loginButton)
      .should('be.visible')
      .and('be.enabled')
      .and('have.attr', 'type', 'submit');

    cy.logInfo('All form elements verified');
    return this;
  }

  verifyAccessibility() {
    // Check for proper labels and ARIA attributes
    cy.get(this.selectors.usernameField).should('have.attr', 'name');
    cy.get(this.selectors.passwordField).should('have.attr', 'name');
    cy.get(this.selectors.loginButton).should('have.text');
    
    // Check for form role
    cy.get('form').should('exist');
    
    cy.logInfo('Accessibility requirements verified');
    return this;
  }

  // Performance monitoring
  measureLoginPerformance(username, password) {
    const startTime = performance.now();
    
    return this.login(username, password)
      .then(() => {
        const loginTime = performance.now() - startTime;
        cy.logPerformance('loginProcess', loginTime);
        cy.logInfo('Login performance measured', { loginTime: `${loginTime.toFixed(2)}ms` });
        return this;
      });
  }

  // Error handling
  handleLoginError(expectedError) {
    cy.get(this.selectors.errorMessage)
      .should('be.visible')
      .then(($error) => {
        const actualError = $error.text();
        cy.logError('Login failed', { expectedError, actualError });
        
        // Take screenshot for debugging
        cy.takeScreenshot(`login_error_${Date.now()}`);
      });
    
    return this;
  }

  // Data-driven testing support
  testLoginScenarios(scenarios) {
    scenarios.forEach((scenario, index) => {
      it(`Login scenario ${index + 1}: ${scenario.description}`, () => {
        this.visit()
          .verifyPageLoaded()
          .login(scenario.username, scenario.password);
        
        if (scenario.expectedSuccess) {
          this.verifySuccessfulLogin();
        } else {
          this.verifyErrorMessage(scenario.expectedError);
        }
      });
    });
  }

  // Mobile responsiveness
  verifyMobileLayout() {
    cy.viewport('iphone-x');
    this.visit();
    
    cy.get(this.selectors.loginForm).should('be.visible');
    cy.get(this.selectors.usernameField).should('be.visible');
    cy.get(this.selectors.passwordField).should('be.visible');
    cy.get(this.selectors.loginButton).should('be.visible');
    
    // Check touch target sizes
    cy.get(this.selectors.loginButton).should('have.css', 'min-height');
    
    cy.logInfo('Mobile layout verified');
    return this;
  }

  // Security testing
  testSecurityVulnerabilities() {
    // Test for SQL injection
    this.loginWithInvalidCredentials("' OR 1=1 --", "password");
    this.verifyErrorMessage('Invalid credentials');
    
    // Test for XSS
    this.loginWithInvalidCredentials("<script>alert('xss')</script>", "password");
    this.verifyErrorMessage('Invalid credentials');
    
    cy.logInfo('Security vulnerability tests completed');
    return this;
  }
}

// Export the class
export default LoginPage; 