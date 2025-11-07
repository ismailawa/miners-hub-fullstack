import { describe, it, expect } from 'vitest';

/**
 * Example Unit Test
 * 
 * This is a template for creating unit tests.
 * Unit tests should be fast, isolated, and test business logic and pure functions.
 */

describe('Example Unit Test', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should perform basic arithmetic', () => {
    const result = 2 + 2;
    expect(result).toBe(4);
  });

  it('should handle string operations', () => {
    const greeting = 'Hello, World!';
    expect(greeting).toContain('World');
    expect(greeting.length).toBeGreaterThan(0);
  });
});

