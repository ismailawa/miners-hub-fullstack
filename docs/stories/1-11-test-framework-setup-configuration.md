# Story 1.11: Test Framework Setup & Configuration

Status: ready-for-dev

## Story

As a **developer**,
I want **comprehensive test frameworks configured for frontend and backend**,
So that **I can write and run tests throughout development to ensure quality and prevent regressions**.

## Acceptance Criteria

1. **AC1: Frontend E2E Testing Setup**
   - Playwright installed and configured for E2E testing
   - Playwright configuration file (`playwright.config.ts`) with:
     - Environment switching (dev, staging, production)
     - Timeout standards (30s default, 60s for E2E)
     - Artifact outputs (screenshots, videos, traces)
     - Test data factories setup
   - Test directory structure created (`tests/e2e/`)
   - Playwright browsers installed (`npx playwright install`)

2. **AC2: Frontend Unit Testing Setup**
   - Vitest installed and configured for unit testing
   - Vitest configuration file (`vitest.config.ts`) with coverage reporting
   - Test directory structure created (`__tests__/unit/`, `__tests__/integration/`)
   - Coverage reporting configured (c8/v8)

3. **AC3: Frontend Component Testing Setup**
   - Playwright Component Testing configured for component tests
   - Component test directory structure created
   - Test utilities for component testing

4. **AC4: Frontend Test Scripts**
   - Test scripts in `package.json`:
     - `npm run test:unit` - Run unit tests
     - `npm run test:integration` - Run integration tests
     - `npm run test:e2e` - Run E2E tests
     - `npm run test:coverage` - Generate coverage reports
     - `npm run test` - Run all tests

5. **AC5: Backend Unit Testing Setup**
   - Jest configured (already installed with NestJS)
   - Jest configuration verified/updated in `package.json` or `jest.config.js`
   - Test directory structure verified (`src/**/*.spec.ts`)
   - Coverage reporting configured

6. **AC6: Backend API Testing Setup**
   - Supertest installed and configured (already installed)
   - Test directory structure created (`test/`, `test/integration/`)
   - E2E test configuration (`test/jest-e2e.json` - already exists)
   - Test database configuration (Supabase test project)

7. **AC7: Backend Test Scripts**
   - Test scripts in `package.json`:
     - `npm run test` - Run unit tests (already exists)
     - `npm run test:integration` - Run integration tests
     - `npm run test:e2e` - Run E2E tests (already exists)
     - `npm run test:coverage` - Generate coverage reports (already exists as `test:cov`)

8. **AC8: Test Data Infrastructure**
   - Test data factories created (user, listing, auction factories)
   - Test fixtures and helpers setup
   - Test utilities for common operations (auth helpers, API helpers)
   - Faker.js or similar installed for generating test data

9. **AC9: Test Environment Configuration**
   - Test environment variables configured (`.env.test`)
   - Test database connection configured (separate Supabase test project)
   - Environment switching for test execution

10. **AC10: CI/CD Test Integration**
    - GitHub Actions workflow configured to run tests
    - Test execution in CI/CD pipeline on commits
    - Test coverage reporting in CI/CD
    - Test failure blocks deployment

11. **AC11: Test Execution Verification**
    - All test commands execute successfully (even if no tests exist yet)
    - Test coverage reports generate correctly
    - CI/CD pipeline runs tests on commits

12. **AC12: Test Documentation**
    - `tests/README.md` created with test guidelines
    - Test patterns and conventions documented
    - Examples of test structure provided
    - Test strategy alignment documented

## Tasks / Subtasks

- [ ] Task 1: Install Frontend Test Dependencies (AC: 1, 2, 3)
  - [ ] Install Playwright: `npm install -D @playwright/test`
  - [ ] Install Vitest: `npm install -D vitest @vitest/ui @vitest/coverage-v8`
  - [ ] Install Faker.js: `npm install -D @faker-js/faker`
  - [ ] Initialize Playwright browsers: `npx playwright install`
  - [ ] Verify all dependencies installed correctly

- [ ] Task 2: Configure Playwright for E2E Testing (AC: 1)
  - [ ] Create `playwright.config.ts` with environment configurations
  - [ ] Configure timeout standards (30s default, 60s for E2E)
  - [ ] Configure artifact outputs (screenshots, videos, traces)
  - [ ] Set up environment switching (dev, staging, production)
  - [ ] Create `tests/e2e/` directory structure
  - [ ] Create example E2E test file

- [ ] Task 3: Configure Vitest for Unit Testing (AC: 2)
  - [ ] Create `vitest.config.ts` for unit testing
  - [ ] Configure coverage reporting (c8/v8)
  - [ ] Set up test environment (jsdom for React components)
  - [ ] Create `__tests__/unit/` directory structure
  - [ ] Create `__tests__/integration/` directory structure
  - [ ] Create example unit test file

- [ ] Task 4: Configure Playwright Component Testing (AC: 3)
  - [ ] Configure Playwright Component Testing
  - [ ] Set up component test directory structure
  - [ ] Create test utilities for component testing
  - [ ] Create example component test file

- [ ] Task 5: Add Frontend Test Scripts (AC: 4)
  - [ ] Add `test:unit` script to `package.json`
  - [ ] Add `test:integration` script to `package.json`
  - [ ] Add `test:e2e` script to `package.json`
  - [ ] Add `test:coverage` script to `package.json`
  - [ ] Add `test` script to run all tests
  - [ ] Verify all scripts execute successfully

- [ ] Task 6: Verify Backend Jest Configuration (AC: 5)
  - [ ] Review existing Jest configuration in `package.json`
  - [ ] Verify test directory structure (`src/**/*.spec.ts`)
  - [ ] Verify coverage reporting configuration
  - [ ] Update configuration if needed
  - [ ] Create example unit test file

- [ ] Task 7: Configure Backend API Testing (AC: 6)
  - [ ] Verify Supertest is installed (already installed)
  - [ ] Review existing E2E test configuration (`test/jest-e2e.json`)
  - [ ] Create `test/integration/` directory structure
  - [ ] Configure test database connection (Supabase test project)
  - [ ] Create example integration test file

- [ ] Task 8: Add Backend Test Scripts (AC: 7)
  - [ ] Verify existing `test` script (unit tests)
  - [ ] Add `test:integration` script to `package.json`
  - [ ] Verify existing `test:e2e` script
  - [ ] Verify existing `test:cov` script (coverage)
  - [ ] Add alias `test:coverage` if needed
  - [ ] Verify all scripts execute successfully

- [ ] Task 9: Create Test Data Factories (AC: 8)
  - [ ] Install Faker.js in backend: `npm install -D @faker-js/faker`
  - [ ] Create test data factory directory structure
  - [ ] Create user factory (`test/factories/user.factory.ts`)
  - [ ] Create listing factory (`test/factories/listing.factory.ts`)
  - [ ] Create auction factory (`test/factories/auction.factory.ts`)
  - [ ] Create test fixtures for common scenarios

- [ ] Task 10: Create Test Utilities and Helpers (AC: 8)
  - [ ] Create auth helpers (`test/helpers/auth.helper.ts`)
  - [ ] Create API helpers (`test/helpers/api.helper.ts`)
  - [ ] Create database helpers (`test/helpers/db.helper.ts`)
  - [ ] Create test utilities directory structure
  - [ ] Document helper usage

- [ ] Task 11: Configure Test Environment Variables (AC: 9)
  - [ ] Create `.env.test` file for frontend
  - [ ] Create `.env.test` file for backend
  - [ ] Configure test database connection (Supabase test project)
  - [ ] Set up environment variable loading for tests
  - [ ] Document test environment requirements

- [ ] Task 12: Configure CI/CD Test Integration (AC: 10)
  - [ ] Create GitHub Actions workflow for frontend tests
  - [ ] Create GitHub Actions workflow for backend tests
  - [ ] Configure test execution on commits
  - [ ] Configure test coverage reporting
  - [ ] Configure test failure to block deployment
  - [ ] Test CI/CD pipeline execution

- [ ] Task 13: Verify Test Execution (AC: 11)
  - [ ] Run all frontend test commands and verify success
  - [ ] Run all backend test commands and verify success
  - [ ] Verify test coverage reports generate correctly
  - [ ] Verify CI/CD pipeline runs tests on test commit
  - [ ] Document any issues found

- [ ] Task 14: Create Test Documentation (AC: 12)
  - [ ] Create `tests/README.md` with test guidelines
  - [ ] Document test patterns and conventions
  - [ ] Provide examples of test structure
  - [ ] Document test strategy alignment
  - [ ] Include test execution instructions

## Dev Notes

### Architecture Alignment

This story implements test framework setup as specified in the architecture and test strategy documents:
- **Test Strategy:** Test pyramid approach (60% unit, 30% integration, 10% E2E) [Source: docs/test-strategy.md]
- **Frontend Testing:** Playwright for E2E, Vitest for unit, Playwright Component Testing for components [Source: docs/test-strategy.md]
- **Backend Testing:** Jest for unit/integration, Supertest for API testing [Source: docs/test-strategy.md]
- **Test Coverage:** Frontend 70%, Backend 80%, Critical paths 100% [Source: docs/test-strategy.md]
- **CI/CD Integration:** Tests run automatically on commits [Source: docs/tech-spec-epic-1.md:AC11]

### Implementation Patterns

- **Test Pyramid:** Prioritize unit tests, supplement with integration, use E2E sparingly
- **Test Data Factories:** Use Faker.js for generating realistic test data
- **Test Utilities:** Create reusable helpers for common operations (auth, API, database)
- **Environment Separation:** Use separate test database (Supabase test project)
- **Coverage Reporting:** Use c8/v8 for coverage reporting

### Test Directory Structure

**Frontend:**
```
miners-hub-frontend/
├── tests/
│   ├── e2e/              # E2E tests (Playwright)
│   │   └── example.spec.ts
│   └── README.md
├── __tests__/
│   ├── unit/            # Unit tests (Vitest)
│   │   └── example.test.ts
│   └── integration/     # Integration tests (Vitest)
│       └── example.test.ts
├── playwright.config.ts
└── vitest.config.ts
```

**Backend:**
```
miners-hub-backend/
├── test/
│   ├── integration/     # Integration tests (Jest + Supertest)
│   │   └── example.integration.spec.ts
│   ├── e2e/             # E2E tests (Jest)
│   │   └── example.e2e-spec.ts
│   ├── factories/       # Test data factories
│   │   ├── user.factory.ts
│   │   ├── listing.factory.ts
│   │   └── auction.factory.ts
│   └── helpers/         # Test utilities
│       ├── auth.helper.ts
│       ├── api.helper.ts
│       └── db.helper.ts
├── src/
│   └── **/*.spec.ts     # Unit tests (Jest)
└── jest-e2e.json        # E2E test configuration
```

### Testing Standards

- **Unit Tests:** Fast, isolated, test business logic and pure functions
- **Integration Tests:** Test API contracts, service interactions, database operations
- **E2E Tests:** Test critical user journeys, complete workflows
- **Coverage:** Enforce coverage thresholds in CI/CD
- **Test Naming:** Use descriptive test names following pattern: `describe('Component/Service', () => { it('should do something', () => {}) })`

### Project Structure Notes

**Expected Directory Structure:**
```
miners-hub-frontend/
├── tests/e2e/           # E2E tests
├── __tests__/unit/      # Unit tests
├── __tests__/integration/ # Integration tests
├── playwright.config.ts # Playwright configuration
└── vitest.config.ts     # Vitest configuration

miners-hub-backend/
├── test/                # Integration and E2E tests
│   ├── integration/
│   ├── e2e/
│   ├── factories/
│   └── helpers/
├── src/**/*.spec.ts     # Unit tests
└── jest-e2e.json        # E2E configuration
```

**Alignment:** Matches Test Strategy document structure and architecture requirements

### References

- [Source: docs/epics.md#Story-1.11] - Story acceptance criteria and technical notes
- [Source: docs/tech-spec-epic-1.md#AC11] - Test Framework Setup acceptance criteria
- [Source: docs/test-strategy.md] - Comprehensive test strategy and patterns
- [Source: docs/architecture.md] - Architecture patterns and component structure

### Learnings from Previous Stories

**From Story 1.10 (Responsive Design Foundation):**
- No test frameworks were set up yet - this story addresses that gap
- Manual testing was done via browser DevTools - automated tests will replace this
- Responsive design patterns documented - can be tested with Playwright visual regression
- Touch targets verified manually - can be automated with Playwright component tests
- Documentation created (`docs/responsive-design-guidelines.md`) - test examples can reference this

**From Story 1.9 (Constants & Initial Dummy Data):**
- Dummy data available at `lib/constants/data.ts` - can be used for test fixtures
- Helper functions available for data access - useful for test setup
- Data includes miners, listings, testimonials, events - good for E2E test scenarios

**From Story 1.1 (Project Setup):**
- Next.js 16.0.1 project initialized - compatible with Playwright and Vitest
- TypeScript configured - test files should use TypeScript
- ESLint configured - test files should follow linting rules
- Project structure established - test directories should align with this structure

**Test Framework Strategy:**
- Start with frontend test setup (Playwright, Vitest)
- Then configure backend tests (Jest already installed, verify configuration)
- Create test infrastructure (factories, helpers, utilities)
- Integrate with CI/CD pipeline
- Document test patterns and conventions

## Dev Agent Record

### Context Reference

- `docs/stories/1-11-test-framework-setup-configuration.context.xml` - Story context XML with documentation, code artifacts, dependencies, constraints, and testing guidance

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2025-01-XX | 1.0.0 | Story created from epics.md and tech-spec-epic-1.md |

