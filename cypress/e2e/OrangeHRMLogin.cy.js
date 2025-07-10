describe('OrangeHRM Login Test Suite', () => {
  beforeEach(() => {
    cy.fixture('user').as('userData');
    cy.fixture('testUsers').as('testUsers');
    cy.takeScreenshotOnFailure(); // Enable automatic screenshots on failure
  });

  describe('Positive Test Cases', () => {
    it('should successfully log in with valid credentials', function () {
      cy.logInfo('Starting positive login test');
      
      // Assert login form elements are present
      cy.assertElementVisible('input[name="username"]', 'Username field should be visible');
      cy.assertElementVisible('input[name="password"]', 'Password field should be visible');
      cy.assertElementVisible('button[type="submit"].orangehrm-login-button', 'Login button should be visible');
      
      // Assert form field attributes
      cy.assertFormFieldPlaceholder('input[name="username"]', 'Username', 'Username field should have correct placeholder');
      cy.assertFormFieldPlaceholder('input[name="password"]', 'Password', 'Password field should have correct placeholder');
      cy.assertFormFieldType('input[name="password"]', 'password', 'Password field should have password type');
      
      cy.loginToOrangeHRMWithLogging(this.userData.username, this.userData.password);
      
      // Assert successful login
      cy.assertUrlContains('/dashboard', 'Should redirect to dashboard after login');
      cy.assertElementVisible('header', 'Dashboard header should be visible');
      cy.assertElementContains('header', 'Dashboard', 'Dashboard should contain dashboard text');
      cy.assertElementVisible('.oxd-main-menu', 'Main menu should be visible after login');
      
      cy.logInfo('Positive login test completed successfully');
    });

    it('should verify successful login redirects to dashboard', function () {
      cy.logInfo('Starting dashboard redirect test');
      
      cy.measureAction('loginProcess', () => {
        cy.loginToOrangeHRM(this.userData.username, this.userData.password);
      });
      
      // Assert URL and page elements
      cy.assertUrlEquals('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index', 'URL should match dashboard');
      cy.assertElementVisible('.oxd-main-menu', 'Main menu should be visible');
      cy.assertElementCountAtLeast('.oxd-main-menu-item', 1, 'Should have at least one menu item');
      
      cy.logInfo('Dashboard redirect test completed');
    });
  });

  describe('Negative Test Cases', () => {
    it('should show error message for invalid username', function () {
      cy.logInfo('Starting invalid username test');
      
      cy.loginToOrangeHRMWithInvalidCredentials('wronguser', this.userData.password);
      
      // Assert error message appears
      cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
      cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
      
      // Assert user stays on login page
      cy.assertUrlContains('/auth/login', 'Should remain on login page');
      
      cy.takeScreenshot('invalid_username_error');
      cy.logInfo('Invalid username test completed');
    });

    it('should show error message for invalid password', function () {
      cy.logInfo('Starting invalid password test');
      
      cy.loginToOrangeHRMWithInvalidCredentials(this.userData.username, 'wrongpassword');
      
      // Assert error message appears
      cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
      cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
      
      cy.takeScreenshot('invalid_password_error');
      cy.logInfo('Invalid password test completed');
    });

    it('should show error message for both invalid username and password', function () {
      cy.logInfo('Starting invalid credentials test');
      
      cy.loginToOrangeHRMWithInvalidCredentials('wronguser', 'wrongpassword');
      
      // Assert error message appears
      cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
      cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
      
      cy.takeScreenshot('invalid_credentials_error');
      cy.logInfo('Invalid credentials test completed');
    });

    it('should show error message for empty username field', () => {
      cy.logInfo('Starting empty username test');
      cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      
      // Fill only password
      cy.get('input[name="password"]').should('be.visible').clear().type('admin123');
      cy.get('button[type="submit"].orangehrm-login-button').should('be.enabled').click();
      
      // Assert validation error
      cy.assertElementVisible('.oxd-input-field-error-message', 'Validation error should be visible');
      cy.assertElementContains('.oxd-input-field-error-message', 'Required', 'Should show required field error');
      
      cy.takeScreenshot('empty_username_error');
      cy.logInfo('Empty username test completed');
    });

    it('should show error message for empty password field', () => {
      cy.logInfo('Starting empty password test');
      cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      
      // Fill only username
      cy.get('input[name="username"]').should('be.visible').clear().type('Admin');
      cy.get('button[type="submit"].orangehrm-login-button').should('be.enabled').click();
      
      // Assert validation error
      cy.assertElementVisible('.oxd-input-field-error-message', 'Validation error should be visible');
      cy.assertElementContains('.oxd-input-field-error-message', 'Required', 'Should show required field error');
      
      cy.takeScreenshot('empty_password_error');
      cy.logInfo('Empty password test completed');
    });

    it('should show error messages for both empty fields', () => {
      cy.logInfo('Starting empty fields test');
      cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      
      // Submit empty form
      cy.get('button[type="submit"].orangehrm-login-button').should('be.enabled').click();
      
      // Assert multiple validation errors
      cy.assertElementCount('.oxd-input-field-error-message', 2, 'Should show two validation errors');
      cy.assertElementContains('.oxd-input-field-error-message', 'Required', 'Should show required field errors');
      
      cy.takeScreenshot('empty_fields_error');
      cy.logInfo('Empty fields test completed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle username with leading and trailing spaces', function () {
      cy.logInfo('Starting whitespace username test');
      
      cy.loginToOrangeHRMWithInvalidCredentials(' Admin ', this.userData.password);
      
      // Assert error message appears
      cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
      cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
      
      cy.takeScreenshot('whitespace_username_error');
      cy.logInfo('Whitespace username test completed');
    });

    it('should handle password with leading and trailing spaces', function () {
      cy.logInfo('Starting whitespace password test');
      
      cy.loginToOrangeHRMWithInvalidCredentials(this.userData.username, ' admin123 ');
      
      // Assert error message appears
      cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
      cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
      
      cy.takeScreenshot('whitespace_password_error');
      cy.logInfo('Whitespace password test completed');
    });

    it('should handle special characters in username', function () {
      cy.logInfo('Starting special characters username test');
      
      cy.loginToOrangeHRMWithInvalidCredentials("Admin'", this.userData.password);
      
      // Assert error message appears
      cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
      cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
      
      cy.takeScreenshot('special_chars_username_error');
      cy.logInfo('Special characters username test completed');
    });

    it('should handle special characters in password', function () {
      cy.logInfo('Starting special characters password test');
      
      cy.loginToOrangeHRMWithInvalidCredentials(this.userData.username, 'admin123<script>');
      
      // Assert error message appears
      cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
      cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
      
      cy.takeScreenshot('special_chars_password_error');
      cy.logInfo('Special characters password test completed');
    });

    it('should handle case sensitivity in username', function () {
      cy.logInfo('Starting case sensitivity username test');
      
      cy.loginToOrangeHRMWithInvalidCredentials('admin', this.userData.password);
      
      // Assert error message appears
      cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
      cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
      
      cy.takeScreenshot('case_sensitivity_username_error');
      cy.logInfo('Case sensitivity username test completed');
    });

    it('should handle case sensitivity in password', function () {
      cy.logInfo('Starting case sensitivity password test');
      
      cy.loginToOrangeHRMWithInvalidCredentials(this.userData.username, 'ADMIN123');
      
      // Assert error message appears
      cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
      cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
      
      cy.takeScreenshot('case_sensitivity_password_error');
      cy.logInfo('Case sensitivity password test completed');
    });
  });

  describe('Data-Driven Tests', () => {
    it('should test multiple invalid user combinations', function () {
      cy.logInfo('Starting data-driven invalid user tests');
      
      this.testUsers.invalidUsers.forEach((user, index) => {
        cy.logInfo(`Testing invalid user combination ${index + 1}`, user);
        
        cy.loginToOrangeHRMWithInvalidCredentials(user.username, user.password);
        
        // Assert error message appears
        cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
        cy.assertElementContains('.oxd-alert-content-text', user.errorMessage, 'Should show correct error message');
        
        cy.takeScreenshot(`invalid_user_combination_${index + 1}`);
        cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      });
      
      cy.logInfo('Data-driven invalid user tests completed');
    });

    it('should test empty field combinations', function () {
      cy.logInfo('Starting data-driven empty field tests');
      
      this.testUsers.emptyFields.forEach((user, index) => {
        cy.logInfo(`Testing empty field combination ${index + 1}`, user);
        
        cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
        
        if (user.username) {
          cy.get('input[name="username"]').should('be.visible').clear().type(user.username);
        }
        if (user.password) {
          cy.get('input[name="password"]').should('be.visible').clear().type(user.password);
        }
        
        cy.get('button[type="submit"].orangehrm-login-button').should('be.enabled').click();
        
        // Assert validation error appears
        cy.assertElementVisible('.oxd-input-field-error-message', 'Validation error should be visible');
        
        cy.takeScreenshot(`empty_field_combination_${index + 1}`);
        cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      });
      
      cy.logInfo('Data-driven empty field tests completed');
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection attempts', function () {
      cy.logInfo('Starting SQL injection tests');
      
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'--",
        "admin'/*"
      ];

      sqlInjectionAttempts.forEach((attempt, index) => {
        cy.logInfo(`Testing SQL injection attempt ${index + 1}`, { attempt });
        
        cy.loginToOrangeHRMWithInvalidCredentials(attempt, this.userData.password);
        
        // Assert error message appears
        cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
        cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
        
        cy.takeScreenshot(`sql_injection_attempt_${index + 1}`);
        cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      });
      
      cy.logInfo('SQL injection tests completed');
    });

    it('should prevent XSS attempts', function () {
      cy.logInfo('Starting XSS tests');
      
      const xssAttempts = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>"
      ];

      xssAttempts.forEach((attempt, index) => {
        cy.logInfo(`Testing XSS attempt ${index + 1}`, { attempt });
        
        cy.loginToOrangeHRMWithInvalidCredentials(attempt, this.userData.password);
        
        // Assert error message appears
        cy.assertElementVisible('.oxd-alert-content-text', 'Error message should be visible');
        cy.assertElementContains('.oxd-alert-content-text', 'Invalid credentials', 'Should show invalid credentials error');
        
        cy.takeScreenshot(`xss_attempt_${index + 1}`);
        cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      });
      
      cy.logInfo('XSS tests completed');
    });
  });

  describe('UI/UX Tests', () => {
    it('should verify login form elements are present and functional', () => {
      cy.logInfo('Starting UI/UX form elements test');
      cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      
      // Assert form elements are present
      cy.assertElementVisible('input[name="username"]', 'Username field should be visible');
      cy.assertElementVisible('input[name="password"]', 'Password field should be visible');
      cy.assertElementVisible('button[type="submit"].orangehrm-login-button', 'Login button should be visible');
      
      // Assert form field attributes
      cy.assertFormFieldPlaceholder('input[name="username"]', 'Username', 'Username field should have correct placeholder');
      cy.assertFormFieldPlaceholder('input[name="password"]', 'Password', 'Password field should have correct placeholder');
      cy.assertFormFieldType('input[name="password"]', 'password', 'Password field should have password type');
      
      // Assert form functionality
      cy.assertElementVisible('input[name="username"]', 'Username field should be focused');
      cy.get('input[name="username"]').type('Admin');
      cy.get('input[name="password"]').type('admin123');
      cy.assertElementEnabled('button[type="submit"].orangehrm-login-button', 'Login button should be enabled');
      
      cy.takeScreenshot('login_form_elements');
      cy.logInfo('UI/UX form elements test completed');
    });

    it('should verify tab navigation works correctly', () => {
      cy.logInfo('Starting tab navigation test');
      cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      
      // Test tab navigation
      cy.get('input[name="username"]').type('Admin');
      cy.get('input[name="username"]').tab();
      cy.assertElementVisible('input[name="password"]', 'Password field should be focused after tab');
      cy.get('input[name="password"]').type('admin123');
      cy.get('input[name="password"]').tab();
      cy.assertElementVisible('button[type="submit"].orangehrm-login-button', 'Login button should be focused after tab');
      
      cy.takeScreenshot('tab_navigation');
      cy.logInfo('Tab navigation test completed');
    });
  });

  describe('Session Management', () => {
    it('should successfully logout after login', function () {
      cy.logInfo('Starting logout test');
      
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
      cy.assertUrlContains('/dashboard', 'Should be on dashboard after login');
      
      cy.logoutFromOrangeHRM();
      cy.assertUrlContains('/auth/login', 'Should redirect to login page after logout');
      
      cy.takeScreenshot('logout_successful');
      cy.logInfo('Logout test completed');
    });

    it('should verify user cannot access dashboard without login', () => {
      cy.logInfo('Starting unauthorized access test');
      
      cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
      cy.assertUrlContains('/auth/login', 'Should redirect to login page for unauthorized access');
      
      cy.takeScreenshot('unauthorized_access');
      cy.logInfo('Unauthorized access test completed');
    });
  });

  describe('Performance Tests', () => {
    it('should load login page within acceptable time', () => {
      cy.logInfo('Starting page load performance test');
      
      const startTime = Date.now();
      cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', {
        onBeforeLoad: () => {
          const endTime = Date.now();
          const loadTime = endTime - startTime;
          cy.logPerformance('pageLoad', loadTime);
          expect(loadTime).to.be.lessThan(5000); // 5 seconds max
        }
      });
      
      // Assert page loaded successfully
      cy.assertElementVisible('input[name="username"]', 'Login form should be visible after page load');
      
      cy.takeScreenshot('page_load_performance');
      cy.logInfo('Page load performance test completed');
    });

    it('should complete login process within acceptable time', function () {
      cy.logInfo('Starting login performance test');
      
      const startTime = Date.now();
      cy.loginToOrangeHRM(this.userData.username, this.userData.password);
      
      cy.url().should('include', '/dashboard').then(() => {
        const endTime = Date.now();
        const loginTime = endTime - startTime;
        cy.logPerformance('loginProcess', loginTime);
        expect(loginTime).to.be.lessThan(10000); // 10 seconds max
      });
      
      // Assert login was successful
      cy.assertUrlContains('/dashboard', 'Should be on dashboard after login');
      cy.assertElementVisible('.oxd-main-menu', 'Main menu should be visible after login');
      
      cy.takeScreenshot('login_performance');
      cy.logInfo('Login performance test completed');
    });
  });
});
