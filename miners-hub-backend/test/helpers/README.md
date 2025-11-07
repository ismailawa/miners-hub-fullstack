# Test Helpers Documentation

This directory contains reusable utilities and helpers for writing tests.

## Auth Helper (`auth.helper.ts`)

Utilities for authentication in tests.

### Usage

```typescript
import { createAuthHeaders, createMinerToken } from './helpers/auth.helper';

// Create auth headers for a user
const headers = createAuthHeaders({ id: 'user-id', role: UserRole.MINER });

// Use in API requests
const response = await getRequest(app, '/listings', { user: { id: 'user-id', role: UserRole.MINER } });

// Create specific role tokens
const minerToken = createMinerToken();
const investorToken = createInvestorToken();
const adminToken = createAdminToken();
```

### Functions

- `createTestAuthToken(user)` - Create a test authentication token
- `createAuthHeader(user)` - Create Authorization header value
- `createAuthHeaders(user)` - Create Authorization header object
- `createMinerToken()` - Create token for miner user
- `createInvestorToken()` - Create token for investor user
- `createAdminToken()` - Create token for admin user
- `createGovernmentToken()` - Create token for government user
- `extractUserFromToken(token)` - Extract user info from token

**Note:** JWT implementation will be added in Story 2.1 (Authentication). These helpers provide a foundation that can be extended when auth is implemented.

## API Helper (`api.helper.ts`)

Utilities for making API requests in tests.

### Usage

```typescript
import { getRequest, postRequest, expectSuccessResponse } from './helpers/api.helper';

// GET request
const response = await getRequest(app, '/health');
expectSuccessResponse(response);

// POST request with body and auth
const response = await postRequest(app, '/listings', {
  user: { id: 'user-id', role: UserRole.MINER },
  body: { mineralType: 'Gold', quantity: 100, price: 50000 },
});

// GET request with query parameters
const response = await getRequest(app, '/listings', {
  query: { status: 'published', limit: 10 },
});
```

### Functions

- `getRequest(app, path, options)` - Make a GET request
- `postRequest(app, path, options)` - Make a POST request
- `putRequest(app, path, options)` - Make a PUT request
- `patchRequest(app, path, options)` - Make a PATCH request
- `deleteRequest(app, path, options)` - Make a DELETE request
- `expectSuccessResponse(response, statusCode)` - Assert successful response
- `expectErrorResponse(response, statusCode)` - Assert error response
- `expectValidationError(response)` - Assert validation error
- `expectUnauthorizedResponse(response)` - Assert unauthorized response
- `expectForbiddenResponse(response)` - Assert forbidden response
- `expectNotFoundResponse(response)` - Assert not found response

## Database Helper (`db.helper.ts`)

Utilities for database operations in tests.

### Usage

```typescript
import {
  getRepository,
  saveTestEntity,
  findTestEntityById,
  cleanupAllTestData,
} from './helpers/db.helper';
import { User } from '../../src/entities/user.entity';

// Save test entity
const user = await saveTestEntity(dataSource, User, {
  email: 'test@example.com',
  passwordHash: 'hash',
  role: UserRole.MINER,
});

// Find entity by ID
const foundUser = await findTestEntityById(dataSource, User, user.id);

// Clean up test data
await cleanupAllTestData(dataSource);

// Get repository
const userRepository = getRepository(dataSource, User);
const users = await userRepository.find();
```

### Functions

- `getRepository(dataSource, entity)` - Get repository for an entity
- `cleanupTestData(dataSource, entities)` - Clean up test data from specific entities
- `cleanupAllTestData(dataSource)` - Clean up all test data
- `saveTestEntity(dataSource, entity, data)` - Save test entity to database
- `findTestEntityById(dataSource, entity, id)` - Find test entity by ID
- `findAllTestEntities(dataSource, entity)` - Find all test entities
- `deleteTestEntityById(dataSource, entity, id)` - Delete test entity by ID
- `countTestEntities(dataSource, entity)` - Count test entities
- `executeRawQuery(dataSource, query, parameters)` - Execute raw SQL query
- `truncateTable(dataSource, tableName)` - Truncate table
- `beginTransaction(dataSource)` - Begin transaction
- `rollbackTransaction(queryRunner)` - Rollback transaction
- `commitTransaction(queryRunner)` - Commit transaction

## Best Practices

1. **Always clean up test data** - Use `cleanupAllTestData()` in `afterEach` or `afterAll` hooks
2. **Use factories for test data** - Combine factories from `test/factories/` with database helpers
3. **Use transactions for isolation** - Wrap tests in transactions when needed
4. **Use auth helpers consistently** - Always use `createAuthHeaders()` for authenticated requests
5. **Use API helpers for requests** - Use helper functions instead of raw Supertest calls for consistency

## Example Integration Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { getRequest, expectSuccessResponse } from '../helpers/api.helper';
import { cleanupAllTestData } from '../helpers/db.helper';
import { createVerifiedMinerFactory } from '../factories/user.factory';

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

  it('GET /listings should return listings', async () => {
    const miner = createVerifiedMinerFactory();
    const response = await getRequest(app, '/listings', {
      user: miner,
    });

    expectSuccessResponse(response);
  });
});
```

