# Testing Guide

**Last Updated:** 2025-01-XX  
**Story:** 1.11 - Test Framework Setup & Configuration

This guide provides comprehensive documentation for writing, running, and maintaining tests in the Miners Hub project.

## Table of Contents

- [Quick Start](#quick-start)
- [Test Strategy Alignment](#test-strategy-alignment)
- [Test Frameworks](#test-frameworks)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Test Patterns & Conventions](#test-patterns--conventions)
- [Running Tests](#running-tests)
- [Test Data Management](#test-data-management)
- [Test Helpers & Utilities](#test-helpers--utilities)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Frontend Tests

```bash
# Run all frontend tests
cd miners-hub-frontend
npm run test

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # E2E tests (requires dev server)
npm run test:component     # Component tests
npm run test:coverage      # Generate coverage report
npm run test:watch         # Watch mode
```

### Backend Tests

```bash
# Run all backend tests
cd miners-hub-backend
npm run test

# Run specific test types
npm run test                # Unit tests only
npm run test:integration    # Integration tests (requires database)
npm run test:e2e           # E2E tests (requires database)
npm run test:coverage      # Generate coverage report
npm run test:watch         # Watch mode
```

---

## Test Strategy Alignment

Our testing approach follows the **Test Pyramid** principle:

```
        /\
       /E2E\        ← 10% (Critical user journeys)
      /------\
     /Integration\  ← 30% (API contracts, service interactions)
    /------------\
   /   Unit Tests  \  ← 60% (Business logic, pure functions)
  /------------------\
```

### Coverage Targets

- **Frontend:** 70% code coverage (unit + component)
- **Backend:** 80% code coverage (unit + integration)
- **Critical Paths:** 100% coverage (P0 scenarios)

### Test Priority

- **P0 (Critical):** Revenue, security, compliance - Must test comprehensively
- **P1 (High):** Core user journeys - Should test thoroughly
- **P2 (Medium):** Secondary features - Nice to test
- **P3 (Low):** Rarely used features - Test if time permits

See [Test Strategy Document](../test-strategy.md) for detailed information.

---

## Test Frameworks

### Frontend

| Framework | Purpose | Location |
|-----------|---------|----------|
| **Vitest** | Unit & Integration tests | `__tests__/unit/`, `__tests__/integration/` |
| **Playwright** | E2E tests | `tests/e2e/` |
| **Playwright CT** | Component tests | `tests/component/` |

### Backend

| Framework | Purpose | Location |
|-----------|---------|----------|
| **Jest** | Unit tests | `src/**/*.spec.ts` |
| **Jest + Supertest** | Integration & E2E tests | `test/integration/`, `test/*.e2e-spec.ts` |

---

## Test Structure

### Frontend Directory Structure

```
miners-hub-frontend/
├── __tests__/
│   ├── unit/              # Unit tests (Vitest)
│   │   └── example.test.ts
│   └── integration/        # Integration tests (Vitest)
│       └── example.test.ts
├── tests/
│   ├── e2e/               # E2E tests (Playwright)
│   │   └── example.spec.ts
│   └── component/         # Component tests (Playwright CT)
│       ├── example.spec.tsx
│       └── test-utils.tsx
├── playwright.config.ts    # Playwright E2E config
├── playwright-ct.config.ts # Playwright Component Testing config
└── vitest.config.ts       # Vitest config
```

### Backend Directory Structure

```
miners-hub-backend/
├── src/
│   └── **/*.spec.ts       # Unit tests (Jest)
├── test/
│   ├── integration/       # Integration tests (Jest + Supertest)
│   │   └── example.integration.spec.ts
│   ├── e2e/               # E2E tests (Jest)
│   │   └── example.e2e-spec.ts
│   ├── factories/         # Test data factories
│   │   ├── user.factory.ts
│   │   ├── listing.factory.ts
│   │   ├── auction.factory.ts
│   │   ├── fixtures.ts
│   │   └── index.ts
│   ├── helpers/           # Test utilities
│   │   ├── auth.helper.ts
│   │   ├── api.helper.ts
│   │   ├── db.helper.ts
│   │   ├── index.ts
│   │   └── README.md
│   ├── setup-integration.ts
│   └── jest-e2e.json
└── coverage/              # Coverage reports
```

---

## Writing Tests

### Frontend Unit Test Example

```typescript
// __tests__/unit/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from '@/lib/utils';

describe('formatPrice', () => {
  it('should format price with currency symbol', () => {
    expect(formatPrice(1000)).toBe('₦1,000.00');
  });

  it('should handle zero price', () => {
    expect(formatPrice(0)).toBe('₦0.00');
  });

  it('should handle negative prices', () => {
    expect(formatPrice(-100)).toBe('-₦100.00');
  });
});
```

### Frontend Integration Test Example

```typescript
// __tests__/integration/api.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchListings } from '@/lib/api/listings';

describe('fetchListings', () => {
  it('should fetch and return listings', async () => {
    const listings = await fetchListings();
    expect(listings).toBeInstanceOf(Array);
    expect(listings[0]).toHaveProperty('id');
    expect(listings[0]).toHaveProperty('mineralType');
  });
});
```

### Frontend E2E Test Example

```typescript
// tests/e2e/marketplace.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
  test('should display listings on homepage', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page.locator('[data-testid="listing-card"]').first()).toBeVisible();
  });

  test('should filter listings by mineral type', async ({ page }) => {
    await page.goto('/marketplace');
    await page.selectOption('[data-testid="mineral-filter"]', 'Gold');
    await expect(page.locator('[data-testid="listing-card"]')).toHaveCount(1);
  });
});
```

### Backend Unit Test Example

```typescript
// src/services/listing.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ListingService } from './listing.service';

describe('ListingService', () => {
  let service: ListingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListingService],
    }).compile();

    service = module.get<ListingService>(ListingService);
  });

  it('should calculate total price correctly', () => {
    const quantity = 100;
    const pricePerTon = 50000;
    const total = service.calculateTotalPrice(quantity, pricePerTon);
    expect(total).toBe(5000000);
  });
});
```

### Backend Integration Test Example

```typescript
// test/integration/listings.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { getRequest, expectSuccessResponse } from '../helpers/api.helper';
import { cleanupAllTestData } from '../helpers/db.helper';
import { DataSource } from 'typeorm';

describe('Listings API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await cleanupAllTestData(dataSource);
    await app.close();
  });

  it('GET /api/listings should return listings', async () => {
    const response = await getRequest(app, '/listings');
    expectSuccessResponse(response);
    expect(response.body).toBeInstanceOf(Array);
  });
});
```

---

## Test Patterns & Conventions

### Test Naming

Follow this pattern: `describe('Component/Service', () => { it('should do something', () => {}) })`

**Good Examples:**
```typescript
describe('UserService', () => {
  it('should create a new user', () => {});
  it('should validate email format', () => {});
  it('should throw error for invalid password', () => {});
});
```

**Bad Examples:**
```typescript
describe('UserService', () => {
  it('test1', () => {});  // ❌ Not descriptive
  it('works', () => {});   // ❌ Vague
});
```

### Test Organization

1. **Arrange-Act-Assert (AAA) Pattern:**
```typescript
it('should calculate discount correctly', () => {
  // Arrange
  const price = 1000;
  const discountPercent = 10;

  // Act
  const result = calculateDiscount(price, discountPercent);

  // Assert
  expect(result).toBe(100);
});
```

2. **Test Isolation:**
- Each test should be independent
- Use `beforeEach`/`afterEach` for setup/cleanup
- Don't rely on test execution order

3. **Test Data:**
- Use factories for test data generation
- Use fixtures for common scenarios
- Clean up test data after tests

### Mocking Guidelines

**When to Mock:**
- External API calls
- Database operations (in unit tests)
- File system operations
- Time-dependent functions
- Expensive operations

**When NOT to Mock:**
- Pure functions
- Business logic
- Integration tests (use real services)

**Example:**
```typescript
// Mock external API
vi.mock('@/lib/api/client', () => ({
  fetchData: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
}));
```

---

## Running Tests

### Local Development

**Frontend:**
```bash
# Run all tests
npm run test

# Run in watch mode (recommended during development)
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run __tests__/unit/utils.test.ts
```

**Backend:**
```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- listing.service.spec.ts
```

### CI/CD

Tests run automatically on:
- Every commit to `main`, `staging`, or `develop`
- Every pull request
- Before deployment (tests must pass)

See [CI/CD Workflows](../../.github/workflows/) for details.

---

## Test Data Management

### Using Factories

```typescript
import { createUserFactory, createVerifiedMinerFactory } from '../factories/user.factory';
import { createListingFactory } from '../factories/listing.factory';

// Create a single user
const user = createUserFactory({ role: UserRole.MINER });

// Create multiple users
const users = createUsersFactory(5);

// Create specialized user
const verifiedMiner = createVerifiedMinerFactory();

// Create listing with specific properties
const listing = createListingFactory({
  mineralType: 'Gold',
  quantity: 100,
  price: 50000,
});
```

### Using Fixtures

```typescript
import { createMarketplaceFixture, createAuctionFixture } from '../factories/fixtures';

// Complete marketplace scenario
const { miner, listing } = createMarketplaceFixture();

// Auction scenario
const { miner, listing, auction } = createAuctionFixture();
```

### Database Cleanup

```typescript
import { cleanupAllTestData } from '../helpers/db.helper';

afterAll(async () => {
  await cleanupAllTestData(dataSource);
});
```

---

## Test Helpers & Utilities

### Auth Helpers

```typescript
import { createAuthHeaders, createMinerToken } from '../helpers/auth.helper';

// Create auth headers for API requests
const headers = createAuthHeaders({ id: 'user-id', role: UserRole.MINER });

// Use in API requests
const response = await getRequest(app, '/listings', { user: { id: 'user-id', role: UserRole.MINER } });
```

### API Helpers

```typescript
import { getRequest, postRequest, expectSuccessResponse } from '../helpers/api.helper';

// GET request
const response = await getRequest(app, '/listings');
expectSuccessResponse(response);

// POST request with body
const response = await postRequest(app, '/listings', {
  user: { id: 'user-id', role: UserRole.MINER },
  body: { mineralType: 'Gold', quantity: 100, price: 50000 },
});
```

### Database Helpers

```typescript
import { saveTestEntity, findTestEntityById, cleanupAllTestData } from '../helpers/db.helper';

// Save test entity
const user = await saveTestEntity(dataSource, User, {
  email: 'test@example.com',
  passwordHash: 'hash',
  role: UserRole.MINER,
});

// Find entity
const foundUser = await findTestEntityById(dataSource, User, user.id);

// Cleanup
await cleanupAllTestData(dataSource);
```

See [Test Helpers Documentation](../miners-hub-backend/test/helpers/README.md) for complete API reference.

---

## CI/CD Integration

### Test Execution

Tests run automatically in CI/CD on:
- **Push to main/staging/develop:** Full test suite
- **Pull Requests:** Full test suite
- **Before Deployment:** Tests must pass (blocks deployment on failure)

### Coverage Reporting

- Coverage reports are generated on every test run
- Reports are uploaded to Codecov
- Coverage trends are tracked over time
- Coverage thresholds are enforced (70% frontend, 80% backend)

### Test Failure Handling

- **Test failures block deployment** - No deployment if tests fail
- **Coverage below threshold** - Warnings generated (not blocking initially)
- **Flaky tests** - Should be fixed immediately (flakiness is critical debt)

---

## Best Practices

### 1. Write Tests First (TDD)

When possible, write tests before implementation:
1. Write failing test
2. Write minimal code to pass
3. Refactor
4. Repeat

### 2. Test Behavior, Not Implementation

**Good:**
```typescript
it('should calculate total price', () => {
  expect(calculateTotal(100, 50)).toBe(5000);
});
```

**Bad:**
```typescript
it('should call multiply function', () => {
  // Testing implementation details
});
```

### 3. Keep Tests Fast

- Unit tests should be < 10ms each
- Integration tests should be < 100ms each
- E2E tests should be < 5s each

### 4. Keep Tests Simple

- One assertion per test (when possible)
- Clear test names
- Minimal setup/teardown

### 5. Use Descriptive Test Names

**Good:**
```typescript
it('should return error when email is invalid', () => {});
it('should create user with valid email and password', () => {});
```

**Bad:**
```typescript
it('test email', () => {});
it('works', () => {});
```

### 6. Clean Up After Tests

```typescript
afterEach(async () => {
  await cleanupTestData(dataSource);
});

afterAll(async () => {
  await app.close();
});
```

### 7. Don't Test Third-Party Code

- Don't test framework functions
- Don't test library functions
- Test your code that uses these functions

### 8. Test Edge Cases

- Empty inputs
- Null/undefined values
- Boundary conditions
- Error scenarios

---

## Troubleshooting

### Frontend Tests

**Issue: Tests fail with "Cannot find module"**
- Check import paths
- Verify TypeScript path aliases in `tsconfig.json`
- Check `vitest.config.ts` resolve aliases

**Issue: Component tests fail**
- Ensure Playwright browsers are installed: `npx playwright install`
- Check `playwright-ct.config.ts` configuration
- Verify component test files are in `tests/component/`

**Issue: E2E tests fail**
- Ensure dev server is running: `npm run dev`
- Check `playwright.config.ts` baseURL
- Verify test environment variables

### Backend Tests

**Issue: Integration tests fail with database error**
- Set `DATABASE_URL` environment variable
- Ensure test database is accessible
- Check database connection in `test/setup-integration.ts`

**Issue: Tests timeout**
- Increase timeout in test file: `jest.setTimeout(30000)`
- Check for hanging promises
- Verify cleanup is happening

**Issue: Coverage below threshold**
- Add more tests for uncovered code
- Review coverage report: `coverage/index.html`
- Focus on critical paths first

### General Issues

**Issue: Tests are flaky**
- Check for race conditions
- Ensure proper cleanup between tests
- Use `waitFor` for async operations
- Avoid time-dependent tests

**Issue: CI/CD tests fail but local tests pass**
- Check environment variables in CI/CD
- Verify test database setup
- Check for missing dependencies
- Review CI/CD logs

---

## Additional Resources

- [Test Strategy Document](../test-strategy.md) - Comprehensive test strategy
- [Test Environment Setup](../test-environment-setup.md) - Environment configuration
- [Test Helpers Documentation](../miners-hub-backend/test/helpers/README.md) - Helper utilities
- [Test Verification Report](../test-verification-report.md) - Verification results

---

## Quick Reference

### Test Commands

**Frontend:**
- `npm run test:unit` - Unit tests
- `npm run test:integration` - Integration tests
- `npm run test:e2e` - E2E tests
- `npm run test:component` - Component tests
- `npm run test:coverage` - Coverage report
- `npm run test:watch` - Watch mode

**Backend:**
- `npm run test` - Unit tests
- `npm run test:integration` - Integration tests
- `npm run test:e2e` - E2E tests
- `npm run test:coverage` - Coverage report
- `npm run test:watch` - Watch mode

### Test Locations

**Frontend:**
- Unit: `__tests__/unit/`
- Integration: `__tests__/integration/`
- E2E: `tests/e2e/`
- Component: `tests/component/`

**Backend:**
- Unit: `src/**/*.spec.ts`
- Integration: `test/integration/`
- E2E: `test/*.e2e-spec.ts`
- Factories: `test/factories/`
- Helpers: `test/helpers/`

---

**Happy Testing! 🧪**

