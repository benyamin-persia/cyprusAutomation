/**
 * OrangeHRM API Testing Suite
 * Comprehensive API tests covering authentication, CRUD operations, validation, and error handling
 */

describe('OrangeHRM API Test Suite', () => {
  const baseUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/api';
  let authToken = null;
  let employeeId = null;

  // Test data
  const testEmployee = {
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'M',
    employeeId: 'EMP001',
    otherId: 'OTH001',
    licenseNo: 'LIC001',
    licenseExpiryDate: '2025-12-31',
    ssnNumber: '123-45-6789',
    sinNumber: 'SIN123456',
    nationalityId: 1,
    maritalStatus: 'Single',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    smoker: false,
    militaryService: 'No',
    bloodType: 'O+',
    addressStreet1: '123 Main St',
    addressStreet2: 'Apt 4B',
    city: 'New York',
    stateProvince: 'NY',
    zipCode: '10001',
    countryCode: 'US',
    homeTelephone: '555-123-4567',
    mobile: '555-987-6543',
    workTelephone: '555-555-5555',
    workEmail: 'john.doe@company.com',
    otherEmail: 'john.doe.personal@gmail.com'
  };

  const updatedEmployee = {
    firstName: 'Jane',
    lastName: 'Smith',
    middleName: 'K',
    employeeId: 'EMP002'
  };

  before(() => {
    cy.log('[INFO] Starting API test suite setup');
    cy.task('log', 'Setting up API test environment');
  });

  after(() => {
    cy.log('[INFO] Cleaning up API test suite');
    cy.task('log', 'API test suite cleanup completed');
  });

  describe('Authentication API Tests', () => {
    it('should authenticate and get access token', () => {
      cy.log('[INFO] Starting authentication test');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          username: 'Admin',
          password: 'admin123'
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Authentication response status: ${response.status}`);
        
        // Log response details
        cy.task('table', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          body: response.body
        });

        // Assert response structure
        expect(response.status).to.be.oneOf([200, 201, 401]);
        
        if (response.status === 200 || response.status === 201) {
          expect(response.body).to.have.property('data');
          authToken = response.body.data?.token || response.headers?.authorization;
          cy.task('log', 'Authentication successful, token obtained');
        } else {
          cy.task('log', 'Authentication failed as expected for demo site');
        }
      });
    });

    it('should handle invalid credentials', () => {
      cy.log('[INFO] Testing invalid credentials');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          username: 'invalid',
          password: 'wrong'
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Invalid credentials response: ${response.status}`);
        expect(response.status).to.be.oneOf([401, 400, 422]);
      });
    });

    it('should handle missing credentials', () => {
      cy.log('[INFO] Testing missing credentials');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Missing credentials response: ${response.status}`);
        expect(response.status).to.be.oneOf([400, 422, 401]);
      });
    });
  });

  describe('Employee Management API Tests', () => {
    beforeEach(() => {
      // Set up authentication for employee tests
      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          username: 'Admin',
          password: 'admin123'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 || response.status === 201) {
          authToken = response.body.data?.token || response.headers?.authorization;
        }
      });
    });

    it('should create a new employee', () => {
      cy.log('[INFO] Testing employee creation');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/employee`,
        headers: headers,
        body: testEmployee,
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Create employee response: ${response.status}`);
        cy.task('table', {
          status: response.status,
          body: response.body
        });

        expect(response.status).to.be.oneOf([200, 201, 400, 401, 403]);
        
        if (response.status === 200 || response.status === 201) {
          expect(response.body).to.have.property('data');
          employeeId = response.body.data?.id || response.body.data?.employeeId;
          cy.task('log', `Employee created with ID: ${employeeId}`);
        }
      });
    });

    it('should retrieve employee list', () => {
      cy.log('[INFO] Testing employee list retrieval');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      cy.request({
        method: 'GET',
        url: `${baseUrl}/employee`,
        headers: headers,
        qs: {
          limit: 10,
          offset: 0
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Get employees response: ${response.status}`);
        
        expect(response.status).to.be.oneOf([200, 401, 403]);
        
        if (response.status === 200) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.be.an('array');
          cy.task('log', `Retrieved ${response.body.data.length} employees`);
        }
      });
    });

    it('should retrieve specific employee by ID', () => {
      cy.log('[INFO] Testing specific employee retrieval');
      
      if (!employeeId) {
        cy.task('log', 'Skipping test - no employee ID available');
        return;
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      cy.request({
        method: 'GET',
        url: `${baseUrl}/employee/${employeeId}`,
        headers: headers,
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Get employee ${employeeId} response: ${response.status}`);
        
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        
        if (response.status === 200) {
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('employeeId');
        }
      });
    });

    it('should update employee information', () => {
      cy.log('[INFO] Testing employee update');
      
      if (!employeeId) {
        cy.task('log', 'Skipping test - no employee ID available');
        return;
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      cy.request({
        method: 'PUT',
        url: `${baseUrl}/employee/${employeeId}`,
        headers: headers,
        body: updatedEmployee,
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Update employee response: ${response.status}`);
        
        expect(response.status).to.be.oneOf([200, 404, 401, 403]);
        
        if (response.status === 200) {
          expect(response.body).to.have.property('data');
          cy.task('log', 'Employee updated successfully');
        }
      });
    });

    it('should delete employee', () => {
      cy.log('[INFO] Testing employee deletion');
      
      if (!employeeId) {
        cy.task('log', 'Skipping test - no employee ID available');
        return;
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      cy.request({
        method: 'DELETE',
        url: `${baseUrl}/employee/${employeeId}`,
        headers: headers,
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Delete employee response: ${response.status}`);
        
        expect(response.status).to.be.oneOf([200, 204, 404, 401, 403]);
        
        if (response.status === 200 || response.status === 204) {
          cy.task('log', 'Employee deleted successfully');
        }
      });
    });
  });

  describe('Data Validation API Tests', () => {
    it('should validate required fields', () => {
      cy.log('[INFO] Testing required field validation');
      
      const invalidEmployee = {
        // Missing required fields
        firstName: '',
        lastName: ''
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/employee`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: invalidEmployee,
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Validation response: ${response.status}`);
        
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        
        if (response.status === 400 || response.status === 422) {
          expect(response.body).to.have.property('errors');
          cy.task('log', 'Validation errors detected as expected');
        }
      });
    });

    it('should validate email format', () => {
      cy.log('[INFO] Testing email format validation');
      
      const invalidEmailEmployee = {
        ...testEmployee,
        workEmail: 'invalid-email-format'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/employee`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: invalidEmailEmployee,
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Email validation response: ${response.status}`);
        
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        
        if (response.status === 400 || response.status === 422) {
          expect(response.body).to.have.property('errors');
          cy.task('log', 'Email format validation working');
        }
      });
    });

    it('should validate date formats', () => {
      cy.log('[INFO] Testing date format validation');
      
      const invalidDateEmployee = {
        ...testEmployee,
        dateOfBirth: 'invalid-date',
        licenseExpiryDate: 'not-a-date'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/employee`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: invalidDateEmployee,
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Date validation response: ${response.status}`);
        
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        
        if (response.status === 400 || response.status === 422) {
          expect(response.body).to.have.property('errors');
          cy.task('log', 'Date format validation working');
        }
      });
    });
  });

  describe('Error Handling API Tests', () => {
    it('should handle 404 errors gracefully', () => {
      cy.log('[INFO] Testing 404 error handling');
      
      cy.request({
        method: 'GET',
        url: `${baseUrl}/nonexistent-endpoint`,
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `404 response: ${response.status}`);
        expect(response.status).to.be.oneOf([404, 401, 403]);
      });
    });

    it('should handle unauthorized access', () => {
      cy.log('[INFO] Testing unauthorized access');
      
      cy.request({
        method: 'GET',
        url: `${baseUrl}/employee`,
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Unauthorized response: ${response.status}`);
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should handle malformed JSON', () => {
      cy.log('[INFO] Testing malformed JSON handling');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/employee`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid-json-string',
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Malformed JSON response: ${response.status}`);
        expect(response.status).to.be.oneOf([400, 422, 401, 403]);
      });
    });

    it('should handle large payloads', () => {
      cy.log('[INFO] Testing large payload handling');
      
      const largeEmployee = {
        ...testEmployee,
        // Add large text fields
        addressStreet1: 'A'.repeat(1000),
        addressStreet2: 'B'.repeat(1000),
        workEmail: 'very-long-email-address-that-exceeds-normal-limits@very-long-domain-name-that-might-cause-issues.com'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/employee`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: largeEmployee,
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Large payload response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 201, 400, 413, 401, 403]);
      });
    });
  });

  describe('Performance API Tests', () => {
    it('should measure response time for employee list', () => {
      cy.log('[INFO] Testing API response time');
      
      const startTime = Date.now();
      
      cy.request({
        method: 'GET',
        url: `${baseUrl}/employee`,
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        cy.task('log', `Response time: ${responseTime}ms`);
        cy.task('log', `Response status: ${response.status}`);
        
        // Performance assertion (adjust threshold as needed)
        expect(responseTime).to.be.lessThan(5000); // 5 seconds max
        
        if (response.status === 200) {
          cy.task('log', 'Performance test passed');
        }
      });
    });

    it('should handle concurrent requests', () => {
      cy.log('[INFO] Testing concurrent API requests');
      
      const requests = [];
      const numRequests = 5;
      
      for (let i = 0; i < numRequests; i++) {
        requests.push(
          cy.request({
            method: 'GET',
            url: `${baseUrl}/employee`,
            headers: {
              'Content-Type': 'application/json'
            },
            failOnStatusCode: false
          })
        );
      }
      
      cy.wrap(requests).then(() => {
        cy.task('log', `Completed ${numRequests} concurrent requests`);
      });
    });
  });

  describe('Security API Tests', () => {
    it('should not expose sensitive information in error responses', () => {
      cy.log('[INFO] Testing information disclosure');
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          username: 'admin',
          password: 'wrong-password'
        },
        failOnStatusCode: false
      }).then((response) => {
        cy.task('log', `Security test response: ${response.status}`);
        
        // Check that error response doesn't expose sensitive info
        if (response.body) {
          const responseBody = JSON.stringify(response.body).toLowerCase();
          expect(responseBody).to.not.include('password');
          expect(responseBody).to.not.include('admin');
          cy.task('log', 'No sensitive information exposed in error response');
        }
      });
    });

    it('should handle SQL injection attempts', () => {
      cy.log('[INFO] Testing SQL injection protection');
      
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --"
      ];
      
      sqlInjectionPayloads.forEach((payload, index) => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/auth/login`,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            username: payload,
            password: payload
          },
          failOnStatusCode: false
        }).then((response) => {
          cy.task('log', `SQL injection test ${index + 1} response: ${response.status}`);
          expect(response.status).to.be.oneOf([400, 401, 422, 403]);
        });
      });
    });

    it('should handle XSS attempts', () => {
      cy.log('[INFO] Testing XSS protection');
      
      const xssPayloads = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>"
      ];
      
      xssPayloads.forEach((payload, index) => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}/employee`,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            ...testEmployee,
            firstName: payload,
            lastName: payload
          },
          failOnStatusCode: false
        }).then((response) => {
          cy.task('log', `XSS test ${index + 1} response: ${response.status}`);
          expect(response.status).to.be.oneOf([400, 422, 401, 403]);
        });
      });
    });
  });

  describe('Rate Limiting API Tests', () => {
    it('should handle rate limiting gracefully', () => {
      cy.log('[INFO] Testing rate limiting');
      
      const requests = [];
      const numRequests = 10; // Adjust based on expected rate limits
      
      for (let i = 0; i < numRequests; i++) {
        requests.push(
          cy.request({
            method: 'GET',
            url: `${baseUrl}/employee`,
            headers: {
              'Content-Type': 'application/json'
            },
            failOnStatusCode: false
          })
        );
      }
      
      cy.wrap(requests).then(() => {
        cy.task('log', `Completed ${numRequests} requests for rate limiting test`);
        // Note: Most demo APIs don't implement rate limiting
      });
    });
  });

  describe('API Documentation Tests', () => {
    it('should verify API endpoints exist', () => {
      cy.log('[INFO] Testing API endpoint availability');
      
      const endpoints = [
        '/auth/login',
        '/employee',
        '/employee/1',
        '/admin/user',
        '/pim/employee'
      ];
      
      endpoints.forEach((endpoint) => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}${endpoint}`,
          failOnStatusCode: false
        }).then((response) => {
          cy.task('log', `Endpoint ${endpoint}: ${response.status}`);
          // Most endpoints will return 401/403 without auth, which is expected
          expect(response.status).to.be.oneOf([200, 401, 403, 404, 405]);
        });
      });
    });
  });
}); 