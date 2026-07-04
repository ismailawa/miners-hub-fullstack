import { faker } from '@faker-js/faker';
import {
  User,
  UserRole,
  VerificationStatus,
} from '../../src/entities/user.entity';

/**
 * User Factory
 *
 * Generates test data for User entities using Faker.js
 */

export interface UserFactoryOptions {
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  verificationStatus?: VerificationStatus;
}

/**
 * Create a User entity with fake data
 *
 * @param options - Optional overrides for specific fields
 * @returns Partial User entity (without relationships)
 */
export function createUserFactory(
  options: UserFactoryOptions = {},
): Partial<User> {
  return {
    email: options.email || faker.internet.email().toLowerCase(),
    passwordHash:
      options.passwordHash ||
      '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', // Default test hash
    role: options.role || faker.helpers.arrayElement(Object.values(UserRole)),
    verificationStatus:
      options.verificationStatus ||
      faker.helpers.arrayElement(Object.values(VerificationStatus)),
  };
}

/**
 * Create multiple User entities
 *
 * @param count - Number of users to create
 * @param options - Optional overrides for all users
 * @returns Array of partial User entities
 */
export function createUsersFactory(
  count: number,
  options: UserFactoryOptions = {},
): Partial<User>[] {
  return Array.from({ length: count }, () => createUserFactory(options));
}

/**
 * Create a verified miner user
 */
export function createVerifiedMinerFactory(): Partial<User> {
  return createUserFactory({
    role: UserRole.MINER,
    verificationStatus: VerificationStatus.VERIFIED,
  });
}

/**
 * Create a verified investor user
 */
export function createVerifiedInvestorFactory(): Partial<User> {
  return createUserFactory({
    role: UserRole.INVESTOR,
    verificationStatus: VerificationStatus.VERIFIED,
  });
}

/**
 * Create a pending verification user
 */
export function createPendingUserFactory(): Partial<User> {
  return createUserFactory({
    verificationStatus: VerificationStatus.PENDING,
  });
}

/**
 * Create an admin user
 */
export function createAdminUserFactory(): Partial<User> {
  return createUserFactory({
    role: UserRole.ADMIN,
    verificationStatus: VerificationStatus.VERIFIED,
  });
}
