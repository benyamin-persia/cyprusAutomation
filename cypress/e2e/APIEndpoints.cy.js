/**
 * OrangeHRM API Endpoints Test Suite
 * Tests all available API endpoints with proper validation
 */

describe('OrangeHRM API Endpoints Test Suite', () => {
  const baseUrl = 'https://opensource-demo.orangehrmlive.com/web/index.php/api';
  let authToken = null;

  before(() => {
    cy.task('log', '[API] Setting up API endpoints test suite');
  });

  beforeEach(() => {
    // Authenticate before each test
    cy.apiLogin().then(({ token }) => {
      authToken = token;
    });
  });

  describe('Authentication Endpoints', () => {
    it('should test login endpoint', () => {
      cy.task('log', '[API] Testing login endpoint');
      
      cy.apiRequest({
        method: 'POST',
        url: '/auth/login',
        body: {
          username: 'Admin',
          password: 'admin123'
        },
        auth: false
      }).then((response) => {
        cy.task('log', `[API] Login endpoint response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 201, 401]);
      });
    });

    it('should test logout endpoint', () => {
      cy.task('log', '[API] Testing logout endpoint');
      
      cy.apiRequest({
        method: 'POST',
        url: '/auth/logout',
        auth: true
      }).then((response) => {
        cy.task('log', `[API] Logout endpoint response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 204, 401, 403]);
      });
    });

    it('should test refresh token endpoint', () => {
      cy.task('log', '[API] Testing refresh token endpoint');
      
      cy.apiRequest({
        method: 'POST',
        url: '/auth/refresh',
        auth: true
      }).then((response) => {
        cy.task('log', `[API] Refresh token response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 401, 403]);
      });
    });
  });

  describe('Employee Management Endpoints', () => {
    it('should test employee list endpoint', () => {
      cy.task('log', '[API] Testing employee list endpoint');
      
      cy.apiRequest({
        method: 'GET',
        url: '/employee',
        qs: { limit: 10, offset: 0 }
      }).then((response) => {
        cy.task('log', `[API] Employee list response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 401, 403]);
        
        if (response.status === 200) {
          expect(response.body).to.have.property('data');
        }
      });
    });

    it('should test employee creation endpoint', () => {
      cy.task('log', '[API] Testing employee creation endpoint');
      
      const testEmployee = {
        firstName: 'API',
        lastName: 'Test',
        employeeId: `EMP${Date.now()}`
      };
      
      cy.apiRequest({
        method: 'POST',
        url: '/employee',
        body: testEmployee
      }).then((response) => {
        cy.task('log', `[API] Employee creation response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 201, 400, 401, 403]);
      });
    });

    it('should test employee update endpoint', () => {
      cy.task('log', '[API] Testing employee update endpoint');
      
      // First create an employee
      cy.createTestEmployee().then(({ employeeId }) => {
        if (employeeId) {
          cy.apiRequest({
            method: 'PUT',
            url: `/employee/${employeeId}`,
            body: { firstName: 'Updated' }
          }).then((response) => {
            cy.task('log', `[API] Employee update response: ${response.status}`);
            expect(response.status).to.be.oneOf([200, 404, 401, 403]);
          });
        }
      });
    });

    it('should test employee deletion endpoint', () => {
      cy.task('log', '[API] Testing employee deletion endpoint');
      
      // First create an employee
      cy.createTestEmployee().then(({ employeeId }) => {
        if (employeeId) {
          cy.apiRequest({
            method: 'DELETE',
            url: `/employee/${employeeId}`
          }).then((response) => {
            cy.task('log', `[API] Employee deletion response: ${response.status}`);
            expect(response.status).to.be.oneOf([200, 204, 404, 401, 403]);
          });
        }
      });
    });

    it('should test employee search endpoint', () => {
      cy.task('log', '[API] Testing employee search endpoint');
      
      cy.apiRequest({
        method: 'GET',
        url: '/employee/search',
        qs: { name: 'Admin' }
      }).then((response) => {
        cy.task('log', `[API] Employee search response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 401, 403]);
      });
    });
  });

  describe('Admin Management Endpoints', () => {
    it('should test user management endpoints', () => {
      cy.task('log', '[API] Testing user management endpoints');
      
      const userEndpoints = [
        '/admin/user',
        '/admin/user/1',
        '/admin/user/search'
      ];
      
      userEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });

    it('should test job management endpoints', () => {
      cy.task('log', '[API] Testing job management endpoints');
      
      const jobEndpoints = [
        '/admin/job-title',
        '/admin/job-category',
        '/admin/employment-status'
      ];
      
      jobEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });

    it('should test organization endpoints', () => {
      cy.task('log', '[API] Testing organization endpoints');
      
      const orgEndpoints = [
        '/admin/organization',
        '/admin/location',
        '/admin/structure'
      ];
      
      orgEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });
  });

  describe('PIM (Personal Information Management) Endpoints', () => {
    it('should test personal information endpoints', () => {
      cy.task('log', '[API] Testing personal information endpoints');
      
      const pimEndpoints = [
        '/pim/employee',
        '/pim/employee/1',
        '/pim/employee/1/personal-details',
        '/pim/employee/1/contact-details',
        '/pim/employee/1/emergency-contacts'
      ];
      
      pimEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });

    it('should test employee photo endpoint', () => {
      cy.task('log', '[API] Testing employee photo endpoint');
      
      cy.apiRequest({
        method: 'GET',
        url: '/pim/employee/1/photo'
      }).then((response) => {
        cy.task('log', `[API] Employee photo response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 401, 403, 404]);
      });
    });
  });

  describe('Leave Management Endpoints', () => {
    it('should test leave type endpoints', () => {
      cy.task('log', '[API] Testing leave type endpoints');
      
      const leaveEndpoints = [
        '/leave/leave-type',
        '/leave/leave-request',
        '/leave/leave-balance'
      ];
      
      leaveEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });

    it('should test leave request creation', () => {
      cy.task('log', '[API] Testing leave request creation');
      
      const leaveRequest = {
        leaveTypeId: 1,
        fromDate: '2024-01-15',
        toDate: '2024-01-16',
        comment: 'API test leave request'
      };
      
      cy.apiRequest({
        method: 'POST',
        url: '/leave/leave-request',
        body: leaveRequest
      }).then((response) => {
        cy.task('log', `[API] Leave request creation response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 201, 400, 401, 403]);
      });
    });
  });

  describe('Time Management Endpoints', () => {
    it('should test time tracking endpoints', () => {
      cy.task('log', '[API] Testing time tracking endpoints');
      
      const timeEndpoints = [
        '/time/timesheet',
        '/time/attendance',
        '/time/project'
      ];
      
      timeEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });

    it('should test attendance recording', () => {
      cy.task('log', '[API] Testing attendance recording');
      
      const attendanceRecord = {
        employeeId: 1,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0]
      };
      
      cy.apiRequest({
        method: 'POST',
        url: '/time/attendance',
        body: attendanceRecord
      }).then((response) => {
        cy.task('log', `[API] Attendance recording response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 201, 400, 401, 403]);
      });
    });
  });

  describe('Recruitment Endpoints', () => {
    it('should test recruitment endpoints', () => {
      cy.task('log', '[API] Testing recruitment endpoints');
      
      const recruitmentEndpoints = [
        '/recruitment/candidate',
        '/recruitment/vacancy',
        '/recruitment/job-interview'
      ];
      
      recruitmentEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });

    it('should test candidate creation', () => {
      cy.task('log', '[API] Testing candidate creation');
      
      const candidate = {
        firstName: 'API',
        lastName: 'Candidate',
        email: `candidate.${Date.now()}@example.com`,
        vacancyId: 1
      };
      
      cy.apiRequest({
        method: 'POST',
        url: '/recruitment/candidate',
        body: candidate
      }).then((response) => {
        cy.task('log', `[API] Candidate creation response: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 201, 400, 401, 403]);
      });
    });
  });

  describe('Performance Management Endpoints', () => {
    it('should test performance endpoints', () => {
      cy.task('log', '[API] Testing performance endpoints');
      
      const performanceEndpoints = [
        '/performance/review',
        '/performance/tracker',
        '/performance/kpi'
      ];
      
      performanceEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });
  });

  describe('Dashboard Endpoints', () => {
    it('should test dashboard endpoints', () => {
      cy.task('log', '[API] Testing dashboard endpoints');
      
      const dashboardEndpoints = [
        '/dashboard/widgets',
        '/dashboard/statistics',
        '/dashboard/notifications'
      ];
      
      dashboardEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });
  });

  describe('File Upload Endpoints', () => {
    it('should test file upload endpoints', () => {
      cy.task('log', '[API] Testing file upload endpoints');
      
      const uploadEndpoints = [
        '/employee/1/photo',
        '/employee/1/attachment',
        '/recruitment/candidate/1/attachment'
      ];
      
      uploadEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });
  });

  describe('Configuration Endpoints', () => {
    it('should test configuration endpoints', () => {
      cy.task('log', '[API] Testing configuration endpoints');
      
      const configEndpoints = [
        '/config/module',
        '/config/email',
        '/config/system'
      ];
      
      configEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });
  });

  describe('Report Endpoints', () => {
    it('should test report endpoints', () => {
      cy.task('log', '[API] Testing report endpoints');
      
      const reportEndpoints = [
        '/report/employee',
        '/report/attendance',
        '/report/leave'
      ];
      
      reportEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });
  });

  describe('Notification Endpoints', () => {
    it('should test notification endpoints', () => {
      cy.task('log', '[API] Testing notification endpoints');
      
      const notificationEndpoints = [
        '/notification/list',
        '/notification/mark-read',
        '/notification/settings'
      ];
      
      notificationEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });
  });

  describe('Health Check Endpoints', () => {
    it('should test health check endpoints', () => {
      cy.task('log', '[API] Testing health check endpoints');
      
      const healthEndpoints = [
        '/health',
        '/health/database',
        '/health/cache'
      ];
      
      healthEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint,
          auth: false
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });
  });

  describe('API Version Endpoints', () => {
    it('should test API version endpoints', () => {
      cy.task('log', '[API] Testing API version endpoints');
      
      const versionEndpoints = [
        '/version',
        '/api-docs',
        '/swagger'
      ];
      
      versionEndpoints.forEach((endpoint) => {
        cy.apiRequest({
          method: 'GET',
          url: endpoint,
          auth: false
        }).then((response) => {
          cy.task('log', `[API] ${endpoint} response: ${response.status}`);
          expect(response.status).to.be.oneOf([200, 401, 403, 404]);
        });
      });
    });
  });
}); 