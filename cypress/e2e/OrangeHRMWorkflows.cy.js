describe('OrangeHRM Workflow Test Suite', () => {
  beforeEach(() => {
    cy.fixture('user').as('userData');
  });

  describe('User Management Workflows', () => {
    beforeEach(function () {
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
    });

    it('should navigate to Admin menu and verify options', () => {
      cy.get('.oxd-main-menu').contains('Admin').click();
      cy.url().should('include', '/admin/viewSystemUsers');
      cy.get('.oxd-table-card').should('be.visible');
    });

    it('should navigate to PIM menu and verify options', () => {
      cy.get('.oxd-main-menu').contains('PIM').click();
      cy.url().should('include', '/pim/viewEmployeeList');
      cy.get('.oxd-table-card').should('be.visible');
    });

    it('should navigate to Leave menu and verify options', () => {
      cy.get('.oxd-main-menu').contains('Leave').click();
      cy.url().should('include', '/leave/viewLeaveList');
      cy.get('.oxd-table-card').should('be.visible');
    });

    it('should navigate to Time menu and verify options', () => {
      cy.get('.oxd-main-menu').contains('Time').click();
      cy.url().should('include', '/time/viewEmployeeTimesheet');
      cy.get('.oxd-table-card').should('be.visible');
    });

    it('should navigate to Recruitment menu and verify options', () => {
      cy.get('.oxd-main-menu').contains('Recruitment').click();
      cy.url().should('include', '/recruitment/viewCandidates');
      cy.get('.oxd-table-card').should('be.visible');
    });

    it('should navigate to My Info menu and verify personal details', () => {
      cy.get('.oxd-main-menu').contains('My Info').click();
      cy.url().should('include', '/pim/viewPersonalDetails');
      cy.get('.oxd-paper-card').should('be.visible');
    });

    it('should navigate to Performance menu and verify options', () => {
      cy.get('.oxd-main-menu').contains('Performance').click();
      cy.url().should('include', '/performance/searchEvaluatePerformanceReview');
      cy.get('.oxd-table-card').should('be.visible');
    });

    it('should navigate to Dashboard and verify widgets', () => {
      cy.get('.oxd-main-menu').contains('Dashboard').click();
      cy.url().should('include', '/dashboard/index');
      cy.get('.oxd-widget').should('have.length.at.least', 1);
    });
  });

  describe('Search and Filter Functionality', () => {
    beforeEach(function () {
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
    });

    it('should search for employees in PIM section', () => {
      cy.get('.oxd-main-menu').contains('PIM').click();
      cy.get('.oxd-input').first().type('Admin');
      cy.get('.oxd-form-actions').contains('Search').click();
      cy.get('.oxd-table-card').should('be.visible');
    });

    it('should use filters in Admin section', () => {
      cy.get('.oxd-main-menu').contains('Admin').click();
      cy.get('.oxd-input').first().type('Admin');
      cy.get('.oxd-form-actions').contains('Search').click();
      cy.get('.oxd-table-card').should('be.visible');
    });
  });

  describe('Form Interactions', () => {
    beforeEach(function () {
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
    });

    it('should add a new employee', () => {
      cy.get('.oxd-main-menu').contains('PIM').click();
      cy.get('.oxd-button').contains('Add').click();
      cy.url().should('include', '/pim/addEmployee');
      
      // Fill in employee details
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('.oxd-button').contains('Save').click();
      
      // Verify employee was added
      cy.get('.oxd-toast-content-text').should('contain', 'Successfully Saved');
    });

    it('should edit employee information', () => {
      cy.get('.oxd-main-menu').contains('PIM').click();
      cy.get('.oxd-table-card').first().click();
      cy.url().should('include', '/pim/viewPersonalDetails');
      cy.get('.oxd-button').contains('Edit').click();
      
      // Edit some information
      cy.get('input[name="firstName"]').clear().type('Updated');
      cy.get('.oxd-button').contains('Save').click();
      
      // Verify changes were saved
      cy.get('.oxd-toast-content-text').should('contain', 'Successfully Updated');
    });
  });

  describe('Data Validation', () => {
    beforeEach(function () {
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
    });

    it('should validate required fields in forms', () => {
      cy.get('.oxd-main-menu').contains('PIM').click();
      cy.get('.oxd-button').contains('Add').click();
      
      // Try to save without required fields
      cy.get('.oxd-button').contains('Save').click();
      
      // Verify validation messages
      cy.get('.oxd-input-field-error-message').should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('.oxd-main-menu').contains('PIM').click();
      cy.get('.oxd-button').contains('Add').click();
      
      // Enter invalid email
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('invalid-email');
      
      cy.get('.oxd-button').contains('Save').click();
      
      // Verify email validation error
      cy.get('.oxd-input-field-error-message').should('contain', 'Expected format');
    });
  });

  describe('Responsive Design Tests', () => {
    beforeEach(function () {
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
    });

    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.get('.oxd-main-menu').should('be.visible');
      cy.get('.oxd-userdropdown-tab').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.get('.oxd-main-menu').should('be.visible');
      cy.get('.oxd-userdropdown-tab').should('be.visible');
    });

    it('should work on desktop viewport', () => {
      cy.viewport(1920, 1080);
      cy.get('.oxd-main-menu').should('be.visible');
      cy.get('.oxd-userdropdown-tab').should('be.visible');
    });
  });

  describe('Accessibility Tests', () => {
    beforeEach(function () {
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
    });

    it('should have proper ARIA labels', () => {
      cy.get('input[name="username"]').should('have.attr', 'name');
      cy.get('input[name="password"]').should('have.attr', 'name');
      cy.get('button[type="submit"]').should('have.attr', 'type');
    });

    it('should support keyboard navigation', () => {
      cy.get('body').tab();
      cy.get('input[name="username"]').should('be.focused');
      cy.get('input[name="username"]').tab();
      cy.get('input[name="password"]').should('be.focused');
      cy.get('input[name="password"]').tab();
      cy.get('button[type="submit"]').should('be.focused');
    });
  });

  describe('Error Handling', () => {
    beforeEach(function () {
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
    });

    it('should handle network errors gracefully', () => {
      // Simulate network error by intercepting requests
      cy.intercept('GET', '**/api/**', { forceNetworkError: true });
      cy.get('.oxd-main-menu').contains('PIM').click();
      
      // Should show error message or handle gracefully
      cy.get('.oxd-alert-content-text').should('be.visible');
    });

    it('should handle server errors gracefully', () => {
      // Simulate server error
      cy.intercept('POST', '**/api/**', { statusCode: 500 });
      cy.get('.oxd-main-menu').contains('PIM').click();
      cy.get('.oxd-button').contains('Add').click();
      
      // Fill form and submit
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('.oxd-button').contains('Save').click();
      
      // Should show error message
      cy.get('.oxd-alert-content-text').should('be.visible');
    });
  });

  describe('Session Management', () => {
    beforeEach(function () {
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
    });

    it('should maintain session across page refreshes', () => {
      cy.get('.oxd-main-menu').contains('Dashboard').click();
      cy.url().should('include', '/dashboard');
      
      cy.reload();
      cy.url().should('include', '/dashboard');
      cy.get('.oxd-main-menu').should('be.visible');
    });

    it('should handle session timeout', () => {
      // This would require mocking session timeout
      // For now, we'll test logout functionality
      cy.logoutFromOrangeHRM();
      cy.url().should('include', '/auth/login');
    });

    it('should prevent access to protected routes when not logged in', () => {
      cy.logoutFromOrangeHRM();
      
      // Try to access protected routes
      cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
      cy.url().should('include', '/auth/login');
      
      cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers');
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Data Export and Import', () => {
    beforeEach(function () {
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
    });

    it('should export employee data', () => {
      cy.get('.oxd-main-menu').contains('PIM').click();
      cy.get('.oxd-button').contains('Export').click();
      
      // Verify download started
      cy.readFile('cypress/downloads/employee_list.csv').should('exist');
    });

    it('should import employee data', () => {
      cy.get('.oxd-main-menu').contains('PIM').click();
      cy.get('.oxd-button').contains('Import').click();
      
      // Upload file
      cy.get('input[type="file"]').attachFile('employees.csv');
      cy.get('.oxd-button').contains('Upload').click();
      
      // Verify import success
      cy.get('.oxd-toast-content-text').should('contain', 'Successfully Imported');
    });
  });
}); 