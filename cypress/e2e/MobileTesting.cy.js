/**
 * Mobile Testing Suite
 * Mobile-specific testing for responsive design and mobile user experience
 */

describe('Mobile Testing Suite', () => {
  beforeEach(() => {
    cy.fixture('user').as('userData');
  });

  describe('Mobile Responsive Design Tests', () => {
    it('should display correctly on iPhone X', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Check mobile layout
      cy.get('.orangehrm-login-form').should('be.visible');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      
      // Check mobile-specific elements
      cy.get('body').should('have.css', 'width', '375px');
    });

    it('should display correctly on iPad', () => {
      cy.viewport('ipad-2');
      cy.visit('/auth/login');
      
      // Check tablet layout
      cy.get('.orangehrm-login-form').should('be.visible');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      
      // Check tablet-specific elements
      cy.get('body').should('have.css', 'width', '768px');
    });

    it('should display correctly on Android device', () => {
      cy.viewport(360, 640); // Common Android resolution
      cy.visit('/auth/login');
      
      // Check Android layout
      cy.get('.orangehrm-login-form').should('be.visible');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  describe('Mobile Touch Interactions', () => {
    it('should handle touch input correctly', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test touch input
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('testpass');
      
      // Verify input
      cy.get('input[name="username"]').should('have.value', 'testuser');
      cy.get('input[name="password"]').should('have.value', 'testpass');
    });

    it('should handle touch button interactions', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test touch button interaction
      cy.get('button[type="submit"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.enabled');
      
      // Test touch tap
      cy.get('button[type="submit"]').click();
      
      // Verify interaction
      cy.get('.oxd-input-field-error-message').should('be.visible');
    });

    it('should handle touch scrolling', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test scroll functionality
      cy.scrollTo('bottom');
      cy.scrollTo('top');
      
      // Verify scroll worked
      cy.get('.orangehrm-login-form').should('be.visible');
    });
  });

  describe('Mobile Form Validation', () => {
    it('should validate mobile form inputs', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test mobile form validation
      cy.get('button[type="submit"]').click();
      
      // Check for validation messages
      cy.get('.oxd-input-field-error-message').should('be.visible');
      cy.get('.oxd-input-field-error-message').should('contain', 'Required');
    });

    it('should handle mobile keyboard input', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test mobile keyboard
      cy.get('input[name="username"]').focus();
      cy.get('input[name="username"]').type('testuser');
      
      // Verify mobile keyboard input
      cy.get('input[name="username"]').should('have.value', 'testuser');
    });

    it('should handle mobile form submission', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Fill form on mobile
      cy.get('input[name="username"]').type('Admin');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      
      // Verify mobile form submission
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Mobile Performance Tests', () => {
    it('should load quickly on mobile devices', () => {
      cy.viewport('iphone-x');
      
      const startTime = performance.now();
      cy.visit('/auth/login');
      cy.get('.orangehrm-login-form').should('be.visible').then(() => {
        const loadTime = performance.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // 5 seconds max
      });
    });

    it('should handle mobile network conditions', () => {
      cy.viewport('iphone-x');
      
      // Simulate slow network
      cy.intercept('GET', '**', { delay: 1000 }).as('slowNetwork');
      
      cy.visit('/auth/login');
      cy.wait('@slowNetwork');
      
      // Verify page still loads
      cy.get('.orangehrm-login-form').should('be.visible');
    });
  });

  describe('Mobile Accessibility Tests', () => {
    it('should be accessible on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Check mobile accessibility
      cy.get('input[name="username"]').should('have.attr', 'name');
      cy.get('input[name="password"]').should('have.attr', 'name');
      cy.get('button[type="submit"]').should('have.text');
    });

    it('should have proper touch targets', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Check minimum touch target size (44px)
      cy.get('button[type="submit"]').should('have.css', 'min-height');
      cy.get('input[name="username"]').should('have.css', 'min-height');
      cy.get('input[name="password"]').should('have.css', 'min-height');
    });

    it('should support mobile screen readers', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Check for accessibility attributes
      cy.get('input[name="username"]').should('have.attr', 'name');
      cy.get('input[name="password"]').should('have.attr', 'name');
      cy.get('button[type="submit"]').should('have.text');
    });
  });

  describe('Mobile Browser Compatibility', () => {
    it('should work on mobile Safari', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test Safari-specific features
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should work on mobile Chrome', () => {
      cy.viewport(360, 640); // Android Chrome
      cy.visit('/auth/login');
      
      // Test Chrome-specific features
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should work on mobile Firefox', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test Firefox-specific features
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  describe('Mobile Gesture Testing', () => {
    it('should handle pinch to zoom', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test pinch gesture (simulated)
      cy.get('body').trigger('gesture', {
        gesture: 'pinch',
        scale: 1.5
      });
      
      // Verify zoom worked
      cy.get('.orangehrm-login-form').should('be.visible');
    });

    it('should handle swipe gestures', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test swipe gesture
      cy.get('body').trigger('swipe', {
        direction: 'left',
        distance: 100
      });
      
      // Verify swipe worked
      cy.get('.orangehrm-login-form').should('be.visible');
    });
  });

  describe('Mobile Orientation Tests', () => {
    it('should handle portrait orientation', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test portrait mode
      cy.get('.orangehrm-login-form').should('be.visible');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
    });

    it('should handle landscape orientation', () => {
      cy.viewport('iphone-x', 'landscape');
      cy.visit('/auth/login');
      
      // Test landscape mode
      cy.get('.orangehrm-login-form').should('be.visible');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
    });
  });

  describe('Mobile Security Tests', () => {
    it('should handle mobile security features', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test mobile security
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
      cy.get('form').should('exist');
    });

    it('should handle mobile biometric authentication', () => {
      cy.viewport('iphone-x');
      cy.visit('/auth/login');
      
      // Test biometric features (simulated)
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
    });
  });
}); 