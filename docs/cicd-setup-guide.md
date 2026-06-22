# CI/CD Setup Guide - Miners Hub

**Last Updated:** 2025-01-XX  
**Story:** 1.12 - CI/CD Pipeline Setup & Configuration

This guide provides step-by-step instructions for completing the CI/CD pipeline setup for Miners Hub, including platform integrations and secrets configuration.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Vercel Integration (Frontend)](#vercel-integration-frontend)
- [Railway/Render Integration (Backend)](#railwayrender-integration-backend)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Database Migration Strategy](#database-migration-strategy)
- [Verification Steps](#verification-steps)
- [Troubleshooting](#troubleshooting)

---

## Overview

The CI/CD pipeline for Miners Hub consists of:

- **Frontend Pipeline:** Lint → Build → Test → Deploy to Vercel
- **Backend Pipeline:** Lint → Build → Test → Migrate → Deploy to Railway/Render

Both pipelines run automatically on commits to `main`, `staging`, and `develop` branches, as well as on pull requests.

---

## Prerequisites

- GitHub repository with workflows already configured (from Story 1.11)
- Vercel account (for frontend deployment)
- Railway or Render account (for backend deployment)
- Supabase project with test, staging, and production databases
- Access to GitHub repository settings (for secrets configuration)

---

## GitHub Actions Workflows

### Status: ✅ Already Configured

Both workflows are already set up from Story 1.11:

- **Frontend:** `.github/workflows/frontend-ci-cd.yml`
- **Backend:** `.github/workflows/backend-ci-cd.yml`

### Workflow Features

**Frontend Workflow:**
- ✅ Lint and type check stage
- ✅ Build and test stage (unit, integration, E2E)
- ✅ Security audit (npm audit)
- ✅ Deploy to Vercel (preview, staging, production)
- ✅ Post-deployment health checks

**Backend Workflow:**
- ✅ Lint and type check stage
- ✅ Test stage (unit, integration, E2E)
- ✅ Security audit (npm audit)
- ✅ Build stage
- ✅ Database migration stage (staging/production)
- ✅ Deploy to Railway (staging/production)
- ✅ Post-deployment health checks

### Trigger Conditions

Workflows trigger on:
- Push to `main`, `staging`, `develop` branches
- Pull requests to `main` and `staging`
- Path-based triggers (only when relevant files change)

---

## Vercel Integration (Frontend)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `miners-hub-frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

**Development Environment:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=<dev-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev-supabase-anon-key>
NODE_ENV=development
```

**Preview Environment:**
```
NEXT_PUBLIC_API_URL=https://api-preview.minershub.com
NEXT_PUBLIC_SUPABASE_URL=<preview-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<preview-supabase-anon-key>
NODE_ENV=production
```

**Staging Environment:**
```
NEXT_PUBLIC_API_URL=https://api-staging.minershub.com
NEXT_PUBLIC_SUPABASE_URL=<staging-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging-supabase-anon-key>
NODE_ENV=production
```

**Production Environment:**
```
NEXT_PUBLIC_API_URL=https://api.minershub.com
NEXT_PUBLIC_SUPABASE_URL=<production-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-supabase-anon-key>
NODE_ENV=production
```

### Step 4: Configure Branch Deployments

In Vercel Dashboard → Project Settings → Git:

- **Production Branch:** `main`
- **Preview Deployments:** Enabled (for all PRs)
- **Auto-deploy:** Enabled

Vercel will automatically:
- Deploy `main` branch to production
- Deploy `staging` branch to staging environment
- Create preview deployments for all pull requests

### Step 5: Get Vercel Tokens

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token with full access
3. Copy the token (you'll need it for GitHub Secrets)
4. Get your Organization ID from Vercel Dashboard → Settings
5. Get Project IDs from Project Settings → General

---

## Railway/Render Integration (Backend)

### Step 1: Create Railway/Render Account

Choose one platform:

**Railway:**
- Sign up at [railway.app](https://railway.app)
- Connect your GitHub account

**Render:**
- Sign up at [render.com](https://render.com)
- Connect your GitHub account

### Step 2: Create New Service

**Railway:**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Select `miners-hub-backend` as the root directory

**Render:**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `miners-hub-backend` as the root directory

### Step 3: Configure Service Settings

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm run start:prod
```

**Health Check Path:**
```
/api/health
```

**Node Version:** 18.x

### Step 4: Configure Environment Variables

Add the following environment variables for each environment:

**Development Environment:**
```
NODE_ENV=development
PORT=3001
DATABASE_URL=<dev-database-url>
SUPABASE_URL=<dev-supabase-url>
SUPABASE_SERVICE_KEY=<dev-supabase-service-key>
JWT_SECRET=<dev-jwt-secret>
JWT_REFRESH_SECRET=<dev-jwt-refresh-secret>
GEMINI_API_KEY=<gemini-api-key>
FRONTEND_URL=http://localhost:3000
```

**Staging Environment:**
```
NODE_ENV=production
PORT=3001
DATABASE_URL=<staging-database-url>
SUPABASE_URL=<staging-supabase-url>
SUPABASE_SERVICE_KEY=<staging-supabase-service-key>
JWT_SECRET=<staging-jwt-secret>
JWT_REFRESH_SECRET=<staging-jwt-refresh-secret>
GEMINI_API_KEY=<gemini-api-key>
FRONTEND_URL=https://miners-hub-staging.vercel.app
```

**Production Environment:**
```
NODE_ENV=production
PORT=3001
DATABASE_URL=<production-database-url>
SUPABASE_URL=<production-supabase-url>
SUPABASE_SERVICE_KEY=<production-supabase-service-key>
JWT_SECRET=<production-jwt-secret>
JWT_REFRESH_SECRET=<production-jwt-refresh-secret>
GEMINI_API_KEY=<gemini-api-key>
FRONTEND_URL=https://minershub.com
```

### Step 5: Configure Auto-Deployment

**Railway:**
- Auto-deploy is enabled by default
- Configure branch deployments in Service Settings → Settings → Source

**Render:**
- Enable "Auto-Deploy" in Service Settings
- Configure branch deployments in "Branch" setting

### Step 6: Get Platform Tokens

**Railway:**
1. Go to Account Settings → Tokens
2. Create a new token
3. Get Service ID from Service Settings → Settings

**Render:**
1. Go to Account Settings → API Keys
2. Generate a new API key
3. Get Service ID from Service Settings

---

## GitHub Secrets Configuration

### Required Secrets

Configure the following secrets in GitHub → Repository Settings → Secrets and variables → Actions:

#### Vercel Secrets
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel production project ID
- `VERCEL_PROJECT_ID_STAGING` - Vercel staging project ID

#### Railway/Render Secrets
- `RAILWAY_TOKEN` - Railway API token (if using Railway)
- `RAILWAY_SERVICE_ID_STAGING` - Railway staging service ID
- `RAILWAY_SERVICE_ID_PROD` - Railway production service ID

#### Database Secrets
- `TEST_DATABASE_URL` - Test database connection string
- `STAGING_DATABASE_URL` - Staging database connection string
- `PRODUCTION_DATABASE_URL` - Production database connection string

#### Supabase Secrets
- `TEST_SUPABASE_URL` - Test Supabase project URL
- `TEST_SUPABASE_SERVICE_KEY` - Test Supabase service role key
- `STAGING_SUPABASE_URL` - Staging Supabase project URL
- `STAGING_SUPABASE_SERVICE_KEY` - Staging Supabase service role key
- `PRODUCTION_SUPABASE_URL` - Production Supabase project URL
- `PRODUCTION_SUPABASE_SERVICE_KEY` - Production Supabase service role key

#### JWT Secrets
- `TEST_JWT_SECRET` - Test JWT secret (min 32 characters)
- `TEST_JWT_REFRESH_SECRET` - Test JWT refresh secret (min 32 characters)
- `STAGING_JWT_SECRET` - Staging JWT secret (min 32 characters)
- `STAGING_JWT_REFRESH_SECRET` - Staging JWT refresh secret (min 32 characters)
- `PRODUCTION_JWT_SECRET` - Production JWT secret (min 32 characters)
- `PRODUCTION_JWT_REFRESH_SECRET` - Production JWT refresh secret (min 32 characters)

#### API Keys
- `GEMINI_API_KEY` - Google Gemini API key

#### Frontend Environment Variables (for CI/CD)
- `NEXT_PUBLIC_API_URL` - API URL for tests
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL for tests
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key for tests

### Security Best Practices

- ✅ Secrets are never exposed in logs (GitHub Actions masks them automatically)
- ✅ Use different secrets for each environment
- ✅ Rotate secrets regularly
- ✅ Use strong, unique JWT secrets (minimum 32 characters)
- ✅ Never commit secrets to the repository

---

## Database Migration Strategy

### Status: ✅ Already Configured

Database migrations are automatically run in the backend CI/CD pipeline:

1. **Staging:** Migrations run before deployment when pushing to `staging` branch
2. **Production:** Migrations run before deployment when pushing to `main` branch

### Migration Commands

Available commands (from `miners-hub-backend/package.json`):

```bash
npm run migration:generate  # Generate new migration
npm run migration:create    # Create empty migration
npm run migration:run        # Run pending migrations
npm run migration:revert     # Revert last migration
npm run migration:show       # Show migration status
```

### Rollback Procedure

If a migration fails in production:

1. **Immediate:** The deployment will fail, preventing bad code from going live
2. **Rollback Migration:**
   ```bash
   npm run migration:revert
   ```
3. **Verify:** Check migration status:
   ```bash
   npm run migration:show
   ```
4. **Fix:** Address the migration issue and redeploy

### Migration Best Practices

- ✅ Always test migrations on staging first
- ✅ Create database backups before production migrations
- ✅ Review migration files before committing
- ✅ Use transactions when possible
- ✅ Keep migrations small and focused

---

## Verification Steps

### 1. Verify Workflows Execute

1. Make a test commit to `develop` branch
2. Check GitHub Actions tab for workflow execution
3. Verify all stages complete successfully:
   - ✅ Lint and type check
   - ✅ Build
   - ✅ Tests (unit, integration, E2E)
   - ✅ Security audit
   - ✅ Deployment (if applicable)

### 2. Verify Vercel Integration

1. Create a test pull request
2. Check Vercel Dashboard for preview deployment
3. Verify preview URL is accessible
4. Push to `staging` branch
5. Verify staging deployment in Vercel Dashboard
6. Check staging URL: `https://miners-hub-staging.vercel.app`

### 3. Verify Railway/Render Integration

1. Push to `staging` branch
2. Check Railway/Render dashboard for deployment
3. Verify health check endpoint:
   ```bash
   curl https://api-staging.minershub.com/api/health
   ```
4. Verify response includes `"status": "healthy"`

### 4. Verify Secrets Configuration

1. Check GitHub Actions logs (secrets are masked)
2. Verify deployments succeed (indicates secrets are correct)
3. Test with missing secret to confirm error handling

### 5. Verify Database Migrations

1. Create a test migration
2. Push to `staging` branch
3. Check CI/CD logs for migration execution
4. Verify migration status in database

---

## Troubleshooting

### Workflow Fails at Lint Stage

**Issue:** ESLint or TypeScript errors

**Solution:**
- Fix linting errors locally: `npm run lint`
- Fix type errors: `npx tsc --noEmit`
- Commit fixes and push

### Workflow Fails at Test Stage

**Issue:** Tests failing in CI/CD

**Solution:**
- Run tests locally: `npm run test`
- Check test environment variables
- Verify test database connection
- Fix failing tests before pushing

### Deployment Fails

**Issue:** Vercel or Railway deployment fails

**Solution:**
- Check platform logs for errors
- Verify environment variables are set correctly
- Check build logs for compilation errors
- Verify secrets are configured in GitHub

### Health Check Fails

**Issue:** Post-deployment health check fails

**Solution:**
- Check backend logs for errors
- Verify database connection
- Check health endpoint manually: `curl <deployment-url>/api/health`
- Verify environment variables are set correctly

### Migration Fails

**Issue:** Database migration fails in CI/CD

**Solution:**
- Check migration logs for specific error
- Verify database connection string is correct
- Test migration locally first
- Check for migration conflicts

### Secrets Not Working

**Issue:** Secrets not accessible in workflows

**Solution:**
- Verify secrets are added in GitHub Settings → Secrets
- Check secret names match workflow references exactly
- Verify repository has access to secrets
- Check if secrets are environment-specific

---

## Next Steps

After completing this setup:

1. ✅ Verify all workflows execute successfully
2. ✅ Test deployments to staging environment
3. ✅ Verify health checks pass
4. ✅ Document any custom configurations
5. ✅ Set up monitoring and alerts (optional)

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [TypeORM Migrations](https://typeorm.io/migrations)

---

**Note:** Some steps require manual configuration in external platforms (Vercel, Railway/Render, GitHub). These cannot be fully automated and must be completed manually by a team member with appropriate access.
