# Environment Variables Setup

This document describes the environment variables required for the Miners Hub backend.

## Required Environment Variables

Create a `.env` file in the root of the backend directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (Supabase PostgreSQL)
# Connection string format: postgresql://user:password@host:port/database
# Get this from Supabase Dashboard > Settings > Database > Connection string > URI
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Cloudinary Upload Configuration
# Used for KYC documents, listing attachments, and onboarding file uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT Configuration
# Will be configured in Story 2.1 (Authentication)
JWT_SECRET=your-jwt-secret-key-here-change-in-production
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-here-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# AI Integration (Google Gemini)
# Will be configured in Story 7.2
GEMINI_API_KEY=your-gemini-api-key-here

# CORS Configuration
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Local Development Setup

For local development, create a `.env` file with:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Database and other configuration will be added in subsequent stories.

## See Also

- [Environment Variables Guide](../../docs/env-variables-guide.md) - Comprehensive guide for all environment variables
