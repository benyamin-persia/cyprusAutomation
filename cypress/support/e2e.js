// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Import API commands
import './api-commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error
  console.error('Uncaught exception:', err);
  
  // Take screenshot on uncaught exception
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  cy.screenshot(`uncaught_exception_${timestamp}`);
  
  // Return false to prevent the error from failing the test
  return false;
});

// Global test failure handling
Cypress.on('test:after:run', (attributes) => {
  // Log test results
  console.log(`Test ${attributes.title} ${attributes.state}`);
  
  if (attributes.state === 'failed') {
    console.error('Test failed:', attributes.error);
    
    // Take screenshot on test failure
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testName = attributes.title.replace(/\s+/g, '_');
    cy.screenshot(`test_failure_${testName}_${timestamp}`);
  }
});

// Global before each hook
beforeEach(() => {
  // Log test start
  cy.task('log', `Starting test: ${Cypress.currentTest.title}`);
  
  // Set up performance monitoring safely
  cy.window().then((win) => {
    try {
      if (win.performance && win.performance.mark) {
        win.performance.mark('test-start');
      }
    } catch (error) {
      console.warn('Could not set performance mark:', error);
    }
  });
});

// Global after each hook - FIXED VERSION
afterEach(() => {
  // Log test completion
  cy.task('log', `Completed test: ${Cypress.currentTest.title}`);
  
  // Measure test duration safely
  cy.window().then((win) => {
    try {
      if (win.performance && win.performance.mark && win.performance.measure) {
        win.performance.mark('test-end');
        win.performance.measure('test-duration', 'test-start', 'test-end');
        
        const measure = win.performance.getEntriesByName('test-duration')[0];
        if (measure) {
          cy.task('log', `Test duration: ${measure.duration.toFixed(2)}ms`);
        }
      }
    } catch (error) {
      console.warn('Could not measure test duration:', error);
    }
  });
});

// Global before all hook
before(() => {
  cy.task('log', 'Starting test suite');
  
  // Clear previous test artifacts
  cy.task('log', 'Clearing previous test artifacts');
});

// Global after all hook
after(() => {
  cy.task('log', 'Completed test suite');
  
  // Generate summary report
  cy.task('log', 'Generating test summary');
});

// Custom error handling
Cypress.Commands.add('handleError', (error, context) => {
  cy.task('log', `Error in ${context}: ${error.message}`);
  cy.screenshot(`error_${context}_${Date.now()}`);
});

// Performance monitoring - SAFE VERSION
Cypress.Commands.add('measurePerformance', (actionName, actionFn) => {
  const startTime = performance.now();
  
  return actionFn().then(() => {
    try {
      const duration = performance.now() - startTime;
      cy.task('log', `Performance - ${actionName}: ${duration.toFixed(2)}ms`);
      return duration;
    } catch (error) {
      console.warn('Could not measure performance:', error);
      return 0;
    }
  });
});

// Network monitoring
Cypress.Commands.add('monitorNetwork', () => {
  cy.intercept('**/*', (req) => {
    const startTime = Date.now();
    
    req.on('response', (res) => {
      try {
        const duration = Date.now() - startTime;
        cy.task('log', `Network - ${req.method} ${req.url}: ${duration}ms (${res.statusCode})`);
      } catch (error) {
        console.warn('Could not log network request:', error);
      }
    });
  });
});

// Console log monitoring - SAFE VERSION
Cypress.Commands.add('monitorConsole', () => {
  cy.window().then((win) => {
    try {
      const originalLog = win.console.log;
      const originalError = win.console.error;
      const originalWarn = win.console.warn;
      
      win.console.log = (...args) => {
        try {
          cy.task('log', `Console Log: ${args.join(' ')}`);
          originalLog.apply(win.console, args);
        } catch (error) {
          originalLog.apply(win.console, args);
        }
      };
      
      win.console.error = (...args) => {
        try {
          cy.task('log', `Console Error: ${args.join(' ')}`);
          originalError.apply(win.console, args);
        } catch (error) {
          originalError.apply(win.console, args);
        }
      };
      
      win.console.warn = (...args) => {
        try {
          cy.task('log', `Console Warn: ${args.join(' ')}`);
          originalWarn.apply(win.console, args);
        } catch (error) {
          originalWarn.apply(win.console, args);
        }
      };
    } catch (error) {
      console.warn('Could not set up console monitoring:', error);
    }
  });
});

// Memory monitoring - SAFE VERSION
Cypress.Commands.add('monitorMemory', () => {
  cy.window().then((win) => {
    try {
      if (win.performance && win.performance.memory) {
        const memory = win.performance.memory;
        cy.task('log', `Memory - Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB, Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    } catch (error) {
      console.warn('Could not monitor memory:', error);
    }
  });
});

// Custom assertions with logging - SAFE VERSION
Cypress.Commands.add('assertWithLog', (subject, assertion, expected, message) => {
  try {
    cy.task('log', `Asserting: ${message} - Expected: ${expected}, Actual: ${subject}`);
    expect(subject).to[assertion](expected);
  } catch (error) {
    cy.task('log', `Assertion failed: ${message} - Expected: ${expected}, Actual: ${subject}`);
    throw error;
  }
});

// Wait with logging
Cypress.Commands.add('waitWithLog', (timeout, reason) => {
  cy.task('log', `Waiting ${timeout}ms: ${reason}`);
  cy.wait(timeout);
});

// Retry with logging - SAFE VERSION
Cypress.Commands.add('retryWithLog', (fn, maxAttempts = 3, delay = 1000) => {
  let attempts = 0;
  
  const attempt = () => {
    attempts++;
    cy.task('log', `Retry attempt ${attempts}/${maxAttempts}`);
    
    return fn().catch((error) => {
      if (attempts < maxAttempts) {
        cy.task('log', `Attempt ${attempts} failed, retrying in ${delay}ms`);
        cy.wait(delay);
        return attempt();
      } else {
        cy.task('log', `All ${maxAttempts} attempts failed`);
        throw error;
      }
    });
  };
  
  return attempt();
});