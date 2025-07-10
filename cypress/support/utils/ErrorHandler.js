/**
 * Error Handler
 * Advanced error handling and recovery utilities
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.errorThresholds = {
      critical: 5,
      warning: 10,
      info: 20
    };
  }

  // Handle element not found errors
  handleElementNotFound(selector, context = '') {
    return cy.get('body').then(($body) => {
      if ($body.find(selector).length === 0) {
        const error = {
          type: 'ElementNotFound',
          selector,
          context,
          timestamp: new Date().toISOString(),
          message: `Element not found: ${selector}`
        };
        
        this.logError(error);
        cy.logError('Element not found', error);
        
        // Take screenshot for debugging
        cy.takeScreenshot(`element_not_found_${Date.now()}`);
        
        throw new Error(`Element not found: ${selector} in context: ${context}`);
      }
    });
  }

  // Handle timeout errors
  handleTimeoutError(action, timeout = 10000, context = '') {
    return new Cypress.Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const error = {
          type: 'TimeoutError',
          action,
          timeout,
          context,
          timestamp: new Date().toISOString(),
          message: `Action timed out: ${action}`
        };
        
        this.logError(error);
        cy.logError('Action timed out', error);
        
        // Take screenshot for debugging
        cy.takeScreenshot(`timeout_error_${Date.now()}`);
        
        reject(new Error(`Action timed out: ${action}`));
      }, timeout);
      
      action().then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      }).catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  // Handle network errors
  handleNetworkError(request, context = '') {
    return request.catch((error) => {
      const networkError = {
        type: 'NetworkError',
        status: error.status,
        statusText: error.statusText,
        url: error.config?.url,
        context,
        timestamp: new Date().toISOString(),
        message: `Network error: ${error.status} ${error.statusText}`
      };
      
      this.logError(networkError);
      cy.logError('Network error occurred', networkError);
      
      // Take screenshot for debugging
      cy.takeScreenshot(`network_error_${Date.now()}`);
      
      throw error;
    });
  }

  // Handle assertion errors
  handleAssertionError(assertion, expected, actual, context = '') {
    const error = {
      type: 'AssertionError',
      assertion,
      expected,
      actual,
      context,
      timestamp: new Date().toISOString(),
      message: `Assertion failed: ${assertion}`
    };
    
    this.logError(error);
    cy.logError('Assertion failed', error);
    
    // Take screenshot for debugging
    cy.takeScreenshot(`assertion_error_${Date.now()}`);
    
    throw new Error(`Assertion failed: ${assertion}. Expected: ${expected}, Actual: ${actual}`);
  }

  // Retry mechanism for flaky operations
  retryOperation(operation, maxRetries = this.retryAttempts, delay = this.retryDelay) {
    return new Cypress.Promise((resolve, reject) => {
      let attempts = 0;
      
      const attempt = () => {
        attempts++;
        
        cy.logInfo(`Retry attempt ${attempts}/${maxRetries}`);
        
        operation().then((result) => {
          cy.logInfo('Operation succeeded on retry', { attempts });
          resolve(result);
        }).catch((error) => {
          if (attempts >= maxRetries) {
            const retryError = {
              type: 'RetryExhausted',
              operation: operation.name || 'unknown',
              attempts,
              maxRetries,
              originalError: error.message,
              timestamp: new Date().toISOString()
            };
            
            this.logError(retryError);
            cy.logError('Retry attempts exhausted', retryError);
            
            // Take screenshot for debugging
            cy.takeScreenshot(`retry_exhausted_${Date.now()}`);
            
            reject(new Error(`Operation failed after ${maxRetries} attempts: ${error.message}`));
          } else {
            cy.logInfo(`Retry attempt ${attempts} failed, retrying in ${delay}ms`);
            setTimeout(attempt, delay);
          }
        });
      };
      
      attempt();
    });
  }

  // Handle page load errors
  handlePageLoadError(url, context = '') {
    return cy.visit(url).catch((error) => {
      const pageLoadError = {
        type: 'PageLoadError',
        url,
        context,
        error: error.message,
        timestamp: new Date().toISOString(),
        message: `Failed to load page: ${url}`
      };
      
      this.logError(pageLoadError);
      cy.logError('Page load failed', pageLoadError);
      
      // Take screenshot for debugging
      cy.takeScreenshot(`page_load_error_${Date.now()}`);
      
      throw error;
    });
  }

  // Handle JavaScript errors
  handleJavaScriptError(context = '') {
    return cy.window().then((win) => {
      const originalOnError = win.onerror;
      
      win.onerror = (message, source, lineno, colno, error) => {
        const jsError = {
          type: 'JavaScriptError',
          message,
          source,
          lineno,
          colno,
          context,
          timestamp: new Date().toISOString()
        };
        
        this.logError(jsError);
        cy.logError('JavaScript error occurred', jsError);
        
        // Take screenshot for debugging
        cy.takeScreenshot(`javascript_error_${Date.now()}`);
        
        // Restore original error handler
        if (originalOnError) {
          originalOnError(message, source, lineno, colno, error);
        }
      };
    });
  }

  // Handle console errors
  handleConsoleError(context = '') {
    return cy.window().then((win) => {
      const originalConsoleError = win.console.error;
      
      win.console.error = (...args) => {
        const consoleError = {
          type: 'ConsoleError',
          message: args.join(' '),
          context,
          timestamp: new Date().toISOString()
        };
        
        this.logError(consoleError);
        cy.logError('Console error occurred', consoleError);
        
        // Call original console.error
        originalConsoleError.apply(win.console, args);
      };
    });
  }

  // Handle API errors
  handleApiError(response, context = '') {
    if (response.status >= 400) {
      const apiError = {
        type: 'ApiError',
        status: response.status,
        statusText: response.statusText,
        url: response.config?.url,
        data: response.data,
        context,
        timestamp: new Date().toISOString(),
        message: `API error: ${response.status} ${response.statusText}`
      };
      
      this.logError(apiError);
      cy.logError('API error occurred', apiError);
      
      // Take screenshot for debugging
      cy.takeScreenshot(`api_error_${Date.now()}`);
      
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response;
  }

  // Log error to internal log
  logError(error) {
    this.errorLog.push(error);
    
    // Check error thresholds
    const errorCount = this.errorLog.length;
    if (errorCount >= this.errorThresholds.critical) {
      cy.logError('Critical error threshold reached', { errorCount });
    } else if (errorCount >= this.errorThresholds.warning) {
      cy.logError('Warning error threshold reached', { errorCount });
    }
  }

  // Get error statistics
  getErrorStatistics() {
    const errorTypes = {};
    const errorContexts = {};
    
    this.errorLog.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
      errorContexts[error.context] = (errorContexts[error.context] || 0) + 1;
    });
    
    return {
      totalErrors: this.errorLog.length,
      errorTypes,
      errorContexts,
      recentErrors: this.errorLog.slice(-10) // Last 10 errors
    };
  }

  // Clear error log
  clearErrorLog() {
    this.errorLog = [];
    cy.logInfo('Error log cleared');
  }

  // Generate error report
  generateErrorReport() {
    const statistics = this.getErrorStatistics();
    const report = {
      timestamp: new Date().toISOString(),
      summary: statistics,
      recommendations: this.generateErrorRecommendations(statistics)
    };
    
    cy.logInfo('Error report generated', report);
    cy.task('table', report);
    
    return report;
  }

  // Generate error recommendations
  generateErrorRecommendations(statistics) {
    const recommendations = [];
    
    if (statistics.totalErrors > this.errorThresholds.critical) {
      recommendations.push('High error rate detected - consider investigating test stability');
    }
    
    if (statistics.errorTypes['ElementNotFound'] > 5) {
      recommendations.push('Multiple element not found errors - check selectors and page structure');
    }
    
    if (statistics.errorTypes['TimeoutError'] > 3) {
      recommendations.push('Multiple timeout errors - consider increasing timeouts or optimizing performance');
    }
    
    if (statistics.errorTypes['NetworkError'] > 2) {
      recommendations.push('Network errors detected - check network stability and API endpoints');
    }
    
    return recommendations;
  }

  // Set custom error thresholds
  setErrorThresholds(thresholds) {
    this.errorThresholds = { ...this.errorThresholds, ...thresholds };
    cy.logInfo('Error thresholds updated', this.errorThresholds);
  }

  // Set retry configuration
  setRetryConfiguration(attempts, delay) {
    this.retryAttempts = attempts;
    this.retryDelay = delay;
    cy.logInfo('Retry configuration updated', { attempts, delay });
  }

  // Export error data
  exportErrorData() {
    return {
      errorLog: this.errorLog,
      statistics: this.getErrorStatistics(),
      report: this.generateErrorReport()
    };
  }
}

// Export the class
export default ErrorHandler; 