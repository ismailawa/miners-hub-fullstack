import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for E2E Testing
 * 
 * Supports environment switching (dev, staging, production)
 * Timeout standards: 30s default, 60s for E2E
 * Artifact outputs: screenshots, videos, traces
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Maximum time one test can run for
  timeout: 30000, // 30 seconds default
  
  // Maximum time for E2E tests
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: getBaseUrl(),
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: getBaseUrl(),
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start server
  },
});

/**
 * Get base URL based on environment
 * Supports: dev, staging, production
 * Default: http://localhost:3000 (local development)
 */
function getBaseUrl(): string {
  const env = process.env.PLAYWRIGHT_ENV || process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return process.env.PLAYWRIGHT_BASE_URL || 'https://minershub.com';
    case 'staging':
      return process.env.PLAYWRIGHT_BASE_URL || 'https://staging.minershub.com';
    case 'test':
      return process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
    case 'development':
    default:
      return process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  }
}

