# OrangeHRM API Testing Suite

A comprehensive API testing framework built with Cypress for the OrangeHRM demo application. This suite provides extensive coverage of API endpoints, performance testing, security validation, and load testing.

## 🚀 Features

### Core API Testing
- **Authentication Testing**: Login, logout, token refresh, and session management
- **CRUD Operations**: Complete employee lifecycle testing (Create, Read, Update, Delete)
- **Data Validation**: Schema validation, field validation, and error handling
- **Security Testing**: SQL injection, XSS, and information disclosure prevention
- **Error Handling**: Graceful handling of network errors, server errors, and malformed requests

### Performance & Load Testing
- **Response Time Monitoring**: Real-time performance measurement
- **Concurrent Request Testing**: Multiple simultaneous API calls
- **Load Testing**: Sequential and burst request patterns
- **Stress Testing**: Sustained load and error rate monitoring
- **Performance Thresholds**: Configurable performance benchmarks

### Custom Commands
- **API Authentication**: `cy.apiLogin()` - Automated login with token management
- **Request Helpers**: `cy.apiRequest()` - Standardized API requests with authentication
- **Response Validation**: `cy.validateApiResponse()` - Structured response validation
- **Performance Measurement**: `cy.measureApiPerformance()` - Response time tracking
- **Data Management**: `cy.createTestEmployee()`, `cy.cleanupTestEmployee()` - Test data lifecycle

## 📁 File Structure

```
cypress/
├── e2e/
│   ├── OrangeHRMAPI.cy.js          # Main API test suite
│   ├── APIEndpoints.cy.js          # Endpoint coverage testing
│   └── APIPerformance.cy.js        # Performance and load testing
├── support/
│   ├── api-commands.js             # Custom API commands
│   ├── commands.js                 # General custom commands
│   └── e2e.js                     # Support configuration
└── fixtures/
    └── api-test-data.json         # API test data
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Cypress >= 13.6.0

### Installation
```bash
# Install dependencies
npm install

# Install API testing specific packages
npm install cypress-multi-reporters mocha-junit-reporter mochawesome mochawesome-merge marge --save-dev
```

### Configuration
The API testing suite uses the following configuration:

```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://opensource-demo.orangehrmlive.com',
    env: {
      apiBaseUrl: 'https://opensource-demo.orangehrmlive.com/web/index.php/api',
      username: 'Admin',
      password: 'admin123'
    }
  }
});
```

## 🧪 Running API Tests

### All API Tests
```bash
npm run test:api
```

### Specific API Test Suites
```bash
# Main API functionality tests
npm run test:api:main

# Endpoint coverage tests
npm run test:api:endpoints

# Performance and load tests
npm run test:api:performance
```

### Individual Test Files
```bash
# Run specific API test file
npx cypress run --spec "cypress/e2e/OrangeHRMAPI.cy.js"

# Run with browser UI
npx cypress open --spec "cypress/e2e/OrangeHRMAPI.cy.js"
```

## 📊 Test Categories

### 1. Authentication API Tests
- **Login Endpoint**: Valid credentials, invalid credentials, missing credentials
- **Logout Endpoint**: Session termination and token invalidation
- **Token Refresh**: Token renewal and session persistence

### 2. Employee Management API Tests
- **CRUD Operations**: Create, read, update, delete employee records
- **Search Functionality**: Employee search with various criteria
- **Data Validation**: Required fields, data types, and format validation

### 3. Data Validation Tests
- **Required Fields**: Missing required field handling
- **Email Format**: Email validation and format checking
- **Date Formats**: Date validation and parsing
- **Data Types**: String, number, boolean validation

### 4. Error Handling Tests
- **404 Errors**: Non-existent endpoint handling
- **Unauthorized Access**: Authentication failure scenarios
- **Malformed JSON**: Invalid request body handling
- **Large Payloads**: Request size limits and handling

### 5. Security Tests
- **SQL Injection**: Prevention of SQL injection attacks
- **XSS Prevention**: Cross-site scripting attack prevention
- **Information Disclosure**: Sensitive data exposure prevention
- **Input Validation**: Malicious input handling

### 6. Performance Tests
- **Response Time**: Individual endpoint performance measurement
- **Concurrent Requests**: Multiple simultaneous API calls
- **Load Testing**: Sequential and burst request patterns
- **Stress Testing**: Sustained load and error rate monitoring

## 🔧 Custom Commands Reference

### Authentication Commands
```javascript
// Login and get token
cy.apiLogin('username', 'password').then(({ token, response }) => {
  // Use token for subsequent requests
});

// Make authenticated request
cy.apiRequest({
  method: 'GET',
  url: '/employee',
  auth: true
});
```

### Response Validation Commands
```javascript
// Validate successful response
cy.validateApiResponse(response, 200, schema);

// Validate error response
cy.validateApiError(response, 400);
```

### Performance Commands
```javascript
// Measure API performance
cy.measureApiPerformance(() => {
  return cy.apiRequest({ method: 'GET', url: '/employee' });
}, 3000).then(({ response, responseTime }) => {
  // Handle performance results
});

// Test concurrent requests
cy.testConcurrentRequests('/employee', 5);
```

### Data Management Commands
```javascript
// Create test employee
cy.createTestEmployee({
  firstName: 'Test',
  lastName: 'Employee'
}).then(({ employeeId, response }) => {
  // Use employeeId for subsequent tests
});

// Cleanup test data
cy.cleanupTestEmployee(employeeId);
```

## 📈 Performance Monitoring

### Response Time Tracking
The suite automatically tracks response times for all API calls:
- **Individual Endpoints**: Response time per endpoint
- **Average Response Time**: Overall performance metrics
- **Performance Trends**: Response time consistency over multiple runs

### Load Testing Metrics
- **Throughput**: Requests per second
- **Concurrent Users**: Simultaneous request handling
- **Error Rates**: Failure percentage under load
- **Resource Usage**: Memory and CPU monitoring

### Performance Thresholds
Configurable performance benchmarks:
```javascript
const thresholds = {
  '/auth/login': 2000,    // 2 seconds max
  '/employee': 3000,      // 3 seconds max
  '/admin/user': 3000     // 3 seconds max
};
```

## 🛡️ Security Testing

### Vulnerability Testing
- **SQL Injection**: Tests common SQL injection patterns
- **XSS Prevention**: Cross-site scripting attack vectors
- **Input Validation**: Malicious input handling
- **Information Disclosure**: Sensitive data exposure

### Security Headers
- **Authentication**: Proper token handling
- **Authorization**: Role-based access control
- **CORS**: Cross-origin resource sharing
- **Content Security Policy**: XSS prevention

## 📋 Test Data Management

### Test Data Creation
```javascript
const testEmployee = {
  firstName: 'API',
  lastName: 'Test',
  employeeId: `EMP${Date.now()}`,
  workEmail: `test.${Date.now()}@company.com`
};
```

### Data Cleanup
Automatic cleanup of test data to maintain test isolation:
```javascript
afterEach(() => {
  // Cleanup test data
  if (employeeId) {
    cy.cleanupTestEmployee(employeeId);
  }
});
```

## 🔍 Debugging API Tests

### Logging
Comprehensive logging for debugging:
```javascript
cy.task('log', '[API] Making request to /employee');
cy.task('table', { status: response.status, body: response.body });
```

### Screenshots
Automatic screenshots on failures:
```javascript
cy.screenshot('api_request_failed');
```

### Network Monitoring
Monitor network requests and responses:
```javascript
cy.intercept('**/api/**', (req) => {
  cy.task('log', `[API] ${req.method} ${req.url}`);
});
```

## 📊 Reporting

### Test Reports
- **Mochawesome Reports**: HTML reports with detailed test results
- **JUnit Reports**: XML reports for CI/CD integration
- **Performance Reports**: Response time and throughput metrics

### Report Generation
```bash
# Generate HTML reports
npm run generate-report

# View reports
open cypress/reports/report.html
```

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
- name: Run API Tests
  run: npm run test:api

- name: Run Performance Tests
  run: npm run test:api:performance

- name: Generate Reports
  run: npm run generate-report
```

### Environment Variables
```bash
# API Configuration
CYPRESS_API_BASE_URL=https://api.example.com
CYPRESS_API_USERNAME=testuser
CYPRESS_API_PASSWORD=testpass

# Performance Thresholds
CYPRESS_PERFORMANCE_THRESHOLD=3000
CYPRESS_CONCURRENT_REQUESTS=5
```

## 🎯 Best Practices

### Test Organization
- **Group Related Tests**: Use `describe` blocks for logical grouping
- **Clear Test Names**: Descriptive test names that explain the scenario
- **Setup and Teardown**: Proper test data management

### Error Handling
- **Graceful Failures**: Handle expected errors without test failure
- **Retry Logic**: Implement retry mechanisms for flaky tests
- **Timeout Configuration**: Set appropriate timeouts for different endpoints

### Performance Testing
- **Baseline Establishment**: Establish performance baselines
- **Threshold Monitoring**: Monitor performance against thresholds
- **Trend Analysis**: Track performance trends over time

### Security Testing
- **Comprehensive Coverage**: Test all security vulnerabilities
- **Real-world Scenarios**: Use realistic attack vectors
- **Regular Updates**: Keep security tests updated with new threats

## 🤝 Contributing

### Adding New API Tests
1. Create test file in `cypress/e2e/`
2. Follow naming convention: `*API*.cy.js`
3. Use custom commands for consistency
4. Add proper logging and error handling
5. Include cleanup in `afterEach` hooks

### Custom Commands
1. Add new commands to `cypress/support/api-commands.js`
2. Follow existing naming conventions
3. Include proper error handling
4. Add comprehensive logging

### Performance Tests
1. Use `cy.measureApiPerformance()` for timing
2. Set appropriate thresholds
3. Monitor resource usage
4. Include load testing scenarios

## 📚 Additional Resources

- [Cypress API Testing Guide](https://docs.cypress.io/guides/end-to-end-testing/api-testing)
- [OrangeHRM API Documentation](https://opensource-demo.orangehrmlive.com/web/index.php/api)
- [Performance Testing Best Practices](https://docs.cypress.io/guides/end-to-end-testing/performance-testing)
- [Security Testing Guidelines](https://owasp.org/www-project-api-security/)

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review test logs and screenshots
- Consult Cypress documentation

---

**Happy API Testing! 🚀** 