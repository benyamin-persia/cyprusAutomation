const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 60000,
    chromeWebSecurity: false,
    experimentalModifyObstructiveThirdPartyCode: true,
    
    // Screenshot configuration
    screenshotsFolder: 'cypress/screenshots',
    trashAssetsBeforeRuns: true,
    
    // Video configuration
    video: true,
    videoCompression: 32,
    videosFolder: 'cypress/videos',
    
    // Downloads configuration
    downloadsFolder: 'cypress/downloads',
    
    // Environment-specific configurations
    env: {
      // Test data
      username: process.env.CYPRESS_USERNAME || 'Admin',
      password: process.env.CYPRESS_PASSWORD || 'admin123',
      
      // API configuration
      apiUrl: process.env.CYPRESS_API_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/api',
      
      // Test configuration
      retries: {
        runMode: 2,
        openMode: 0
      },
      
      // Performance thresholds
      performanceThreshold: {
        pageLoadTime: 5000,
        loginTime: 10000
      },
      
      // Logging configuration
      logLevel: 'info',
      enableLogging: true
    },

    // Test retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },

    // Simplified reporter configuration
    reporter: 'spec',
    reporterOptions: {
      // Fallback to spec reporter if multi-reporter fails
      mochawesomeReporterOptions: {
        reportDir: 'cypress/reports',
        overwrite: false,
        html: false,
        json: true,
        includeScreenshots: true,
        includeVideos: true
      },
      mochaJunitReporterReporterOptions: {
        mochaFile: 'cypress/reports/results-[hash].xml',
        includeScreenshots: true
      }
    },

    // Setup and teardown
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        log(message) {
          console.log(`[${new Date().toISOString()}] ${message}`);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
        // Custom task for performance logging
        logPerformance(metrics) {
          console.log('Performance Metrics:', metrics);
          return null;
        },
        // Custom task for screenshot logging
        logScreenshot(path) {
          console.log(`Screenshot saved: ${path}`);
          return null;
        }
      });

      // Screenshot handling
      on('after:screenshot', (details) => {
        console.log(`Screenshot taken: ${details.path}`);
        // You can add custom logic here (e.g., upload to cloud storage)
        return details;
      });

      // Video handling
      on('after:spec', (spec, results) => {
        if (results.video) {
          console.log(`Video recorded: ${results.video}`);
        }
      });

      // Environment-specific configuration
      if (process.env.CI) {
        config.video = true;
        config.screenshotOnRunFailure = true;
        config.defaultCommandTimeout = 15000;
        config.videoCompression = 32;
        config.screenshotsFolder = 'cypress/screenshots';
        config.videosFolder = 'cypress/videos';
      }

      return config;
    },

    // Test files pattern
    specPattern: 'cypress/e2e/**/*.cy.js',
    
    // Support file
    supportFile: 'cypress/support/e2e.js',

    // Downloads folder
    downloadsFolder: 'cypress/downloads',

    // Screenshots folder
    screenshotsFolder: 'cypress/screenshots',

    // Videos folder
    videosFolder: 'cypress/videos',

    // Fixtures folder
    fixturesFolder: 'cypress/fixtures'
  },

  // Component testing configuration (if needed)
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    supportFile: false // Disable component support file since we're not using component testing
  }
});
