// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('loginToOrangeHRM', (username, password) => {
  cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  cy.get('input[name="username"]').should('be.visible').clear().type(username, { delay: 100 });
  cy.get('input[name="password"]').should('be.visible').clear().type(password, { delay: 100 });
  cy.get('button[type="submit"].orangehrm-login-button').should('be.enabled').click();
  cy.url({ timeout: 10000 }).should('include', '/dashboard');
});

// Command for invalid login attempts
Cypress.Commands.add('loginToOrangeHRMWithInvalidCredentials', (username, password) => {
  cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  cy.get('input[name="username"]').should('be.visible').clear().type(username, { delay: 100 });
  cy.get('input[name="password"]').should('be.visible').clear().type(password, { delay: 100 });
  cy.get('button[type="submit"].orangehrm-login-button').should('be.enabled').click();
});

// Command for logout
Cypress.Commands.add('logoutFromOrangeHRM', () => {
  cy.get('.oxd-userdropdown-tab').should('be.visible').click();
  cy.get('.oxd-dropdown-menu').should('be.visible');
  cy.contains('Logout').should('be.visible').click();
  cy.url().should('include', '/auth/login');
});

// Command to check for error message
Cypress.Commands.add('checkErrorMessage', (expectedMessage) => {
  cy.get('.oxd-alert-content-text').should('be.visible').and('contain', expectedMessage);
});

// Command to clear and type with validation
Cypress.Commands.add('clearAndType', (selector, text) => {
  cy.get(selector).should('be.visible').clear().type(text, { delay: 100 });
});

// Enhanced logging commands
Cypress.Commands.add('logInfo', (message, data = {}) => {
  cy.task('log', `[INFO] ${message}`, data);
  console.log(`[${new Date().toISOString()}] [INFO] ${message}`, data);
});

Cypress.Commands.add('logError', (message, error = {}) => {
  cy.task('log', `[ERROR] ${message}`, error);
  console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, error);
});

Cypress.Commands.add('logPerformance', (action, duration) => {
  const metrics = {
    action,
    duration,
    timestamp: new Date().toISOString(),
    url: cy.url()
  };
  cy.task('logPerformance', metrics);
});

// Screenshot commands
Cypress.Commands.add('takeScreenshot', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotName = `${name}_${timestamp}`;
  cy.screenshot(screenshotName);
  cy.task('logScreenshot', `cypress/screenshots/${screenshotName}.png`);
});

Cypress.Commands.add('takeScreenshotOnFailure', () => {
  cy.on('fail', (error, runnable) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testName = runnable.title.replace(/\s+/g, '_');
    const screenshotName = `failure_${testName}_${timestamp}`;
    cy.screenshot(screenshotName);
    cy.task('logError', `Test failed: ${runnable.title}`, error);
  });
});

// Video recording commands
Cypress.Commands.add('startVideoRecording', () => {
  cy.task('log', 'Starting video recording...');
});

Cypress.Commands.add('stopVideoRecording', () => {
  cy.task('log', 'Stopping video recording...');
});

// Performance monitoring commands
Cypress.Commands.add('measurePageLoad', () => {
  const startTime = performance.now();
  cy.window().then((win) => {
    win.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      cy.logPerformance('pageLoad', loadTime);
    });
  });
});

Cypress.Commands.add('measureAction', (actionName, actionFn) => {
  const startTime = performance.now();
  return actionFn().then(() => {
    const duration = performance.now() - startTime;
    cy.logPerformance(actionName, duration);
  });
});

// Enhanced login with logging
Cypress.Commands.add('loginToOrangeHRMWithLogging', (username, password) => {
  cy.logInfo('Starting login process', { username });
  const startTime = performance.now();
  
  cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  cy.logInfo('Login page loaded');
  
  cy.get('input[name="username"]').should('be.visible').clear().type(username, { delay: 100 });
  cy.logInfo('Username entered');
  
  cy.get('input[name="password"]').should('be.visible').clear().type(password, { delay: 100 });
  cy.logInfo('Password entered');
  
  cy.get('button[type="submit"].orangehrm-login-button').should('be.enabled').click();
  cy.logInfo('Login button clicked');
  
  cy.url({ timeout: 10000 }).should('include', '/dashboard').then(() => {
    const loginTime = performance.now() - startTime;
    cy.logPerformance('loginProcess', loginTime);
    cy.logInfo('Login successful', { loginTime: `${loginTime.toFixed(2)}ms` });
  });
});

// Error handling with screenshots
Cypress.Commands.add('handleError', (error, context) => {
  cy.logError(`Error in ${context}`, error);
  cy.takeScreenshot(`error_${context}_${Date.now()}`);
});

// Wait with logging
Cypress.Commands.add('waitWithLog', (timeout, reason) => {
  cy.logInfo(`Waiting ${timeout}ms: ${reason}`);
  cy.wait(timeout);
});

// Enhanced assertion commands
Cypress.Commands.add('assertElementVisible', (selector, message = 'Element should be visible') => {
  cy.get(selector).should('be.visible');
  cy.logInfo(`Assertion passed: ${message}`, { selector });
});

Cypress.Commands.add('assertElementNotVisible', (selector, message = 'Element should not be visible') => {
  cy.get(selector).should('not.be.visible');
  cy.logInfo(`Assertion passed: ${message}`, { selector });
});

Cypress.Commands.add('assertElementExists', (selector, message = 'Element should exist') => {
  cy.get(selector).should('exist');
  cy.logInfo(`Assertion passed: ${message}`, { selector });
});

Cypress.Commands.add('assertElementNotExist', (selector, message = 'Element should not exist') => {
  cy.get(selector).should('not.exist');
  cy.logInfo(`Assertion passed: ${message}`, { selector });
});

Cypress.Commands.add('assertElementEnabled', (selector, message = 'Element should be enabled') => {
  cy.get(selector).should('be.enabled');
  cy.logInfo(`Assertion passed: ${message}`, { selector });
});

Cypress.Commands.add('assertElementDisabled', (selector, message = 'Element should be disabled') => {
  cy.get(selector).should('be.disabled');
  cy.logInfo(`Assertion passed: ${message}`, { selector });
});

Cypress.Commands.add('assertElementContains', (selector, text, message = 'Element should contain text') => {
  cy.get(selector).should('contain', text);
  cy.logInfo(`Assertion passed: ${message}`, { selector, text });
});

Cypress.Commands.add('assertElementNotContains', (selector, text, message = 'Element should not contain text') => {
  cy.get(selector).should('not.contain', text);
  cy.logInfo(`Assertion passed: ${message}`, { selector, text });
});

Cypress.Commands.add('assertElementHasValue', (selector, value, message = 'Element should have value') => {
  cy.get(selector).should('have.value', value);
  cy.logInfo(`Assertion passed: ${message}`, { selector, value });
});

Cypress.Commands.add('assertElementHasAttribute', (selector, attribute, value, message = 'Element should have attribute') => {
  cy.get(selector).should('have.attr', attribute, value);
  cy.logInfo(`Assertion passed: ${message}`, { selector, attribute, value });
});

Cypress.Commands.add('assertElementHasClass', (selector, className, message = 'Element should have class') => {
  cy.get(selector).should('have.class', className);
  cy.logInfo(`Assertion passed: ${message}`, { selector, className });
});

Cypress.Commands.add('assertElementNotHaveClass', (selector, className, message = 'Element should not have class') => {
  cy.get(selector).should('not.have.class', className);
  cy.logInfo(`Assertion passed: ${message}`, { selector, className });
});

Cypress.Commands.add('assertElementCount', (selector, count, message = 'Element count should match') => {
  cy.get(selector).should('have.length', count);
  cy.logInfo(`Assertion passed: ${message}`, { selector, count });
});

Cypress.Commands.add('assertElementCountAtLeast', (selector, count, message = 'Element count should be at least') => {
  cy.get(selector).should('have.length.at.least', count);
  cy.logInfo(`Assertion passed: ${message}`, { selector, count });
});

Cypress.Commands.add('assertElementCountAtMost', (selector, count, message = 'Element count should be at most') => {
  cy.get(selector).should('have.length.at.most', count);
  cy.logInfo(`Assertion passed: ${message}`, { selector, count });
});

// URL assertions
Cypress.Commands.add('assertUrlContains', (path, message = 'URL should contain path') => {
  cy.url().should('include', path);
  cy.logInfo(`Assertion passed: ${message}`, { path });
});

Cypress.Commands.add('assertUrlEquals', (url, message = 'URL should equal') => {
  cy.url().should('eq', url);
  cy.logInfo(`Assertion passed: ${message}`, { url });
});

Cypress.Commands.add('assertUrlMatches', (regex, message = 'URL should match pattern') => {
  cy.url().should('match', regex);
  cy.logInfo(`Assertion passed: ${message}`, { regex });
});

// Form assertions
Cypress.Commands.add('assertFormFieldRequired', (selector, message = 'Form field should be required') => {
  cy.get(selector).should('have.attr', 'required');
  cy.logInfo(`Assertion passed: ${message}`, { selector });
});

Cypress.Commands.add('assertFormFieldOptional', (selector, message = 'Form field should be optional') => {
  cy.get(selector).should('not.have.attr', 'required');
  cy.logInfo(`Assertion passed: ${message}`, { selector });
});

Cypress.Commands.add('assertFormFieldPlaceholder', (selector, placeholder, message = 'Form field should have placeholder') => {
  cy.get(selector).should('have.attr', 'placeholder', placeholder);
  cy.logInfo(`Assertion passed: ${message}`, { selector, placeholder });
});

Cypress.Commands.add('assertFormFieldType', (selector, type, message = 'Form field should have type') => {
  cy.get(selector).should('have.attr', 'type', type);
  cy.logInfo(`Assertion passed: ${message}`, { selector, type });
});

// Table assertions
Cypress.Commands.add('assertTableRowCount', (tableSelector, rowCount, message = 'Table should have row count') => {
  cy.get(tableSelector).find('tr').should('have.length', rowCount);
  cy.logInfo(`Assertion passed: ${message}`, { tableSelector, rowCount });
});

Cypress.Commands.add('assertTableContainsRow', (tableSelector, rowData, message = 'Table should contain row') => {
  cy.get(tableSelector).should('contain', rowData);
  cy.logInfo(`Assertion passed: ${message}`, { tableSelector, rowData });
});

// Modal/Dialog assertions
Cypress.Commands.add('assertModalVisible', (modalSelector, message = 'Modal should be visible') => {
  cy.get(modalSelector).should('be.visible');
  cy.logInfo(`Assertion passed: ${message}`, { modalSelector });
});

Cypress.Commands.add('assertModalNotVisible', (modalSelector, message = 'Modal should not be visible') => {
  cy.get(modalSelector).should('not.be.visible');
  cy.logInfo(`Assertion passed: ${message}`, { modalSelector });
});

// Toast/Notification assertions
Cypress.Commands.add('assertToastMessage', (message, messageText = 'Toast message should appear') => {
  cy.get('.toast, .notification, .alert').should('contain', message);
  cy.logInfo(`Assertion passed: ${messageText}`, { message });
});

Cypress.Commands.add('assertSuccessMessage', (message, messageText = 'Success message should appear') => {
  cy.get('.success, .alert-success, .toast-success').should('contain', message);
  cy.logInfo(`Assertion passed: ${messageText}`, { message });
});

Cypress.Commands.add('assertErrorMessage', (message, messageText = 'Error message should appear') => {
  cy.get('.error, .alert-error, .toast-error').should('contain', message);
  cy.logInfo(`Assertion passed: ${messageText}`, { message });
});

// Performance assertions
Cypress.Commands.add('assertPageLoadTime', (maxTime, message = 'Page should load within time limit') => {
  cy.window().then((win) => {
    const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
    expect(loadTime).to.be.lessThan(maxTime);
    cy.logInfo(`Assertion passed: ${message}`, { loadTime, maxTime });
  });
});

Cypress.Commands.add('assertActionTime', (actionFn, maxTime, message = 'Action should complete within time limit') => {
  const startTime = performance.now();
  return actionFn().then(() => {
    const duration = performance.now() - startTime;
    expect(duration).to.be.lessThan(maxTime);
    cy.logInfo(`Assertion passed: ${message}`, { duration, maxTime });
  });
});

// API response assertions
Cypress.Commands.add('assertApiResponse', (alias, expectedStatus = 200, message = 'API response should be successful') => {
  cy.wait(alias).its('response.statusCode').should('eq', expectedStatus);
  cy.logInfo(`Assertion passed: ${message}`, { alias, expectedStatus });
});

Cypress.Commands.add('assertApiResponseBody', (alias, expectedBody, message = 'API response body should match') => {
  cy.wait(alias).its('response.body').should('deep.equal', expectedBody);
  cy.logInfo(`Assertion passed: ${message}`, { alias, expectedBody });
});

// File download assertions
Cypress.Commands.add('assertFileDownload', (filename, message = 'File should be downloaded') => {
  cy.readFile(`cypress/downloads/${filename}`).should('exist');
  cy.logInfo(`Assertion passed: ${message}`, { filename });
});

Cypress.Commands.add('assertFileContent', (filename, expectedContent, message = 'File content should match') => {
  cy.readFile(`cypress/downloads/${filename}`).should('contain', expectedContent);
  cy.logInfo(`Assertion passed: ${message}`, { filename, expectedContent });
});

// Custom assertion with retry
Cypress.Commands.add('assertWithRetry', (assertionFn, maxAttempts = 3, delay = 1000, message = 'Assertion should pass with retry') => {
  let attempts = 0;
  
  const attempt = () => {
    attempts++;
    cy.logInfo(`Assertion attempt ${attempts}/${maxAttempts}`, { message });
    
    return assertionFn().catch((error) => {
      if (attempts < maxAttempts) {
        cy.logInfo(`Assertion attempt ${attempts} failed, retrying in ${delay}ms`);
        cy.wait(delay);
        return attempt();
      } else {
        cy.logError(`All ${maxAttempts} assertion attempts failed`, error);
        throw error;
      }
    });
  };
  
  return attempt();
});

// Soft assertions (don't fail the test)
Cypress.Commands.add('softAssert', (assertionFn, message = 'Soft assertion') => {
  try {
    assertionFn();
    cy.logInfo(`Soft assertion passed: ${message}`);
  } catch (error) {
    cy.logError(`Soft assertion failed: ${message}`, error);
    // Don't throw - this is a soft assertion
  }
});

// Conditional assertions
Cypress.Commands.add('assertIfElementExists', (selector, assertionFn, message = 'Conditional assertion') => {
  cy.get('body').then(($body) => {
    if ($body.find(selector).length > 0) {
      assertionFn();
      cy.logInfo(`Conditional assertion passed: ${message}`, { selector });
    } else {
      cy.logInfo(`Element not found, skipping assertion: ${message}`, { selector });
    }
  });
});