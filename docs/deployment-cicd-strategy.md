# Miners Hub - Deployment and CI/CD Strategy

**Author:** ismailawa  
**Date:** 2025-11-05  
**Version:** 1.0  
**Project:** Miners Hub - Mineral Trading & Resource Marketplace

---

## Executive Summary

This document outlines the comprehensive deployment and CI/CD strategy for Miners Hub, a full-stack application with separate frontend (Next.js) and backend (NestJS) repositories. The strategy emphasizes automated testing, secure deployments, environment isolation, and compliance-ready audit trails.

**Key Principles:**
- **Automated CI/CD:** All deployments triggered automatically from Git
- **Environment Isolation:** Separate dev, staging, and production environments
- **Security-First:** Secrets management, secure connections, audit logging
- **Compliance-Ready:** Immutable deployment history, rollback capabilities
- **Scalability:** Platform choices that support growth

---

## Deployment Architecture Overview

### Component Deployment Targets

| Component | Platform | Deployment Method | Environment Management |
|-----------|----------|-------------------|----------------------|
| **Frontend** | Vercel (Primary) or Netlify | Git-based automatic deployments | Vercel Environment Variables |
| **Backend API** | Railway (Primary), Render, or AWS | Git-based automatic deployments | Platform Environment Variables |
| **Database** | Supabase | Managed service (migrations via CI/CD) | Supabase Dashboard |
| **File Storage** | Supabase Storage | Managed service | Supabase Dashboard |
| **CDN** | Vercel Edge Network (Frontend) | Automatic | Built into Vercel |

### Environment Strategy

**Three-Environment Approach:**

1. **Development (dev)**
   - Purpose: Local development and feature testing
   - Access: Developers only
   - Data: Seed data, test fixtures
   - Auto-deploy: On push to `develop` branch

2. **Staging (staging)**
   - Purpose: Pre-production testing, QA, stakeholder demos
   - Access: Team, QA, stakeholders
   - Data: Anonymized production-like data
   - Auto-deploy: On push to `staging` branch or merge to `main`

3. **Production (prod)**
   - Purpose: Live user-facing application
   - Access: All users
   - Data: Real production data
   - Auto-deploy: On push to `main` branch (with approval gates)

---

## CI/CD Pipeline Architecture

### Frontend Pipeline (Next.js)

#### Pipeline Stages

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Commit   │───▶│   Lint &     │───▶│   Build &   │───▶│   Deploy     │───▶│   Health    │
│   Trigger  │    │   Type Check │    │   Test      │    │   (Vercel)   │    │   Check     │
└────────────┘    └──────────────┘    └─────────────┘    └──────────────┘    └─────────────┘
```

**Stage 1: Lint & Type Check**
- ESLint validation
- TypeScript type checking
- Code formatting validation (Prettier, if configured)

**Stage 2: Build & Test**
- Next.js production build (`npm run build`)
- Unit tests (if configured)
- E2E tests (Playwright, if configured)
- Build artifact validation

**Stage 3: Deploy**
- Automatic deployment to Vercel
- Environment variable injection
- Preview deployment for PRs

**Stage 4: Health Check**
- Post-deployment health checks
- Smoke tests on deployed URL

#### Branch Strategy

- **`develop`** → Deploys to `dev` environment
- **`staging`** → Deploys to `staging` environment
- **`main`** → Deploys to `production` environment
- **Feature branches** → Preview deployments on Vercel

### Backend Pipeline (NestJS)

#### Pipeline Stages

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Commit   │───▶│   Lint &     │───▶│   Build &    │───▶│   Database   │───▶│   Deploy    │
│   Trigger  │    │   Type Check │    │   Test      │    │   Migrations │    │   (Railway) │
└────────────┘    └──────────────┘    └─────────────┘    └──────────────┘    └─────────────┘
                                                                    │
                                                                    ▼
                                                           ┌──────────────┐
                                                           │   Health    │
                                                           │   Check     │
                                                           └──────────────┘
```

**Stage 1: Lint & Type Check**
- ESLint validation
- TypeScript type checking
- NestJS-specific linting rules

**Stage 2: Build & Test**
- NestJS production build (`npm run build`)
- Unit tests (`npm run test`)
- Integration tests (`npm run test:e2e`)
- Test coverage reporting

**Stage 3: Database Migrations**
- Run TypeORM migrations against target database
- Migration rollback testing (on staging)
- Schema validation

**Stage 4: Deploy**
- Build Docker image (if using containerization)
- Deploy to Railway/Render/AWS
- Environment variable injection
- Zero-downtime deployment (blue-green or rolling)

**Stage 5: Health Check**
- API health endpoint verification
- Database connection check
- External service connectivity (Supabase, Gemini API)

---

## Platform-Specific Configurations

### Frontend: Vercel Configuration

#### Vercel Project Setup

1. **Connect Repository:**
   - Link GitHub/GitLab repository to Vercel project
   - Configure build settings automatically

2. **Build Configuration:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install",
     "framework": "nextjs",
     "nodeVersion": "18.x"
   }
   ```

3. **Environment Variables (per environment):**
   ```env
   NEXT_PUBLIC_API_URL=https://api-staging.minershub.com
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   NODE_ENV=production
   ```

4. **Deployment Settings:**
   - **Production Branch:** `main`
   - **Preview Deployments:** Enabled for all PRs
   - **Auto-deploy:** Enabled
   - **Build Cache:** Enabled
   - **Analytics:** Enabled for performance monitoring

#### Vercel Deployment Workflow

```yaml
# Example GitHub Actions integration (optional, Vercel handles most)
name: Frontend CI/CD
on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Backend: Railway Configuration

#### Railway Project Setup

1. **Connect Repository:**
   - Link GitHub/GitLab repository to Railway project
   - Configure service settings

2. **Service Configuration:**
   ```json
   {
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "npm run build"
     },
     "deploy": {
       "startCommand": "npm run start:prod",
       "healthcheckPath": "/api/health",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

3. **Environment Variables:**
   ```env
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_KEY=xxx
   JWT_SECRET=xxx
   JWT_REFRESH_SECRET=xxx
   GEMINI_API_KEY=xxx
   ```

4. **Deployment Settings:**
   - **Auto-deploy:** Enabled from Git
   - **Branch:** `main` for production, `staging` for staging
   - **Health Checks:** Enabled
   - **Restart Policy:** Restart on failure

#### Railway Deployment Workflow

Railway automatically deploys on Git push. For custom CI/CD:

```yaml
# .github/workflows/backend-deploy.yml
name: Backend CI/CD
on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test
      - run: npm run test:e2e

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE_ID_STAGING }}
          environment: staging

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE_ID_PROD }}
          environment: production
```

### Alternative: Render Configuration

If using Render instead of Railway:

```yaml
# render.yaml
services:
  - type: web
    name: miners-hub-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: miners-hub-db
          property: connectionString
    healthCheckPath: /api/health
    autoDeploy: true
```

---

## Database Migration Strategy

### TypeORM Migration Workflow

#### Development Workflow

```bash
# 1. Generate migration from entity changes
npm run migration:generate -- -n MigrationName

# 2. Review generated migration file
# Review migrations/TIMESTAMP-MigrationName.ts

# 3. Test migration locally
npm run migration:run

# 4. Test rollback
npm run migration:revert
```

#### CI/CD Migration Process

**Staging Environment:**
```yaml
# Run migrations before deployment
- name: Run Database Migrations
  run: |
    npm run migration:run
  env:
    DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
```

**Production Environment:**
```yaml
# Run migrations with rollback safety
- name: Run Database Migrations (Production)
  run: |
    # Backup database before migration
    npm run migration:run -- --backup
    # Verify migration success
    npm run migration:verify
  env:
    DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
```

#### Migration Safety Rules

1. **Backward Compatibility:** Migrations must be backward-compatible when possible
2. **Rollback Plan:** Every migration must have a rollback strategy
3. **Testing:** Test migrations on staging before production
4. **Timing:** Run migrations during low-traffic windows (if possible)
5. **Monitoring:** Monitor application health after migration

### Supabase Migration Integration

```typescript
// Example migration script integration
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/**/*.ts'],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    return AppDataSource.runMigrations();
  })
  .then(() => {
    console.log('Migrations completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

---

## Environment Management

### Environment Variable Strategy

#### Frontend Environment Variables

**Development (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
NODE_ENV=development
```

**Staging (Vercel Environment Variables):**
```env
NEXT_PUBLIC_API_URL=https://api-staging.minershub.com
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
NODE_ENV=production
```

**Production (Vercel Environment Variables):**
```env
NEXT_PUBLIC_API_URL=https://api.minershub.com
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
NODE_ENV=production
```

#### Backend Environment Variables

**Development (.env):**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/minershub_dev
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_SERVICE_KEY=dev-service-key
JWT_SECRET=dev-jwt-secret
JWT_REFRESH_SECRET=dev-refresh-secret
GEMINI_API_KEY=dev-gemini-key
```

**Staging (Railway Environment Variables):**
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://...staging-db...
SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_SERVICE_KEY=staging-service-key
JWT_SECRET=staging-jwt-secret
JWT_REFRESH_SECRET=staging-refresh-secret
GEMINI_API_KEY=staging-gemini-key
```

**Production (Railway Environment Variables):**
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://...production-db...
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_KEY=prod-service-key
JWT_SECRET=prod-jwt-secret
JWT_REFRESH_SECRET=prod-refresh-secret
GEMINI_API_KEY=prod-gemini-key
```

### Secrets Management

**Best Practices:**
1. **Never commit secrets** to Git repositories
2. **Use platform-native secrets** (Vercel, Railway, Supabase)
3. **Rotate secrets regularly** (quarterly recommended)
4. **Separate secrets per environment** (dev, staging, prod)
5. **Audit secret access** (who has access, when accessed)

**Secret Rotation Process:**
1. Generate new secret
2. Update in deployment platform (non-destructive)
3. Verify application health
4. Remove old secret after verification period (7 days)

---

## Testing Strategy in CI/CD

### Frontend Testing

```yaml
# Frontend test pipeline
- name: Lint
  run: npm run lint

- name: Type Check
  run: npx tsc --noEmit

- name: Unit Tests
  run: npm run test
  # Coverage threshold: 70%

- name: E2E Tests
  run: npm run test:e2e
  env:
    NEXT_PUBLIC_API_URL: ${{ secrets.TEST_API_URL }}
```

### Backend Testing

```yaml
# Backend test pipeline
- name: Lint
  run: npm run lint

- name: Type Check
  run: npx tsc --noEmit

- name: Unit Tests
  run: npm run test
  # Coverage threshold: 80%

- name: Integration Tests
  run: npm run test:integration
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

- name: E2E Tests
  run: npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
    SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
```

### Test Coverage Requirements

- **Frontend:** Minimum 70% code coverage
- **Backend:** Minimum 80% code coverage
- **Critical Paths:** 100% coverage (auth, payments, contracts)

---

## Deployment Strategies

### Frontend Deployment (Vercel)

**Strategy:** Automatic deployments with preview branches

1. **Production Deployment:**
   - Trigger: Push to `main` branch
   - Process: Build → Deploy → Health check
   - Rollback: One-click rollback in Vercel dashboard

2. **Preview Deployment:**
   - Trigger: Pull request opened
   - Process: Build → Deploy to preview URL
   - Purpose: Review changes before merge

3. **Branch Deployment:**
   - Trigger: Push to `staging` or `develop`
   - Process: Build → Deploy to environment-specific URL

### Backend Deployment (Railway/Render)

**Strategy:** Blue-Green Deployment (zero-downtime)

1. **Pre-Deployment:**
   - Run database migrations
   - Run health checks on current deployment
   - Create deployment snapshot

2. **Deployment:**
   - Build new version
   - Deploy to new instance (green)
   - Run health checks on new instance
   - Switch traffic from old (blue) to new (green)

3. **Post-Deployment:**
   - Monitor error rates
   - Monitor response times
   - Verify critical endpoints

4. **Rollback:**
   - If issues detected, switch traffic back to blue
   - Investigate and fix issues
   - Redeploy after fixes

### Database Migration Deployment

**Strategy:** Safe migration with rollback capability

1. **Pre-Migration:**
   - Backup database (Supabase automatic + manual snapshot)
   - Review migration impact
   - Schedule during low-traffic window (if possible)

2. **Migration:**
   - Run migration in transaction (if possible)
   - Verify migration success
   - Check application health

3. **Post-Migration:**
   - Monitor application logs
   - Verify data integrity
   - Run smoke tests

4. **Rollback Plan:**
   - Keep rollback migration ready
   - Test rollback on staging first
   - Execute rollback if critical issues detected

---

## Monitoring and Observability

### Health Checks

#### Frontend Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
```

#### Backend Health Check

```typescript
// src/common/health/health.controller.ts
@Controller('api/health')
export class HealthController {
  @Get()
  async health() {
    // Check database connection
    const dbStatus = await this.checkDatabase();
    
    // Check external services
    const supabaseStatus = await this.checkSupabase();
    const geminiStatus = await this.checkGemini();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        supabase: supabaseStatus,
        gemini: geminiStatus,
      },
    };
  }
}
```

### Monitoring Tools

1. **Application Performance Monitoring (APM):**
   - **Vercel Analytics:** Built-in for frontend
   - **Railway Metrics:** Built-in for backend
   - **Optional:** Sentry for error tracking

2. **Uptime Monitoring:**
   - **UptimeRobot** or **Pingdom:** External health checks
   - **Frequency:** Every 1-5 minutes
   - **Alerts:** Email/SMS/Slack on downtime

3. **Logging:**
   - **Frontend:** Vercel Logs
   - **Backend:** Railway Logs or centralized logging (Datadog, LogRocket)
   - **Audit Logs:** Stored in Supabase `audit_logs` table

### Alerting Strategy

**Critical Alerts:**
- Application downtime (> 1 minute)
- Database connection failures
- API error rate > 5%
- Response time > 2 seconds (p95)

**Warning Alerts:**
- High error rate (> 1%)
- Slow response times (> 1 second p95)
- High memory/CPU usage (> 80%)

**Notification Channels:**
- **Slack:** Team channel for all alerts
- **Email:** Critical alerts to on-call engineer
- **SMS:** P0 critical alerts (optional)

---

## Rollback Procedures

### Frontend Rollback (Vercel)

1. **Automatic Rollback:**
   - Vercel detects deployment failure
   - Automatically reverts to previous deployment

2. **Manual Rollback:**
   - Navigate to Vercel dashboard
   - Select deployment → "Promote to Production"
   - Verify rollback success

### Backend Rollback (Railway/Render)

1. **Quick Rollback:**
   - Navigate to deployment history
   - Select previous successful deployment
   - Redeploy previous version

2. **Database Rollback:**
   - If migration caused issues:
     - Run rollback migration: `npm run migration:revert`
     - Verify database state
     - Redeploy previous backend version

### Rollback Decision Matrix

| Issue Type | Rollback Action | Time Limit |
|------------|----------------|------------|
| Application crash | Immediate rollback | < 5 minutes |
| High error rate (> 10%) | Immediate rollback | < 10 minutes |
| Data corruption | Immediate rollback + DB restore | < 15 minutes |
| Performance degradation | Monitor + decision | < 30 minutes |
| Minor UI issues | Hot fix deployment | Next release |

---

## Security Considerations

### Deployment Security

1. **Secrets Management:**
   - Never commit secrets to Git
   - Use platform-native secret management
   - Rotate secrets regularly
   - Audit secret access

2. **Access Control:**
   - Limit deployment permissions to authorized team members
   - Use two-factor authentication (2FA) for all deployment platforms
   - Audit deployment activities

3. **Secure Connections:**
   - HTTPS enforced for all deployments
   - TLS 1.2+ for all API connections
   - Secure database connections (SSL)

4. **Code Security:**
   - Dependency vulnerability scanning (npm audit, Snyk)
   - Static code analysis (ESLint security rules)
   - Container scanning (if using Docker)

### Compliance & Audit

1. **Deployment Audit Trail:**
   - All deployments logged with:
     - Who deployed
     - When deployed
     - What was deployed (commit SHA)
     - Deployment outcome

2. **Change Management:**
   - All production deployments require PR approval
   - Deployment windows documented
   - Change requests tracked

3. **Data Protection:**
   - Database backups before production deployments
   - PII handling compliance (GDPR-aligned)
   - Audit logs immutable

---

## Performance Optimization

### Frontend Optimization

1. **Build Optimization:**
   - Next.js automatic optimizations
   - Image optimization
   - Code splitting
   - Tree shaking

2. **Caching Strategy:**
   - Static assets: Long-term caching
   - API responses: Short-term caching (5 minutes)
   - CDN edge caching (Vercel Edge Network)

### Backend Optimization

1. **Build Optimization:**
   - Production builds only
   - Minification enabled
   - Source maps for debugging (separate from production)

2. **Runtime Optimization:**
   - Connection pooling
   - Query optimization
   - Response caching (Redis, optional)

---

## Disaster Recovery

### Backup Strategy

1. **Database Backups:**
   - **Supabase:** Automatic daily backups + point-in-time recovery
   - **Manual Backups:** Before major migrations
   - **Retention:** 30 days (Supabase default)

2. **Code Backups:**
   - **Git Repository:** Primary backup (GitHub/GitLab)
   - **Build Artifacts:** Stored in deployment platform

3. **Configuration Backups:**
   - **Environment Variables:** Documented in secure vault
   - **Infrastructure as Code:** Version controlled (if applicable)

### Recovery Procedures

1. **Database Recovery:**
   - Restore from Supabase backup
   - Point-in-time recovery if needed
   - Verify data integrity

2. **Application Recovery:**
   - Redeploy from Git repository
   - Restore environment variables
   - Verify application functionality

3. **Communication:**
   - Notify stakeholders of recovery status
   - Document incident and recovery steps
   - Post-mortem review

---

## Cost Optimization

### Deployment Costs

**Frontend (Vercel):**
- **Hobby Plan:** Free for personal projects
- **Pro Plan:** $20/month for production use
- **Enterprise:** Custom pricing

**Backend (Railway):**
- **Starter Plan:** $5/month per service
- **Pro Plan:** $20/month per service
- **Pay-as-you-go:** For variable usage

**Database (Supabase):**
- **Free Tier:** Development/testing
- **Pro Plan:** $25/month for production
- **Team Plan:** $599/month for scaling

### Cost Optimization Tips

1. **Right-sizing:** Use appropriate plan tiers
2. **Monitoring:** Track usage and costs
3. **Optimization:** Reduce unnecessary deployments
4. **Caching:** Reduce API calls and database queries

---

## Implementation Checklist

### Initial Setup

- [ ] Create Vercel project for frontend
- [ ] Create Railway/Render project for backend
- [ ] Configure Supabase projects (dev, staging, prod)
- [ ] Set up GitHub/GitLab repositories
- [ ] Configure environment variables
- [ ] Set up CI/CD pipelines
- [ ] Configure health checks
- [ ] Set up monitoring and alerting
- [ ] Document deployment procedures
- [ ] Train team on deployment process

### Ongoing Maintenance

- [ ] Review and update deployment procedures quarterly
- [ ] Rotate secrets quarterly
- [ ] Review and optimize costs monthly
- [ ] Update documentation as needed
- [ ] Conduct disaster recovery drills annually

---

## Next Steps

1. **Choose Deployment Platforms:** Finalize Vercel + Railway/Render
2. **Set Up CI/CD Pipelines:** Implement GitHub Actions workflows
3. **Configure Environments:** Set up dev, staging, production
4. **Set Up Monitoring:** Configure health checks and alerting
5. **Document Runbooks:** Create detailed deployment and rollback procedures
6. **Team Training:** Train team on deployment processes

---

## References

- [Architecture Document](./architecture.md)
- [Security Architecture](./security-architecture.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Deployment](https://docs.nestjs.com/techniques/performance)

---

_This deployment and CI/CD strategy document provides a comprehensive guide for deploying and maintaining Miners Hub across all environments._

