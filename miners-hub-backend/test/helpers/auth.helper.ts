import { User, UserRole } from '../../src/entities/user.entity';

/**
 * Auth Helper
 *
 * Utilities for authentication in tests.
 * Note: JWT implementation will be added in Story 2.1 (Authentication).
 * This helper provides a foundation that can be extended when auth is implemented.
 */

/**
 * Create a test authentication token
 *
 * For now, returns a mock token structure.
 * When JWT is implemented, this will generate actual JWT tokens.
 *
 * @param user - User entity or user data
 * @returns Mock token string
 */
export function createTestAuthToken(
  user: Partial<User> | { id: string; role: UserRole },
): string {
  // Mock token format: "test_token_{userId}_{role}"
  // This will be replaced with actual JWT generation in Story 2.1
  const userId = 'id' in user ? user.id : 'test-user-id';
  const role = 'role' in user ? user.role : UserRole.MINER;

  return `test_token_${userId}_${role}`;
}

/**
 * Create Authorization header value
 *
 * @param user - User entity or user data
 * @returns Authorization header value (e.g., "Bearer test_token_...")
 */
export function createAuthHeader(
  user: Partial<User> | { id: string; role: UserRole },
): string {
  const token = createTestAuthToken(user);
  return `Bearer ${token}`;
}

/**
 * Create Authorization header object for use in requests
 *
 * @param user - User entity or user data
 * @returns Object with Authorization header
 */
export function createAuthHeaders(
  user: Partial<User> | { id: string; role: UserRole },
): { Authorization: string } {
  return {
    Authorization: createAuthHeader(user),
  };
}

/**
 * Create test token for a miner user
 */
export function createMinerToken(): string {
  return createTestAuthToken({ id: 'miner-id', role: UserRole.MINER });
}

/**
 * Create test token for an investor user
 */
export function createInvestorToken(): string {
  return createTestAuthToken({ id: 'investor-id', role: UserRole.INVESTOR });
}

/**
 * Create test token for an admin user
 */
export function createAdminToken(): string {
  return createTestAuthToken({ id: 'admin-id', role: UserRole.ADMIN });
}

/**
 * Create test token for a government user
 */
export function createGovernmentToken(): string {
  return createTestAuthToken({
    id: 'government-id',
    role: UserRole.GOVERNMENT,
  });
}

/**
 * Extract user info from token (for testing purposes)
 *
 * @param token - Token string
 * @returns User info extracted from token
 */
export function extractUserFromToken(
  token: string,
): { id: string; role: UserRole } | null {
  // Mock implementation - will be replaced with actual JWT decoding in Story 2.1
  const match = token.match(/test_token_(.+)_(.+)/);
  if (!match) {
    return null;
  }

  return {
    id: match[1],
    role: match[2] as UserRole,
  };
}
