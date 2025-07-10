/**
 * Visual Regression Testing Suite
 * Screenshot comparison and visual testing for UI consistency
 */

describe('Visual Regression Test Suite', () => {
  beforeEach(() => {
    cy.fixture('user').as('userData');
  });

  describe('Login Page Visual Tests', () => {
    it('should match login page baseline screenshot', () => {
      cy.visit('/auth/login');
      cy.wait(1000); // Wait for page to fully load
      
      // Take screenshot and compare with baseline
      cy.compareSnapshot('login-page', {
        capture: 'fullPage',
        errorThreshold: 0.1
      });
    });

    it('should match login form elements', () => {
      cy.visit('/auth/login');
      
      // Focus on form elements
      cy.get('.orangehrm-login-form').should('be.visible');
      cy.compareSnapshot('login-form-elements', {
        capture: 'viewport',
        errorThreshold: 0.05
      });
    });

    it('should match error state visual', () => {
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type('wronguser');
      cy.get('input[name="password"]').type('wrongpass');
      cy.get('button[type="submit"]').click();
      
      // Wait for error message
      cy.get('.oxd-alert-content-text').should('be.visible');
      cy.compareSnapshot('login-error-state', {
        capture: 'viewport',
        errorThreshold: 0.1
      });
    });
  });

  describe('Dashboard Visual Tests', () => {
    beforeEach(() => {
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
    });

    it('should match dashboard layout', () => {
      cy.url().should('include', '/dashboard');
      cy.wait(2000); // Wait for dashboard to load
      
      cy.compareSnapshot('dashboard-layout', {
        capture: 'fullPage',
        errorThreshold: 0.15
      });
    });

    it('should match navigation menu', () => {
      cy.get('.oxd-main-menu').should('be.visible');
      cy.compareSnapshot('navigation-menu', {
        capture: 'viewport',
        errorThreshold: 0.1
      });
    });

    it('should match user dropdown', () => {
      cy.get('.oxd-userdropdown-tab').click();
      cy.get('.oxd-dropdown-menu').should('be.visible');
      
      cy.compareSnapshot('user-dropdown', {
        capture: 'viewport',
        errorThreshold: 0.1
      });
    });
  });

  describe('Responsive Design Tests', () => {
    it('should match mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      cy.compareSnapshot('login-mobile', {
        capture: 'fullPage',
        errorThreshold: 0.15
      });
    });

    it('should match tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/auth/login');
      
      cy.compareSnapshot('login-tablet', {
        capture: 'fullPage',
        errorThreshold: 0.15
      });
    });

    it('should match desktop viewport', () => {
      cy.viewport(1920, 1080);
      cy.visit('/auth/login');
      
      cy.compareSnapshot('login-desktop', {
        capture: 'fullPage',
        errorThreshold: 0.1
      });
    });
  });

  describe('Component Visual Tests', () => {
    it('should match button states', () => {
      cy.visit('/auth/login');
      
      // Default state
      cy.get('button[type="submit"]').should('be.visible');
      cy.compareSnapshot('button-default', {
        capture: 'viewport',
        errorThreshold: 0.05
      });
      
      // Hover state
      cy.get('button[type="submit"]').trigger('mouseover');
      cy.compareSnapshot('button-hover', {
        capture: 'viewport',
        errorThreshold: 0.05
      });
    });

    it('should match input field states', () => {
      cy.visit('/auth/login');
      
      // Empty state
      cy.get('input[name="username"]').should('be.visible');
      cy.compareSnapshot('input-empty', {
        capture: 'viewport',
        errorThreshold: 0.05
      });
      
      // Focused state
      cy.get('input[name="username"]').focus();
      cy.compareSnapshot('input-focused', {
        capture: 'viewport',
        errorThreshold: 0.05
      });
      
      // Filled state
      cy.get('input[name="username"]').type('test');
      cy.compareSnapshot('input-filled', {
        capture: 'viewport',
        errorThreshold: 0.05
      });
    });
  });

  describe('Accessibility Visual Tests', () => {
    it('should match high contrast mode', () => {
      cy.visit('/auth/login');
      
      // Simulate high contrast mode
      cy.get('body').invoke('css', 'filter', 'contrast(200%)');
      cy.compareSnapshot('high-contrast-mode', {
        capture: 'viewport',
        errorThreshold: 0.2
      });
    });

    it('should match reduced motion mode', () => {
      cy.visit('/auth/login');
      
      // Simulate reduced motion
      cy.get('body').invoke('css', 'animation', 'none');
      cy.compareSnapshot('reduced-motion', {
        capture: 'viewport',
        errorThreshold: 0.1
      });
    });
  });
}); 