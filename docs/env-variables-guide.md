# Environment Variables Guide

This guide explains all environment variables needed for Miners Hub across different environments.

## Frontend Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.minershub.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NODE_ENV` | Node environment | `development` or `production` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics service ID | `GA-XXXXX` |

### Note on `NEXT_PUBLIC_` Prefix

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and should never contain secrets. Only include non-sensitive configuration values.

## Backend Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Node environment | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for file/document uploads | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `1234567890` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `cloudinary-secret` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | `your-super-secret-refresh-key` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `https://minershub.com,https://staging.minershub.com` |
| `LOG_LEVEL` | Logging level | `debug`, `info`, `warn`, `error` |
| `RATE_LIMIT_TTL` | Rate limit time window (seconds) | `60` |
| `RATE_LIMIT_MAX` | Rate limit max requests | `100` |

## Environment-Specific Configurations

### Development

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
NODE_ENV=development
```

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/minershub_dev
CLOUDINARY_CLOUD_NAME=dev-cloud-name
CLOUDINARY_API_KEY=dev-cloudinary-key
CLOUDINARY_API_SECRET=dev-cloudinary-secret
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
GEMINI_API_KEY=dev-gemini-key
```

### Staging

**Frontend (Vercel Environment Variables):**
```env
NEXT_PUBLIC_API_URL=https://api-staging.minershub.com
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
NODE_ENV=production
```

**Backend (Railway Environment Variables):**
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://...staging-db-connection...
CLOUDINARY_CLOUD_NAME=staging-cloud-name
CLOUDINARY_API_KEY=staging-cloudinary-key
CLOUDINARY_API_SECRET=staging-cloudinary-secret
JWT_SECRET=staging-jwt-secret
JWT_REFRESH_SECRET=staging-refresh-secret
GEMINI_API_KEY=staging-gemini-key
```

### Production

**Frontend (Vercel Environment Variables):**
```env
NEXT_PUBLIC_API_URL=https://api.minershub.com
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
NODE_ENV=production
```

**Backend (Railway Environment Variables):**
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://...production-db-connection...
CLOUDINARY_CLOUD_NAME=prod-cloud-name
CLOUDINARY_API_KEY=prod-cloudinary-key
CLOUDINARY_API_SECRET=prod-cloudinary-secret
JWT_SECRET=prod-jwt-secret-strong-random
JWT_REFRESH_SECRET=prod-refresh-secret-strong-random
GEMINI_API_KEY=prod-gemini-key
```

## Security Best Practices

1. **Never commit secrets** to Git repositories
2. **Use strong random values** for JWT secrets (minimum 32 characters)
3. **Rotate secrets regularly** (quarterly recommended)
4. **Use different secrets** for each environment
5. **Limit access** to production secrets
6. **Use platform-native secret management** (Vercel, Railway, Supabase)

## Generating Secrets

### JWT Secrets

```bash
# Generate a secure random secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Connection String

Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

Example:
```
postgresql://postgres:yourpassword@db.xxx.supabase.co:5432/postgres
```

## Getting Cloudinary Keys

1. Navigate to your Cloudinary dashboard
2. Go to Settings → API Keys
3. Copy:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API key** → `CLOUDINARY_API_KEY`
   - **API secret** → `CLOUDINARY_API_SECRET` (backend only, keep secret!)

## Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key → `GEMINI_API_KEY`

## Setting Up Environment Variables

### Vercel (Frontend)

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add variables for each environment (Production, Preview, Development)
4. Redeploy after adding variables

### Railway (Backend)

1. Go to your Railway project dashboard
2. Select your service
3. Navigate to Variables tab
4. Add environment variables
5. Service will automatically redeploy

### Local Development

1. Copy `.env.example` to `.env.local` (frontend) or `.env` (backend)
2. Fill in your values
3. Restart your development server

## Verification

After setting up environment variables, verify they're loaded correctly:

**Frontend:**
```typescript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

**Backend:**
```typescript
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
```

## Troubleshooting

### Variables not loading

1. **Frontend:** Ensure `NEXT_PUBLIC_` prefix is used for browser-accessible variables
2. **Restart:** Restart development server after changing `.env` files
3. **Platform:** Ensure variables are set in deployment platform (Vercel/Railway)
4. **Redeploy:** Redeploy application after adding variables in platform

### Secrets exposed

1. **Immediately rotate** the exposed secret
2. **Review Git history** to ensure secret wasn't committed
3. **Update all environments** with new secret value
4. **Audit access logs** if available

---

_This guide should be kept up-to-date as new environment variables are added._
