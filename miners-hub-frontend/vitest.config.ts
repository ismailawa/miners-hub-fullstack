import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest Configuration for Unit and Integration Testing
 * 
 * Configured for:
 * - Unit testing with React component support
 * - Coverage reporting (c8/v8)
 * - Test environment (jsdom for React components)
 */
export default defineConfig({
  plugins: [react()],
  
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Glob patterns for test files
    include: [
      '**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
      '**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    
    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/tests/e2e/**', // Exclude E2E tests (handled by Playwright)
      '**/tests/component/**', // Exclude component tests (handled by Playwright Component Testing)
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/types/**',
        '**/*.spec.{js,ts,jsx,tsx}',
        '**/*.test.{js,ts,jsx,tsx}',
      ],
      // Coverage thresholds (will be enforced in CI/CD)
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    
    // Global test setup
    globals: true,
    
    // Test timeout
    testTimeout: 10000,
    
    // Setup files
    setupFiles: ['./vitest.setup.ts'],
  },
  
  // Resolve aliases (match Next.js path resolution)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '~': path.resolve(__dirname, './'),
    },
  },
});

