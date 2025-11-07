import { defineConfig, devices } from '@playwright/experimental-ct-react';
import path from 'path';

/**
 * Playwright Component Testing Configuration
 * 
 * Configured for React component testing with Playwright
 */

export default defineConfig({
  // Component test directory
  testDir: './tests/component',
  
  // Maximum time one test can run for
  timeout: 30000, // 30 seconds
  
  // Test timeout
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
    // Base URL for component testing (not needed for component tests, but can be used for API mocking)
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // CT-specific options
    ctPort: 3100,
    ctViteConfig: path.resolve(__dirname, './vitest.config.ts'),
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
});

