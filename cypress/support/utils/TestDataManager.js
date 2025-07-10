/**
 * Test Data Manager
 * Centralized test data management with best practices
 */

class TestDataManager {
  constructor() {
    this.testData = {};
    this.environment = Cypress.env('ENV') || 'test';
    this.loadTestData();
  }

  // Load test data from fixtures
  loadTestData() {
    cy.fixture('user').as('userData');
    cy.fixture('testUsers').as('testUsers');
    cy.fixture('apiEndpoints').as('apiData');
    
    // Store references for easy access
    this.userData = null;
    this.testUsers = null;
    this.apiData = null;
    
    cy.get('@userData').then((data) => {
      this.userData = data;
    });
    
    cy.get('@testUsers').then((data) => {
      this.testUsers = data;
    });
    
    cy.get('@apiData').then((data) => {
      this.apiData = data;
    });
  }

  // Get user credentials based on role
  getUserCredentials(role = 'admin') {
    const users = {
      admin: {
        username: 'Admin',
        password: 'admin123',
        role: 'admin',
        permissions: ['read', 'write', 'delete']
      },
      user: {
        username: 'user',
        password: 'user123',
        role: 'user',
        permissions: ['read']
      },
      manager: {
        username: 'manager',
        password: 'manager123',
        role: 'manager',
        permissions: ['read', 'write']
      }
    };

    return users[role] || users.admin;
  }

  // Generate test data for API testing
  generateEmployeeData() {
    const timestamp = Date.now();
    return {
      firstName: `Test${timestamp}`,
      lastName: 'Employee',
      middleName: 'M',
      employeeId: `EMP${timestamp}`,
      otherId: `OTH${timestamp}`,
      licenseNo: `LIC${timestamp}`,
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
      addressStreet1: '123 Test St',
      addressStreet2: 'Apt 1A',
      city: 'Test City',
      stateProvince: 'TC',
      zipCode: '12345',
      countryCode: 'US',
      homeTelephone: '555-123-4567',
      mobile: '555-987-6543',
      workTelephone: '555-555-5555',
      workEmail: `test.employee${timestamp}@company.com`,
      otherEmail: `test.employee${timestamp}.personal@gmail.com`
    };
  }

  // Generate performance test data
  generatePerformanceTestData() {
    return {
      concurrentUsers: [1, 5, 10, 20],
      requestTypes: ['GET', 'POST', 'PUT', 'DELETE'],
      endpoints: [
        '/auth/login',
        '/employee',
        '/admin/user',
        '/pim/employee',
        '/leave/leave-type'
      ],
      timeouts: {
        short: 3000,
        medium: 5000,
        long: 10000
      }
    };
  }

  // Generate security test data
  generateSecurityTestData() {
    return {
      sqlInjection: [
        "' OR 1=1 --",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "admin'/*"
      ],
      xssPayloads: [
        "<script>alert('xss')</script>",
        "<img src=x onerror=alert('xss')>",
        "javascript:alert('xss')",
        "<svg onload=alert('xss')>",
        "';alert('xss');//"
      ],
      specialCharacters: [
        "!@#$%^&*()",
        "测试用户",
        "ユーザーテスト",
        "тестовый пользователь",
        "مستخدم اختبار"
      ],
      longInputs: [
        "a".repeat(1000),
        "test".repeat(250),
        "very long input that exceeds normal limits".repeat(50)
      ]
    };
  }

  // Generate accessibility test data
  generateAccessibilityTestData() {
    return {
      colorContrast: {
        good: '#000000',
        poor: '#666666',
        background: '#FFFFFF'
      },
      keyboardNavigation: {
        tabOrder: ['username', 'password', 'submit'],
        shortcuts: ['Tab', 'Shift+Tab', 'Enter', 'Escape']
      },
      screenReader: {
        labels: ['Username', 'Password', 'Login'],
        roles: ['button', 'textbox', 'form'],
        ariaLabels: ['username-input', 'password-input', 'login-button']
      }
    };
  }

  // Generate mobile test data
  generateMobileTestData() {
    return {
      viewports: [
        { name: 'iPhone X', width: 375, height: 812 },
        { name: 'iPhone 12', width: 390, height: 844 },
        { name: 'iPad', width: 768, height: 1024 },
        { name: 'Android', width: 360, height: 640 },
        { name: 'Desktop', width: 1920, height: 1080 }
      ],
      gestures: [
        'tap',
        'double-tap',
        'long-press',
        'swipe-left',
        'swipe-right',
        'pinch-zoom'
      ],
      orientations: ['portrait', 'landscape']
    };
  }

  // Get environment-specific data
  getEnvironmentData() {
    const environments = {
      test: {
        baseUrl: 'https://opensource-demo.orangehrmlive.com',
        apiUrl: 'https://opensource-demo.orangehrmlive.com/web/index.php/api',
        timeout: 10000
      },
      staging: {
        baseUrl: 'https://staging.orangehrmlive.com',
        apiUrl: 'https://staging.orangehrmlive.com/web/index.php/api',
        timeout: 15000
      },
      production: {
        baseUrl: 'https://production.orangehrmlive.com',
        apiUrl: 'https://production.orangehrmlive.com/web/index.php/api',
        timeout: 20000
      }
    };

    return environments[this.environment] || environments.test;
  }

  // Generate random test data
  generateRandomData(type, options = {}) {
    const generators = {
      email: () => `test${Date.now()}@example.com`,
      username: () => `user${Date.now()}`,
      password: () => `pass${Date.now()}`,
      name: () => `Test User ${Date.now()}`,
      phone: () => `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      id: () => `ID${Date.now()}`,
      text: (length = 10) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      }
    };

    return generators[type] ? generators[type]() : `random_${type}_${Date.now()}`;
  }

  // Validate test data
  validateTestData(data, schema) {
    const errors = [];
    
    Object.keys(schema).forEach(key => {
      if (schema[key].required && !data[key]) {
        errors.push(`Missing required field: ${key}`);
      }
      
      if (data[key] && schema[key].type && typeof data[key] !== schema[key].type) {
        errors.push(`Invalid type for ${key}: expected ${schema[key].type}, got ${typeof data[key]}`);
      }
      
      if (data[key] && schema[key].pattern && !schema[key].pattern.test(data[key])) {
        errors.push(`Invalid format for ${key}: ${data[key]}`);
      }
    });
    
    if (errors.length > 0) {
      throw new Error(`Test data validation failed: ${errors.join(', ')}`);
    }
    
    return true;
  }

  // Clean up test data
  cleanupTestData() {
    // Remove any test data created during tests
    cy.logInfo('Cleaning up test data');
    
    // This would typically involve API calls to remove test data
    // For demo purposes, we'll just log the cleanup
    cy.task('log', 'Test data cleanup completed');
  }

  // Export test data for external use
  exportTestData() {
    return {
      users: this.getUserCredentials(),
      employee: this.generateEmployeeData(),
      performance: this.generatePerformanceTestData(),
      security: this.generateSecurityTestData(),
      accessibility: this.generateAccessibilityTestData(),
      mobile: this.generateMobileTestData(),
      environment: this.getEnvironmentData()
    };
  }
}

// Export the class
export default TestDataManager; 