import React from 'react';
import { mount } from '@playwright/experimental-ct-react';

/**
 * Test Utilities for Component Testing
 * 
 * Provides reusable utilities and helpers for component tests.
 */

/**
 * Create a test wrapper component with providers
 * Use this to wrap components that need context providers
 */
export function createTestWrapper(providers?: React.ComponentType<{ children: React.ReactNode }>[]) {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    if (!providers || providers.length === 0) {
      return <>{children}</>;
    }

    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      <>{children}</>
    );
  };
}

/**
 * Mock data helpers for component testing
 */
export const mockData = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  },
  listing: {
    id: '1',
    title: 'Test Listing',
    description: 'Test Description',
  },
};

/**
 * Common test utilities
 */
export const testUtils = {
  /**
   * Wait for component to be ready
   */
  waitForComponent: async (timeout = 5000) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  },
};

