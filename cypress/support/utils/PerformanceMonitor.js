/**
 * Performance Monitor
 * Advanced performance monitoring and analysis utilities
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      responseTimes: [],
      pageLoadTimes: [],
      apiCallTimes: [],
      memoryUsage: [],
      errors: []
    };
    this.thresholds = {
      pageLoadTime: 5000,    // 5 seconds
      apiResponseTime: 3000,  // 3 seconds
      loginTime: 10000,       // 10 seconds
      memoryUsage: 100 * 1024 * 1024  // 100MB
    };
  }

  // Monitor page load performance
  monitorPageLoad() {
    const startTime = performance.now();
    
    return cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        win.addEventListener('load', () => {
          const loadTime = performance.now() - startTime;
          this.metrics.pageLoadTimes.push(loadTime);
          
          cy.logPerformance('pageLoad', loadTime);
          cy.logInfo('Page load performance measured', { loadTime: `${loadTime.toFixed(2)}ms` });
          
          // Check against threshold
          if (loadTime > this.thresholds.pageLoadTime) {
            cy.logError('Page load time exceeded threshold', { 
              actual: loadTime, 
              threshold: this.thresholds.pageLoadTime 
            });
          }
          
          resolve(loadTime);
        });
      });
    });
  }

  // Monitor API call performance
  monitorApiCall(apiCall, endpoint) {
    const startTime = performance.now();
    
    return apiCall.then((response) => {
      const responseTime = performance.now() - startTime;
      this.metrics.apiCallTimes.push({
        endpoint,
        responseTime,
        status: response.status,
        timestamp: new Date().toISOString()
      });
      
      cy.logPerformance('apiCall', responseTime);
      cy.logInfo('API call performance measured', { 
        endpoint, 
        responseTime: `${responseTime.toFixed(2)}ms`,
        status: response.status 
      });
      
      // Check against threshold
      if (responseTime > this.thresholds.apiResponseTime) {
        cy.logError('API response time exceeded threshold', { 
          endpoint,
          actual: responseTime, 
          threshold: this.thresholds.apiResponseTime 
        });
      }
      
      return { response, responseTime };
    });
  }

  // Monitor memory usage
  monitorMemoryUsage() {
    return cy.window().then((win) => {
      if (win.performance && win.performance.memory) {
        const memory = win.performance.memory;
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          timestamp: new Date().toISOString()
        };
        
        this.metrics.memoryUsage.push(memoryUsage);
        
        cy.logInfo('Memory usage monitored', memoryUsage);
        
        // Check against threshold
        if (memory.usedJSHeapSize > this.thresholds.memoryUsage) {
          cy.logError('Memory usage exceeded threshold', { 
            actual: memory.usedJSHeapSize,
            threshold: this.thresholds.memoryUsage 
          });
        }
        
        return memoryUsage;
      }
      return null;
    });
  }

  // Monitor network performance
  monitorNetworkPerformance() {
    return cy.window().then((win) => {
      if (win.performance && win.performance.getEntriesByType) {
        const networkEntries = win.performance.getEntriesByType('resource');
        
        const networkMetrics = networkEntries.map(entry => ({
          name: entry.name,
          duration: entry.duration,
          transferSize: entry.transferSize,
          initiatorType: entry.initiatorType,
          timestamp: new Date().toISOString()
        }));
        
        cy.logInfo('Network performance analyzed', { 
          totalRequests: networkMetrics.length,
          averageDuration: networkMetrics.reduce((sum, entry) => sum + entry.duration, 0) / networkMetrics.length
        });
        
        return networkMetrics;
      }
      return [];
    });
  }

  // Monitor user interactions
  monitorUserInteraction(actionName, actionFn) {
    const startTime = performance.now();
    
    return actionFn().then(() => {
      const interactionTime = performance.now() - startTime;
      
      this.metrics.responseTimes.push({
        action: actionName,
        duration: interactionTime,
        timestamp: new Date().toISOString()
      });
      
      cy.logPerformance(actionName, interactionTime);
      cy.logInfo('User interaction performance measured', { 
        action: actionName,
        duration: `${interactionTime.toFixed(2)}ms` 
      });
      
      return interactionTime;
    });
  }

  // Monitor login performance specifically
  monitorLoginPerformance(username, password) {
    const startTime = performance.now();
    
    return cy.loginToOrangeHRM(username, password).then(() => {
      const loginTime = performance.now() - startTime;
      
      this.metrics.responseTimes.push({
        action: 'login',
        duration: loginTime,
        username,
        timestamp: new Date().toISOString()
      });
      
      cy.logPerformance('loginProcess', loginTime);
      cy.logInfo('Login performance measured', { 
        username,
        loginTime: `${loginTime.toFixed(2)}ms` 
      });
      
      // Check against threshold
      if (loginTime > this.thresholds.loginTime) {
        cy.logError('Login time exceeded threshold', { 
          actual: loginTime, 
          threshold: this.thresholds.loginTime 
        });
      }
      
      return loginTime;
    });
  }

  // Monitor concurrent requests
  monitorConcurrentRequests(requests, maxConcurrent = 5) {
    const startTime = performance.now();
    const results = [];
    
    // Process requests in batches
    for (let i = 0; i < requests.length; i += maxConcurrent) {
      const batch = requests.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(request => request());
      
      cy.wrap(Promise.all(batchPromises)).then((batchResults) => {
        results.push(...batchResults);
      });
    }
    
    return cy.wrap(results).then(() => {
      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / requests.length;
      
      cy.logInfo('Concurrent requests performance measured', { 
        totalRequests: requests.length,
        totalTime: `${totalTime.toFixed(2)}ms`,
        averageTime: `${averageTime.toFixed(2)}ms`,
        maxConcurrent 
      });
      
      return { results, totalTime, averageTime };
    });
  }

  // Generate performance report
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPageLoads: this.metrics.pageLoadTimes.length,
        totalApiCalls: this.metrics.apiCallTimes.length,
        totalUserInteractions: this.metrics.responseTimes.length,
        totalMemoryChecks: this.metrics.memoryUsage.length
      },
      averages: {
        pageLoadTime: this.calculateAverage(this.metrics.pageLoadTimes),
        apiResponseTime: this.calculateAverage(this.metrics.apiCallTimes.map(m => m.responseTime)),
        userInteractionTime: this.calculateAverage(this.metrics.responseTimes.map(m => m.duration))
      },
      thresholds: this.thresholds,
      violations: this.findThresholdViolations(),
      recommendations: this.generateRecommendations()
    };
    
    cy.logInfo('Performance report generated', report);
    cy.task('table', report);
    
    return report;
  }

  // Calculate average from array of numbers
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  // Find threshold violations
  findThresholdViolations() {
    const violations = [];
    
    // Check page load violations
    this.metrics.pageLoadTimes.forEach((time, index) => {
      if (time > this.thresholds.pageLoadTime) {
        violations.push({
          type: 'pageLoad',
          index,
          actual: time,
          threshold: this.thresholds.pageLoadTime
        });
      }
    });
    
    // Check API response violations
    this.metrics.apiCallTimes.forEach((metric, index) => {
      if (metric.responseTime > this.thresholds.apiResponseTime) {
        violations.push({
          type: 'apiResponse',
          endpoint: metric.endpoint,
          index,
          actual: metric.responseTime,
          threshold: this.thresholds.apiResponseTime
        });
      }
    });
    
    return violations;
  }

  // Generate performance recommendations
  generateRecommendations() {
    const recommendations = [];
    
    const avgPageLoad = this.calculateAverage(this.metrics.pageLoadTimes);
    const avgApiResponse = this.calculateAverage(this.metrics.apiCallTimes.map(m => m.responseTime));
    
    if (avgPageLoad > this.thresholds.pageLoadTime * 0.8) {
      recommendations.push('Consider optimizing page load performance');
    }
    
    if (avgApiResponse > this.thresholds.apiResponseTime * 0.8) {
      recommendations.push('Consider optimizing API response times');
    }
    
    if (this.metrics.memoryUsage.length > 0) {
      const avgMemory = this.calculateAverage(this.metrics.memoryUsage.map(m => m.used));
      if (avgMemory > this.thresholds.memoryUsage * 0.8) {
        recommendations.push('Consider optimizing memory usage');
      }
    }
    
    return recommendations;
  }

  // Set custom thresholds
  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    cy.logInfo('Performance thresholds updated', this.thresholds);
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      responseTimes: [],
      pageLoadTimes: [],
      apiCallTimes: [],
      memoryUsage: [],
      errors: []
    };
    cy.logInfo('Performance metrics reset');
  }

  // Export metrics for external analysis
  exportMetrics() {
    return {
      metrics: this.metrics,
      thresholds: this.thresholds,
      report: this.generatePerformanceReport()
    };
  }
}

// Export the class
export default PerformanceMonitor; 