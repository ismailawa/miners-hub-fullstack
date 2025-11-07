import { test, expect } from '@playwright/test';

/**
 * Example E2E Test
 * 
 * This is a template for creating E2E tests.
 * Replace with actual test scenarios for your application.
 */

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify page title (adjust based on your actual page title)
    await expect(page).toHaveTitle(/Miners Hub/i);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Wait for navigation to be visible
    // Adjust selectors based on your actual navigation structure
    const navigation = page.locator('nav').first();
    await expect(navigation).toBeVisible();
  });
});

