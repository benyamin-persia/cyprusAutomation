# 📁 Test Artifact Management Guide

## 🎯 Overview

This guide explains the best practices for managing logs, screenshots, videos, and other test artifacts in your Cypress automation framework.

## 📊 Current Configuration

### **Automatic Cleanup (Recommended)**
```javascript
// cypress.config.js
trashAssetsBeforeRuns: true,  // ✅ Clean before each run
screenshotsFolder: 'cypress/screenshots',
videosFolder: 'cypress/videos',
downloadsFolder: 'cypress/downloads',
```

## 🗂️ Artifact Types & Management

### **1. Screenshots**
**Location**: `cypress/screenshots/`
**Retention**: **DELETE after each run** (recommended)

#### **When Screenshots Are Taken**
- ✅ **Automatic**: On test failure (`screenshotOnRunFailure: true`)
- ✅ **Manual**: Using `cy.screenshot()` command
- ✅ **Custom**: Using `cy.takeScreenshot()` custom command

#### **Management Strategy**
```bash
# Clean screenshots before each run
npm run clean:screenshots

# Keep only failure screenshots for debugging
npm run clean:success-screenshots
```

### **2. Videos**
**Location**: `cypress/videos/`
**Retention**: **DELETE after each run** (recommended)

#### **When Videos Are Recorded**
- ✅ **All Tests**: `video: true` in config
- ✅ **Failure Only**: `video: false, videoOnRunFailure: true`
- ✅ **Custom**: Using `cy.startVideoRecording()` command

#### **Management Strategy**
```bash
# Clean videos before each run
npm run clean:videos

# Keep only failure videos
npm run clean:success-videos
```

### **3. Logs**
**Location**: Console output + custom log files
**Retention**: **KEEP for debugging** (recommended)

#### **Log Types**
- ✅ **Console Logs**: Real-time test execution
- ✅ **Custom Logs**: Using `cy.logInfo()` command
- ✅ **Performance Logs**: Using `cy.logPerformance()` command
- ✅ **Error Logs**: Using `cy.logError()` command

#### **Management Strategy**
```bash
# Archive logs after each run
npm run archive:logs

# Clean old logs (keep last 7 days)
npm run clean:old-logs
```

### **4. Reports**
**Location**: `cypress/reports/`
**Retention**: **KEEP for analysis** (recommended)

#### **Report Types**
- ✅ **Mochawesome**: HTML reports with screenshots
- ✅ **JUnit**: XML reports for CI/CD
- ✅ **Performance**: Custom performance reports
- ✅ **Coverage**: Test coverage reports

#### **Management Strategy**
```bash
# Generate reports after each run
npm run generate-report

# Archive reports by date
npm run archive:reports
```

## 🔧 Implementation Strategies

### **Strategy 1: Clean Slate (Recommended for CI/CD)**
```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    trashAssetsBeforeRuns: true,  // ✅ Clean before each run
    screenshotOnRunFailure: true,  // ✅ Screenshot on failure
    video: true,                   // ✅ Record all videos
    videoCompression: 32,          // ✅ Compress videos
  }
});
```

**Benefits:**
- ✅ **Consistent Environment**: Fresh start every time
- ✅ **Storage Efficient**: No accumulation of old files
- ✅ **CI/CD Friendly**: Works perfectly in automated pipelines
- ✅ **Debugging**: Still captures failures for analysis

### **Strategy 2: Selective Retention (For Local Development)**
```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    trashAssetsBeforeRuns: false,  // ❌ Keep old artifacts
    screenshotOnRunFailure: true,   // ✅ Screenshot on failure
    video: false,                   // ❌ No video recording
    videoOnRunFailure: true,        // ✅ Video only on failure
  }
});
```

**Benefits:**
- ✅ **Historical Analysis**: Keep artifacts for comparison
- ✅ **Storage Efficient**: Only keep failure artifacts
- ✅ **Local Development**: Good for debugging

### **Strategy 3: Smart Retention (Advanced)**
```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    trashAssetsBeforeRuns: true,   // ✅ Clean before each run
    screenshotOnRunFailure: true,   // ✅ Screenshot on failure
    video: true,                    // ✅ Record all videos
    setupNodeEvents(on, config) {
      on('after:spec', (spec, results) => {
        // Keep only failure artifacts
        if (results.stats.failures === 0) {
          // Delete success artifacts
          deleteFile(results.video);
          deleteFile(results.screenshots);
        }
      });
    }
  }
});
```

## 📋 Recommended Scripts

### **Add to package.json**
```json
{
  "scripts": {
    "clean": "rm -rf cypress/screenshots cypress/videos cypress/downloads",
    "clean:reports": "rm -rf cypress/reports",
    "clean:all": "npm run clean && npm run clean:reports",
    "archive:artifacts": "mkdir -p cypress/archives/$(date +%Y%m%d) && mv cypress/screenshots cypress/videos cypress/reports cypress/archives/$(date +%Y%m%d)/",
    "clean:old-archives": "find cypress/archives -type d -mtime +7 -exec rm -rf {} +",
    "test:clean": "npm run clean && npm run test",
    "test:archive": "npm run test && npm run archive:artifacts"
  }
}
```

## 🎯 Environment-Specific Strategies

### **Local Development**
```bash
# Clean before each run
npm run test:clean

# Keep artifacts for debugging
npm run test
```

### **CI/CD Pipeline**
```bash
# Clean slate approach
npm run clean
npm run test
npm run generate-report
# Upload reports to artifact storage
```

### **Staging Environment**
```bash
# Archive artifacts for analysis
npm run test:archive
npm run clean:old-archives
```

## 📊 Storage Management

### **File Size Estimates**
| Artifact Type | Size per Test | 100 Tests | 1000 Tests |
|---------------|---------------|-----------|-------------|
| **Screenshots** | 50KB | 5MB | 50MB |
| **Videos** | 2MB | 200MB | 2GB |
| **Logs** | 1KB | 100KB | 1MB |
| **Reports** | 10KB | 1MB | 10MB |

### **Cleanup Schedule**
```bash
# Daily cleanup
0 2 * * * npm run clean:old-archives

# Weekly cleanup
0 3 * * 0 npm run clean:all

# Monthly cleanup
0 4 1 * * npm run archive:artifacts
```

## 🔍 Debugging with Artifacts

### **When Tests Fail**
1. **Check Screenshots**: `cypress/screenshots/`
2. **Watch Videos**: `cypress/videos/`
3. **Review Logs**: Console output + custom logs
4. **Analyze Reports**: `cypress/reports/`

### **Artifact Analysis**
```bash
# Find largest files
find cypress/ -type f -size +1M -exec ls -lh {} \;

# Count artifacts by type
find cypress/screenshots -name "*.png" | wc -l
find cypress/videos -name "*.mp4" | wc -l
```

## 🚀 Best Practices Summary

### **✅ DO**
- **Clean before each run**: Use `trashAssetsBeforeRuns: true`
- **Keep failure artifacts**: For debugging purposes
- **Archive important runs**: For historical analysis
- **Compress videos**: Use `videoCompression: 32`
- **Use descriptive names**: For easy identification

### **❌ DON'T**
- **Keep all artifacts**: Will fill up disk space
- **Ignore cleanup**: Can cause storage issues
- **Mix environments**: Keep local and CI artifacts separate
- **Forget compression**: Videos can be very large

## 📈 Monitoring & Alerts

### **Storage Monitoring**
```bash
# Check disk usage
du -sh cypress/

# Monitor growth
find cypress/ -type f -mtime -1 | wc -l
```

### **Automated Alerts**
```javascript
// Add to CI/CD pipeline
if (diskUsage > threshold) {
  console.log('⚠️  High disk usage detected');
  npm.run('clean:all');
}
```

---

**This artifact management strategy ensures your test automation framework remains efficient, maintainable, and storage-friendly while preserving important debugging information.** 