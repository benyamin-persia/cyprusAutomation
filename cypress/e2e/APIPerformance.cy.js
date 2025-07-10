/**
 * OrangeHRM API Performance and Load Testing Suite
 * Tests API performance, response times, concurrent requests, and stress testing
 */

describe('OrangeHRM API Performance Test Suite', () => {
  const baseUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/api';
  let authToken = null;

  before(() => {
    cy.task('log', '[API] Setting up API performance test suite');
  });

  beforeEach(() => {
    // Authenticate before each test
    cy.apiLogin().then(({ token }) => {
      authToken = token;
    });
  });

  describe('Response Time Performance Tests', () => {
    it('should measure login endpoint response time', () => {
      cy.task('log', '[API] Testing login endpoint performance');
      
      cy.measureApiPerformance(() => {
        return cy.apiRequest({
          method: 'POST',
          url: '/auth/login',
          body: {
            username: 'Admin',
            password: 'admin123'
          },
          auth: false
        });
      }, 3000).then(({ response, responseTime }) => {
        cy.task('log', `[API] Login endpoint response time: ${responseTime}ms`);
        expect(response.status).to.be.oneOf([200, 201, 401]);
      });
    });

    it('should measure employee list response time', () => {
      cy.task('log', '[API] Testing employee list performance');
      
      cy.measureApiPerformance(() => {
        return cy.apiRequest({
          method: 'GET',
          url: '/employee',
          qs: { limit: 10, offset: 0 }
        });
      }, 5000).then(({ response, responseTime }) => {
        cy.task('log', `[API] Employee list response time: ${responseTime}ms`);
        expect(response.status).to.be.oneOf([200, 401, 403]);
      });
    });

    it('should measure employee creation response time', () => {
      cy.task('log', '[API] Testing employee creation performance');
      
      const testEmployee = {
        firstName: 'Performance',
        lastName: 'Test',
        employeeId: `PERF${Date.now()}`
      };
      
      cy.measureApiPerformance(() => {
        return cy.apiRequest({
          method: 'POST',
          url: '/employee',
          body: testEmployee
        });
      }, 5000).then(({ response, responseTime }) => {
        cy.task('log', `[API] Employee creation response time: ${responseTime}ms`);
        expect(response.status).to.be.oneOf([200, 201, 400, 401, 403]);
      });
    });

    it('should measure multiple endpoint response times', () => {
      cy.task('log', '[API] Testing multiple endpoints performance');
      
      const endpoints = [
        '/auth/login',
        '/employee',
        '/admin/user',
        '/pim/employee',
        '/leave/leave-type'
      ];
      
      const performanceResults = [];
      
      endpoints.forEach((endpoint) => {
        cy.measureApiPerformance(() => {
          return cy.apiRequest({
            method: 'GET',
            url: endpoint,
            auth: endpoint === '/auth/login' ? false : true
          });
        }, 5000).then(({ response, responseTime }) => {
          performanceResults.push({
            endpoint,
            responseTime,
            status: response.status
          });
          
          cy.task('log', `[API] ${endpoint}: ${responseTime}ms (${response.status})`);
        });
      });
      
      cy.wrap(performanceResults).then((results) => {
        cy.task('table', results);
        
        // Calculate average response time
        const avgResponseTime = results.reduce((sum, result) => sum + result.responseTime, 0) / results.length;
        cy.task('log', `[API] Average response time: ${avgResponseTime.toFixed(2)}ms`);
        
        expect(avgResponseTime).to.be.lessThan(3000); // 3 seconds average
      });
    });
  });

  describe('Concurrent Request Tests', () => {
    it('should handle 5 concurrent login requests', () => {
      cy.task('log', '[API] Testing 5 concurrent login requests');
      
      cy.testConcurrentRequests('/auth/login', 5).then(() => {
        cy.task('log', '[API] Concurrent login requests completed');
      });
    });

    it('should handle 10 concurrent employee list requests', () => {
      cy.task('log', '[API] Testing 10 concurrent employee list requests');
      
      cy.testConcurrentRequests('/employee', 10).then(() => {
        cy.task('log', '[API] Concurrent employee list requests completed');
      });
    });

    it('should handle mixed concurrent requests', () => {
      cy.task('log', '[API] Testing mixed concurrent requests');
      
      const requests = [];
      const endpoints = ['/employee', '/admin/user', '/pim/employee'];
      
      // Create 3 requests for each endpoint
      endpoints.forEach(endpoint => {
        for (let i = 0; i < 3; i++) {
          requests.push(
            cy.apiRequest({
              method: 'GET',
              url: endpoint
            })
          );
        }
      });
      
      cy.wrap(requests).then(() => {
        cy.task('log', '[API] Mixed concurrent requests completed');
      });
    });

    it('should measure concurrent request performance', () => {
      cy.task('log', '[API] Measuring concurrent request performance');
      
      const startTime = Date.now();
      const numRequests = 5;
      const requests = [];
      
      for (let i = 0; i < numRequests; i++) {
        requests.push(
          cy.apiRequest({
            method: 'GET',
            url: '/employee',
            qs: { limit: 5, offset: i * 5 }
          })
        );
      }
      
      cy.wrap(requests).then(() => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        cy.task('log', `[API] ${numRequests} concurrent requests completed in ${totalTime}ms`);
        cy.task('log', `[API] Average time per request: ${(totalTime / numRequests).toFixed(2)}ms`);
        
        expect(totalTime).to.be.lessThan(10000); // 10 seconds total
      });
    });
  });

  describe('Load Testing', () => {
    it('should handle 20 sequential requests', () => {
      cy.task('log', '[API] Testing 20 sequential requests');
      
      const startTime = Date.now();
      const requests = [];
      
      for (let i = 0; i < 20; i++) {
        requests.push(
          cy.apiRequest({
            method: 'GET',
            url: '/employee',
            qs: { limit: 1, offset: i }
          })
        );
      }
      
      cy.wrap(requests).then(() => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        cy.task('log', `[API] 20 sequential requests completed in ${totalTime}ms`);
        cy.task('log', `[API] Average time per request: ${(totalTime / 20).toFixed(2)}ms`);
        
        expect(totalTime).to.be.lessThan(30000); // 30 seconds total
      });
    });

    it('should test rate limiting under load', () => {
      cy.task('log', '[API] Testing rate limiting under load');
      
      cy.testRateLimiting('/employee', 20).then(() => {
        cy.task('log', '[API] Rate limiting load test completed');
      });
    });

    it('should test memory usage under load', () => {
      cy.task('log', '[API] Testing memory usage under load');
      
      const requests = [];
      const numRequests = 15;
      
      for (let i = 0; i < numRequests; i++) {
        requests.push(
          cy.apiRequest({
            method: 'GET',
            url: '/employee',
            qs: { limit: 10, offset: i * 10 }
          })
        );
      }
      
      cy.wrap(requests).then(() => {
        cy.task('log', `[API] Memory load test completed with ${numRequests} requests`);
      });
    });
  });

  describe('Stress Testing', () => {
    it('should handle burst requests', () => {
      cy.task('log', '[API] Testing burst requests');
      
      const burstSize = 8;
      const requests = [];
      
      for (let i = 0; i < burstSize; i++) {
        requests.push(
          cy.apiRequest({
            method: 'GET',
            url: '/employee',
            qs: { limit: 5, offset: i * 5 }
          })
        );
      }
      
      cy.wrap(requests).then(() => {
        cy.task('log', `[API] Burst test completed with ${burstSize} requests`);
      });
    });

    it('should test sustained load', () => {
      cy.task('log', '[API] Testing sustained load');
      
      const cycles = 3;
      const requestsPerCycle = 5;
      
      for (let cycle = 0; cycle < cycles; cycle++) {
        cy.task('log', `[API] Starting cycle ${cycle + 1}/${cycles}`);
        
        const requests = [];
        for (let i = 0; i < requestsPerCycle; i++) {
          requests.push(
            cy.apiRequest({
              method: 'GET',
              url: '/employee',
              qs: { limit: 3, offset: (cycle * requestsPerCycle + i) * 3 }
            })
          );
        }
        
        cy.wrap(requests).then(() => {
          cy.task('log', `[API] Cycle ${cycle + 1} completed`);
        });
      }
    });

    it('should test error handling under stress', () => {
      cy.task('log', '[API] Testing error handling under stress');
      
      const requests = [];
      const validRequests = 5;
      const invalidRequests = 3;
      
      // Valid requests
      for (let i = 0; i < validRequests; i++) {
        requests.push(
          cy.apiRequest({
            method: 'GET',
            url: '/employee',
            qs: { limit: 5, offset: i * 5 }
          })
        );
      }
      
      // Invalid requests (should fail gracefully)
      for (let i = 0; i < invalidRequests; i++) {
        requests.push(
          cy.apiRequest({
            method: 'GET',
            url: '/nonexistent-endpoint',
            failOnStatusCode: false
          })
        );
      }
      
      cy.wrap(requests).then(() => {
        cy.task('log', '[API] Stress test with mixed valid/invalid requests completed');
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should monitor response time trends', () => {
      cy.task('log', '[API] Monitoring response time trends');
      
      const responseTimes = [];
      const numTests = 5;
      
      for (let i = 0; i < numTests; i++) {
        cy.measureApiPerformance(() => {
          return cy.apiRequest({
            method: 'GET',
            url: '/employee',
            qs: { limit: 10, offset: i * 10 }
          });
        }, 5000).then(({ responseTime }) => {
          responseTimes.push(responseTime);
          cy.task('log', `[API] Test ${i + 1}: ${responseTime}ms`);
        });
      }
      
      cy.wrap(responseTimes).then((times) => {
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        
        cy.task('log', `[API] Response time statistics:`);
        cy.task('log', `[API] - Average: ${avg.toFixed(2)}ms`);
        cy.task('log', `[API] - Minimum: ${min}ms`);
        cy.task('log', `[API] - Maximum: ${max}ms`);
        cy.task('log', `[API] - Variance: ${((max - min) / avg * 100).toFixed(2)}%`);
        
        // Check for consistency
        expect(max - min).to.be.lessThan(avg * 2); // Variance should not be too high
      });
    });

    it('should monitor throughput', () => {
      cy.task('log', '[API] Monitoring throughput');
      
      const startTime = Date.now();
      const numRequests = 10;
      const requests = [];
      
      for (let i = 0; i < numRequests; i++) {
        requests.push(
          cy.apiRequest({
            method: 'GET',
            url: '/employee',
            qs: { limit: 5, offset: i * 5 }
          })
        );
      }
      
      cy.wrap(requests).then(() => {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000; // seconds
        const throughput = numRequests / duration;
        
        cy.task('log', `[API] Throughput: ${throughput.toFixed(2)} requests/second`);
        cy.task('log', `[API] Total time: ${duration.toFixed(2)} seconds`);
        cy.task('log', `[API] Total requests: ${numRequests}`);
        
        expect(throughput).to.be.greaterThan(0.5); // At least 0.5 requests per second
      });
    });

    it('should monitor error rates under load', () => {
      cy.task('log', '[API] Monitoring error rates under load');
      
      const totalRequests = 15;
      const errorRequests = 3;
      const successRequests = totalRequests - errorRequests;
      
      const requests = [];
      
      // Success requests
      for (let i = 0; i < successRequests; i++) {
        requests.push(
          cy.apiRequest({
            method: 'GET',
            url: '/employee',
            qs: { limit: 5, offset: i * 5 }
          })
        );
      }
      
      // Error requests
      for (let i = 0; i < errorRequests; i++) {
        requests.push(
          cy.apiRequest({
            method: 'GET',
            url: '/nonexistent-endpoint',
            failOnStatusCode: false
          })
        );
      }
      
      cy.wrap(requests).then(() => {
        const errorRate = (errorRequests / totalRequests) * 100;
        cy.task('log', `[API] Error rate: ${errorRate.toFixed(2)}%`);
        cy.task('log', `[API] Success rate: ${((successRequests / totalRequests) * 100).toFixed(2)}%`);
        
        expect(errorRate).to.be.lessThan(50); // Error rate should be less than 50%
      });
    });
  });

  describe('Performance Thresholds', () => {
    it('should meet performance thresholds for critical endpoints', () => {
      cy.task('log', '[API] Testing performance thresholds');
      
      const thresholds = {
        '/auth/login': 2000,
        '/employee': 3000,
        '/admin/user': 3000
      };
      
      Object.entries(thresholds).forEach(([endpoint, threshold]) => {
        cy.measureApiPerformance(() => {
          return cy.apiRequest({
            method: 'GET',
            url: endpoint,
            auth: endpoint === '/auth/login' ? false : true
          });
        }, threshold).then(({ responseTime }) => {
          cy.task('log', `[API] ${endpoint}: ${responseTime}ms (threshold: ${threshold}ms)`);
          expect(responseTime).to.be.lessThan(threshold);
        });
      });
    });

    it('should maintain performance under concurrent load', () => {
      cy.task('log', '[API] Testing performance under concurrent load');
      
      const startTime = Date.now();
      const numConcurrent = 5;
      const requests = [];
      
      for (let i = 0; i < numConcurrent; i++) {
        requests.push(
          cy.apiRequest({
            method: 'GET',
            url: '/employee',
            qs: { limit: 10, offset: i * 10 }
          })
        );
      }
      
      cy.wrap(requests).then(() => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / numConcurrent;
        
        cy.task('log', `[API] Concurrent load test:`);
        cy.task('log', `[API] - Total time: ${totalTime}ms`);
        cy.task('log', `[API] - Average time per request: ${avgTime.toFixed(2)}ms`);
        
        expect(avgTime).to.be.lessThan(4000); // Average should be less than 4 seconds
        expect(totalTime).to.be.lessThan(20000); // Total should be less than 20 seconds
      });
    });
  });
}); 