# Test Environment Setup Guide

This guide explains how to configure test environment variables for the Miners Hub project.

## Overview

Tests require a separate test environment configuration to:
- Isolate test data from development/production data
- Use a dedicated test database (Supabase test project)
- Configure test-specific API keys and secrets
- Ensure tests don't affect production systems

## Frontend Test Environment

### Setup Steps

1. **Create `.env.test` file** in `miners-hub-frontend/` directory:

```bash
cd miners-hub-frontend
cp .env.test.example .env.test
```

2. **Fill in test values** in `.env.test`:

```env
# Node Environment
NODE_ENV=test

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Supabase Test Project Configuration
NEXT_PUBLIC_SUPABASE_URL=https://test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key

# Playwright Configuration
PLAYWRIGHT_ENV=test
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

3. **Environment variable loading**:
   - Vitest automatically uses environment variables from `process.env`
   - You can set variables before running tests: `NEXT_PUBLIC_API_URL=... npm run test:unit`
   - Or use `.env.test` file (load manually if needed)

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Must be `test` | `test` |
| `NEXT_PUBLIC_API_URL` | Backend API URL for tests | `http://localhost:3001/api` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase test project URL | `https://test-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase test project anon key | `eyJhbGci...` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `PLAYWRIGHT_ENV` | Playwright environment (`test`, `dev`, `staging`, `production`) |
| `PLAYWRIGHT_BASE_URL` | Base URL for Playwright E2E tests |

## Backend Test Environment

### Setup Steps

1. **Create `.env.test` file** in `miners-hub-backend/` directory:

```bash
cd miners-hub-backend
cp .env.test.example .env.test
```

2. **Create Supabase Test Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project specifically for testing
   - Note: Use a separate project, never use production database for tests!

3. **Fill in test values** in `.env.test`:

```env
# Node Environment
NODE_ENV=test

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database Configuration (Supabase Test Project)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase Test Project Configuration
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_KEY=your-test-service-key
SUPABASE_ANON_KEY=your-test-anon-key

# JWT Configuration (Test Secrets)
JWT_SECRET=test-jwt-secret-key-min-32-chars
JWT_REFRESH_SECRET=test-refresh-secret-key-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Logging
LOG_LEVEL=error
```

4. **Environment variable loading**:
   - Jest tests use `process.env` variables
   - NestJS ConfigModule can load `.env.test` if configured
   - You can set variables before running tests: `DATABASE_URL=... npm run test`

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Must be `test` | `test` |
| `DATABASE_URL` | Test database connection string | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` |
| `SUPABASE_URL` | Supabase test project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase test project service key | `eyJhbGci...` |
| `JWT_SECRET` | JWT secret for testing (min 32 chars) | `test-jwt-secret-...` |
| `JWT_REFRESH_SECRET` | JWT refresh secret for testing (min 32 chars) | `test-refresh-secret-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `LOG_LEVEL` | Logging level | `error` |
| `GEMINI_API_KEY` | Gemini API key (if testing AI features) | - |

## Getting Supabase Test Project Credentials

1. **Create Test Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Name it something like "miners-hub-test"
   - Choose a region close to your development location
   - Set a database password (save it securely!)

2. **Get Database Connection String**:
   - Go to Settings → Database
   - Scroll to "Connection string"
   - Select "URI" tab
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual password

3. **Get API Keys**:
   - Go to Settings → API
   - Copy:
     - **Project URL** → `SUPABASE_URL`
     - **anon/public key** → `SUPABASE_ANON_KEY` (frontend) or `SUPABASE_SERVICE_KEY` (backend)
     - **service_role key** → `SUPABASE_SERVICE_KEY` (backend only, keep secret!)

## Environment Variable Loading

### Frontend (Vitest)

Vitest uses `process.env` directly. Environment variables can be set:

1. **Via `.env.test` file** (load manually if needed):
```typescript
// In vitest.config.ts or vitest.setup.ts
import { config } from 'dotenv';
config({ path: '.env.test' });
```

2. **Via command line**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api npm run test:unit
```

3. **Via default values** in `vitest.setup.ts` (already configured)

### Backend (Jest)

Jest uses `process.env` directly. Environment variables can be set:

1. **Via `.env.test` file** (load manually if needed):
```typescript
// In test setup file
require('dotenv').config({ path: '.env.test' });
```

2. **Via command line**:
```bash
DATABASE_URL=postgresql://... npm run test:integration
```

3. **Via NestJS ConfigModule** (if configured to load `.env.test`)

## Security Best Practices

1. **Never commit `.env.test` files** - They contain test secrets
2. **Use separate test projects** - Never use production database for tests
3. **Rotate test secrets regularly** - Treat test secrets with same care as production
4. **Use strong test secrets** - JWT secrets should be at least 32 characters
5. **Limit test project access** - Only grant access to developers who need it

## Verifying Test Environment

### Frontend

```bash
cd miners-hub-frontend
npm run test:unit
# Should run without errors
```

### Backend

```bash
cd miners-hub-backend
npm run test:integration
# Should connect to test database and run tests
```

## Troubleshooting

### Frontend Tests Failing

- **Check environment variables**: Ensure `.env.test` exists and has correct values
- **Check API URL**: Verify `NEXT_PUBLIC_API_URL` points to correct backend
- **Check Supabase keys**: Verify test project keys are correct

### Backend Tests Failing

- **Check DATABASE_URL**: Verify connection string is correct and test database is accessible
- **Check database connection**: Test connection manually: `psql $DATABASE_URL`
- **Check Supabase keys**: Verify test project service key is correct
- **Check JWT secrets**: Ensure secrets are at least 32 characters long

### Database Connection Issues

- **Verify test project exists**: Check Supabase dashboard
- **Check network access**: Ensure your IP can access Supabase
- **Check credentials**: Verify password and connection string format
- **Check database status**: Ensure test project is active

## Example Test Environment Files

See `.env.test.example` files in:
- `miners-hub-frontend/.env.test.example`
- `miners-hub-backend/.env.test.example`

Copy these to `.env.test` and fill in your actual test values.

## CI/CD Integration

In CI/CD pipelines, set environment variables as secrets:

**GitHub Actions Example:**
```yaml
env:
  DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
  SUPABASE_SERVICE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_KEY }}
  JWT_SECRET: ${{ secrets.TEST_JWT_SECRET }}
```

## See Also

- [Environment Variables Guide](./env-variables-guide.md) - Comprehensive guide for all environments
- [Test Strategy](./test-strategy.md) - Test strategy and patterns
- [Backend README](../miners-hub-backend/README-ENV.md) - Backend environment setup

