# Cypress Test Automation Docker Image
# Multi-stage build for optimized production image

# Stage 1: Base image with Node.js and dependencies
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Set environment variables for Cypress
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress
ENV CYPRESS_RUN_BINARY=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Development dependencies
FROM base AS development

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Stage 3: Production image
FROM base AS production

# Copy built application
COPY --from=development /app .

# Create non-root user for security
RUN addgroup -g 1001 -S cypress && \
    adduser -S cypress -u 1001

# Change ownership of the app directory
RUN chown -R cypress:cypress /app

# Switch to non-root user
USER cypress

# Expose port for Cypress
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Cypress container is healthy')"

# Default command
CMD ["npm", "run", "test"]

# Stage 4: CI/CD optimized image
FROM base AS ci

# Install only production dependencies
RUN npm ci --only=production

# Copy test files
COPY cypress/ ./cypress/
COPY cypress.config.js ./

# Set environment for CI
ENV CI=true
ENV CYPRESS_VIDEO=false
ENV CYPRESS_SCREENSHOT_ON_RUN_FAILURE=true

# Run tests in headless mode
CMD ["npm", "run", "test:ci"] 