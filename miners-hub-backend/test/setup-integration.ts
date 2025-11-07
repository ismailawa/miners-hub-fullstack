/**
 * Integration Test Setup
 *
 * This file runs before all integration tests.
 * Use it to configure test environment, database connections, and global test utilities.
 */

// Load test environment variables from .env.test if it exists
// Note: dotenv is already available in NestJS via @nestjs/config
// For manual loading, you can use: require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Configure test database connection
// Integration tests should use a separate test database (Supabase test project)
// Set DATABASE_URL environment variable to point to test database
// You can set this in .env.test file or as an environment variable
if (!process.env.DATABASE_URL) {
  console.warn(
    '⚠️  DATABASE_URL not set. Integration tests may fail without a test database connection.',
  );
  console.warn(
    '💡 Set DATABASE_URL to your Supabase test project connection string.',
  );
  console.warn(
    '💡 Create a .env.test file in the backend root with your test database configuration.',
  );
}

// Global test timeout
jest.setTimeout(30000); // 30 seconds

// Cleanup after all tests
afterAll(async () => {
  // Add any global cleanup logic here
  // e.g., close database connections, clean up test data
});
