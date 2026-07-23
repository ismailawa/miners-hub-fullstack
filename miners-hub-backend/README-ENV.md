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
PASSWORD_RESET_OTP_SECRET=your-password-reset-otp-secret-change-in-production

# Password reset OTPs are logged by the backend in development until a
# transactional email provider is connected.

# AI Integration (Google Gemini)
# Will be configured in Story 7.2
GEMINI_API_KEY=your-gemini-api-key-here

# SignNow Integration
# Use a neutral service account for SIGNNOW_API_KEY. The account that owns/uploads
# SignNow documents cannot also be one of the investor/miner signers.
SIGNNOW_API_KEY=your-signnow-service-account-token
SIGNNOW_OWNER_EMAIL=signnow-service-account@example.com
SIGNNOW_WEBHOOK_SECRET=your-signnow-webhook-secret

# Payment Gateway
# Flutterwave is the active supported gateway today. PAYMENT_GATEWAY is the
# extension point for future providers.
PAYMENT_GATEWAY=flutterwave
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key
FLUTTERWAVE_WEBHOOK_HASH=your-flutterwave-webhook-hash
FLUTTERWAVE_MOCK_MODE=false
PLATFORM_COMMISSION_PERCENT=5
PLATFORM_COMMISSION_BANK_CODE=your-bank-code
PLATFORM_COMMISSION_ACCOUNT_NUMBER=your-account-number

# MetaMap KYC Integration
# METAMAP_API_BASE_URL defaults to https://api.getmati.com when omitted.
METAMAP_CLIENT_ID=your-metamap-client-id
METAMAP_CLIENT_SECRET=your-metamap-client-secret
METAMAP_API_BASE_URL=https://api.getmati.com

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
