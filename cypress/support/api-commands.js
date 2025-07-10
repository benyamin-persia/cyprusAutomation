/**
 * Custom API Commands for Cypress
 * Provides reusable commands for API testing
 */

// API Authentication Commands
Cypress.Commands.add('apiLogin', (username = 'Admin', password = 'admin123') => {
  cy.log(`[API] Authenticating with username: ${username}`);
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiBaseUrl') || 'https://opensource-demo.orangehrmlive.com/web/index.php/api'}/auth/login`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: { username, password },
    failOnStatusCode: false
  }).then((response) => {
    cy.task('log', `[API] Login response: ${response.status}`);
    
    if (response.status === 200 || response.status === 201) {
      const token = response.body.data?.token || response.headers?.authorization;
      cy.task('log', '[API] Authentication successful');
      return { token, response };
    } else {
      cy.task('log', '[API] Authentication failed');
      return { token: null, response };
    }
  });
});

// API Request Helper with Authentication
Cypress.Commands.add('apiRequest', (options) => {
  const {
    method = 'GET',
    url,
    body = null,
    headers = {},
    auth = true,
    failOnStatusCode = false,
    timeout = 10000
  } = options;

  cy.task('log', `[API] Making ${method} request to: ${url}`);

  const requestOptions = {
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    failOnStatusCode,
    timeout
  };

  if (body) {
    requestOptions.body = body;
  }

  // Add authentication if required
  if (auth) {
    return cy.apiLogin().then(({ token }) => {
      if (token) {
        requestOptions.headers['Authorization'] = `Bearer ${token}`;
      }
      return cy.request(requestOptions);
    });
  }

  return cy.request(requestOptions);
});

// API Response Validation Commands
Cypress.Commands.add('validateApiResponse', (response, expectedStatus = 200, schema = null) => {
  cy.task('log', `[API] Validating response with status: ${response.status}`);
  
  // Status code validation
  expect(response.status).to.equal(expectedStatus);
  
  // Response structure validation
  expect(response).to.have.property('body');
  expect(response).to.have.property('headers');
  
  // Schema validation if provided
  if (schema) {
    expect(response.body).to.matchSchema(schema);
  }
  
  cy.task('log', '[API] Response validation passed');
  return response;
});

// API Error Response Validation
Cypress.Commands.add('validateApiError', (response, expectedStatus = 400) => {
  cy.task('log', `[API] Validating error response with status: ${response.status}`);
  
  expect(response.status).to.equal(expectedStatus);
  expect(response.body).to.have.property('error');
  
  cy.task('log', '[API] Error response validation passed');
  return response;
});

// API Performance Testing
Cypress.Commands.add('measureApiPerformance', (requestFn, maxResponseTime = 5000) => {
  const startTime = Date.now();
  
  return requestFn().then((response) => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    cy.task('log', `[API] Response time: ${responseTime}ms`);
    cy.task('log', `[API] Response status: ${response.status}`);
    
    expect(responseTime).to.be.lessThan(maxResponseTime);
    
    return { response, responseTime };
  });
});

// API Data Creation Helper
Cypress.Commands.add('createTestEmployee', (employeeData = {}) => {
  const defaultEmployee = {
    firstName: 'Test',
    lastName: 'Employee',
    middleName: 'M',
    employeeId: `EMP${Date.now()}`,
    workEmail: `test.employee.${Date.now()}@company.com`
  };

  const testEmployee = { ...defaultEmployee, ...employeeData };
  
  cy.task('log', '[API] Creating test employee');
  
  return cy.apiRequest({
    method: 'POST',
    url: '/employee',
    body: testEmployee
  }).then((response) => {
    if (response.status === 200 || response.status === 201) {
      const employeeId = response.body.data?.id || response.body.data?.employeeId;
      cy.task('log', `[API] Test employee created with ID: ${employeeId}`);
      return { employeeId, response };
    } else {
      cy.task('log', '[API] Failed to create test employee');
      return { employeeId: null, response };
    }
  });
});

// API Data Cleanup Helper
Cypress.Commands.add('cleanupTestEmployee', (employeeId) => {
  if (!employeeId) {
    cy.task('log', '[API] No employee ID provided for cleanup');
    return;
  }
  
  cy.task('log', `[API] Cleaning up test employee: ${employeeId}`);
  
  return cy.apiRequest({
    method: 'DELETE',
    url: `/employee/${employeeId}`
  }).then((response) => {
    cy.task('log', `[API] Cleanup response: ${response.status}`);
    return response;
  });
});

// API Rate Limiting Test
Cypress.Commands.add('testRateLimiting', (endpoint, numRequests = 10) => {
  cy.task('log', `[API] Testing rate limiting for endpoint: ${endpoint}`);
  
  const requests = [];
  
  for (let i = 0; i < numRequests; i++) {
    requests.push(
      cy.apiRequest({
        method: 'GET',
        url: endpoint,
        auth: false
      })
    );
  }
  
  return cy.wrap(requests).then(() => {
    cy.task('log', `[API] Completed ${numRequests} requests for rate limiting test`);
  });
});

// API Security Testing
Cypress.Commands.add('testSecurityVulnerabilities', (endpoint, payloads) => {
  cy.task('log', `[API] Testing security vulnerabilities for endpoint: ${endpoint}`);
  
  const tests = payloads.map((payload, index) => {
    return cy.apiRequest({
      method: 'POST',
      url: endpoint,
      body: payload,
      auth: false
    }).then((response) => {
      cy.task('log', `[API] Security test ${index + 1} response: ${response.status}`);
      expect(response.status).to.be.oneOf([400, 401, 422, 403]);
      return response;
    });
  });
  
  return cy.wrap(tests);
});

// API Schema Validation
Cypress.Commands.add('validateApiSchema', (response, schema) => {
  cy.task('log', '[API] Validating response schema');
  
  // Basic schema validation
  if (schema.required) {
    schema.required.forEach(field => {
      expect(response.body).to.have.property(field);
    });
  }
  
  if (schema.properties) {
    Object.keys(schema.properties).forEach(field => {
      if (response.body[field] !== undefined) {
        const expectedType = schema.properties[field].type;
        if (expectedType === 'string') {
          expect(response.body[field]).to.be.a('string');
        } else if (expectedType === 'number') {
          expect(response.body[field]).to.be.a('number');
        } else if (expectedType === 'boolean') {
          expect(response.body[field]).to.be.a('boolean');
        } else if (expectedType === 'array') {
          expect(response.body[field]).to.be.an('array');
        }
      }
    });
  }
  
  cy.task('log', '[API] Schema validation passed');
  return response;
});

// API Pagination Testing
Cypress.Commands.add('testApiPagination', (endpoint, pageSize = 10) => {
  cy.task('log', `[API] Testing pagination for endpoint: ${endpoint}`);
  
  return cy.apiRequest({
    method: 'GET',
    url: endpoint,
    qs: { limit: pageSize, offset: 0 }
  }).then((response) => {
    if (response.status === 200) {
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.be.an('array');
      
      if (response.body.data.length > 0) {
        cy.task('log', `[API] Pagination test passed - retrieved ${response.body.data.length} items`);
      }
    }
    
    return response;
  });
});

// API Concurrent Request Testing
Cypress.Commands.add('testConcurrentRequests', (endpoint, numConcurrent = 5) => {
  cy.task('log', `[API] Testing ${numConcurrent} concurrent requests to: ${endpoint}`);
  
  const requests = [];
  
  for (let i = 0; i < numConcurrent; i++) {
    requests.push(
      cy.apiRequest({
        method: 'GET',
        url: endpoint,
        auth: false
      })
    );
  }
  
  return cy.wrap(requests).then(() => {
    cy.task('log', `[API] Completed ${numConcurrent} concurrent requests`);
  });
});

// API Response Time Monitoring
Cypress.Commands.add('monitorApiResponseTime', (requestFn, threshold = 3000) => {
  const startTime = performance.now();
  
  return requestFn().then((response) => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    cy.task('log', `[API] Response time: ${responseTime.toFixed(2)}ms`);
    
    if (responseTime > threshold) {
      cy.task('log', `[API] WARNING: Response time (${responseTime.toFixed(2)}ms) exceeded threshold (${threshold}ms)`);
    }
    
    return { response, responseTime };
  });
});

// API Data Validation Helper
Cypress.Commands.add('validateApiData', (data, validationRules) => {
  cy.task('log', '[API] Validating API data');
  
  Object.keys(validationRules).forEach(field => {
    const rule = validationRules[field];
    
    if (rule.required && data[field] === undefined) {
      throw new Error(`Required field '${field}' is missing`);
    }
    
    if (data[field] !== undefined) {
      if (rule.type === 'email') {
        expect(data[field]).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      } else if (rule.type === 'date') {
        expect(new Date(data[field])).to.not.be.null;
      } else if (rule.type === 'number') {
        expect(data[field]).to.be.a('number');
      } else if (rule.type === 'string') {
        expect(data[field]).to.be.a('string');
      }
      
      if (rule.minLength) {
        expect(data[field].length).to.be.at.least(rule.minLength);
      }
      
      if (rule.maxLength) {
        expect(data[field].length).to.be.at.most(rule.maxLength);
      }
    }
  });
  
  cy.task('log', '[API] Data validation passed');
  return data;
}); 