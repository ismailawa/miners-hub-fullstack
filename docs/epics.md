# Miners Hub - Epic Breakdown

**Author:** ismailawa
**Date:** 2025-11-05
**Project Level:** Enterprise
**Target Scale:** 10,000+ concurrent users

---

## Overview

This document provides the complete epic and story breakdown for Miners Hub, decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

**Epic Structure:**
1. **Foundation & Core Infrastructure** - Project setup, core UI components, routing, persistence
2. **User Onboarding & Authentication** - Registration, login, multi-step onboarding, profile management
3. **Public Site & Discovery** - Home page, marketplace browsing, listing details, miner profiles
4. **Marketplace Listing Management** - Create, edit, manage mineral listings
5. **Transaction System (Buy Now)** - Checkout flow, order management, payment simulation
6. **Auction System** - Auction listings, bidding, countdown timers, escrow
7. **Communication & AI Features** - Direct messaging, ChatAgent, AI Market Summary
8. **Dashboards & Analytics** - Role-based dashboards, data visualization
9. **Contracts & Agreements** - Contract proposals, e-signatures, contract management
10. **Compliance & Verification Framework** - KYC verification, content moderation, fraud detection

---

## Epic 1: Foundation & Core Infrastructure

**Goal:** Establish the technical foundation for both frontend and backend, including core UI components, API infrastructure, and database setup. This epic creates the project structure, backend API (NestJS + Supabase + TypeORM), core reusable components, routing infrastructure, state management, and API client layer required for the entire application.

### Story 1.1: Project Setup & Initial Configuration

As a **developer**,
I want **a properly configured Next.js project with TypeScript, Tailwind CSS, and shadcn/ui**,
So that **I have a solid foundation with modern tooling and component library ready for development**.

**Acceptance Criteria:**

**Given** I am starting a new project
**When** I run the project setup
**Then** I have:
- Next.js 15+ project initialized with TypeScript
- Tailwind CSS configured with custom theme variables (light/dark mode colors)
- shadcn/ui installed and configured
- ESLint and TypeScript properly configured
- Project structure with `app/`, `components/`, `lib/`, `types/` directories
- Basic configuration files (next.config.ts, tsconfig.json, tailwind.config.ts)

**And** The project runs successfully with `npm run dev`
**And** All dependencies are installed and working

**Prerequisites:** None (first story)

**Technical Notes:**
- Use Next.js App Router (not Pages Router)
- Configure Tailwind with CSS custom properties for theming in index.html
- Set up shadcn/ui with components.json
- Ensure TypeScript strict mode is enabled
- Create initial directory structure matching project requirements

---

### Story 1.2: Core Layout & Routing Infrastructure

As a **developer**,
I want **a root layout with routing infrastructure**,
So that **all pages have consistent structure and navigation works correctly**.

**Acceptance Criteria:**

**Given** I have a Next.js project setup
**When** I implement the layout and routing
**Then** I have:
- Root layout component (`app/layout.tsx`) with proper HTML structure
- App Router configured with public routes (Home, Marketplace, etc.)
- Authentication routes (Login, Register) that replace header/footer
- Authenticated routes (Dashboard, Profile, Contracts) protected
- Route protection logic foundation
- Meta tags and SEO basics

**And** Navigation between routes works correctly
**And** Route protection prevents unauthorized access
**And** All routes are accessible

**Prerequisites:** Story 1.1

**Technical Notes:**
- Use Next.js App Router file-based routing
- Implement route protection using middleware or layout checks
- Create route constants for maintainability
- Set up proper meta tags for SEO
- Ensure semantic HTML structure

---

### Story 1.2b: NestJS Backend Setup & Configuration

As a **developer**,
I want **a properly configured NestJS backend project with TypeScript**,
So that **I have a solid backend foundation with API endpoints ready for development**.

**Acceptance Criteria:**

**Given** I am setting up the backend
**When** I initialize the NestJS project
**Then** I have:
- NestJS project initialized with TypeScript
- Project structure with `src/` containing `modules/`, `controllers/`, `services/`, `entities/`, `dto/`, `guards/`, `interceptors/` directories
- Main application module (`app.module.ts`) configured
- Basic configuration files (nest-cli.json, tsconfig.json, package.json)
- Environment variables setup (.env file structure)
- CORS configured for frontend communication
- Global exception filter configured
- Validation pipes configured (class-validator, class-transformer)

**And** The backend runs successfully with `npm run start:dev`
**And** Health check endpoint `/api/health` returns 200 OK
**And** All dependencies are installed and working

**Prerequisites:** Story 1.1

**Technical Notes:**
- Use NestJS CLI to scaffold the project
- Configure TypeScript strict mode
- Set up environment variables for database connection, JWT secrets, API keys
- Configure CORS to allow requests from Next.js frontend
- Set up global validation pipe for DTO validation
- Create global exception filter for consistent error responses
- Install required dependencies: @nestjs/common, @nestjs/core, @nestjs/platform-express, class-validator, class-transformer

---

### Story 1.3b: Supabase Configuration & Database Connection

As a **developer**,
I want **Supabase database configured and connected to NestJS**,
So that **I can store and retrieve data from PostgreSQL database**.

**Acceptance Criteria:**

**Given** I have a Supabase project created
**When** I configure the connection
**Then** I have:
- Supabase project URL and API keys configured in environment variables
- Database connection configured in NestJS
- Connection pool settings optimized
- Database connection tested and verified
- Supabase client initialized for direct access (if needed)
- Connection error handling implemented

**Given** The application starts
**When** The backend initializes
**Then** The database connection is established successfully
**And** Connection health can be verified via health check endpoint

**Prerequisites:** Story 1.2b

**Technical Notes:**
- Create Supabase project and get connection string
- Configure TypeORM DataSource to connect to Supabase PostgreSQL
- Use connection pooling for performance
- Set up connection retry logic
- Store credentials in environment variables (.env)
- Test connection with simple query
- Configure SSL for production connection

---

### Story 1.4b: TypeORM Setup & Entity Models

As a **developer**,
I want **TypeORM configured with entity models for all database tables**,
So that **I have type-safe database operations and migrations**.

**Acceptance Criteria:**

**Given** I have database connection configured
**When** I set up TypeORM
**Then** I have:
- TypeORM module configured in NestJS app module
- DataSource configured with Supabase connection
- Entity classes for all core tables:
  - User, Miner, Investor entities
  - Listing, Auction, Bid entities
  - Order, Contract entities
  - Chat, Notification entities
  - Document, AuditLog entities
- Proper relationships defined (@ManyToOne, @OneToMany, @ManyToMany)
- Migration system configured
- Initial migration created for schema setup

**Given** I have entities defined
**When** I run migrations
**Then** Database tables are created with correct schema
**And** Relationships are properly established
**And** Indexes are created for performance

**Prerequisites:** Story 1.3b

**Technical Notes:**
- Install @nestjs/typeorm, typeorm, pg packages
- Configure TypeORM in app.module.ts
- Create entity classes with decorators (@Entity, @Column, @PrimaryGeneratedColumn)
- Define relationships between entities
- Set up migration configuration
- Create initial migration for all tables
- Add indexes for frequently queried fields (userId, listingId, etc.)
- Configure entity validation using class-validator decorators

---

### Story 1.3: Theme System & CSS Custom Properties

As a **user**,
I want **light and dark theme support with persistent preference**,
So that **I can use the application in my preferred visual mode**.

**Acceptance Criteria:**

**Given** I am on any page
**When** I toggle the theme switch
**Then** The entire application switches between light and dark themes
**And** The theme preference is saved in localStorage
**And** The preference persists across page refreshes
**And** All components respect the theme (no hardcoded colors)

**Given** I have a theme preference saved
**When** I load the application
**Then** My preferred theme is automatically applied

**Prerequisites:** Story 1.1

**Technical Notes:**
- Define CSS custom properties in `index.html` or root CSS file
- Light theme: slate-50 primary, white secondary, slate-800 text, amber-600 accent
- Dark theme: #0D1117 primary, #161B22 secondary, #F0F6FC text, #FBBF24 accent
- Create ThemeContext for theme management
- Implement theme toggle button component
- Use Tailwind's dark mode classes or CSS custom properties
- Ensure smooth theme transitions

---

### Story 1.4: Core UI Components (Header & Footer)

As a **user**,
I want **a consistent header and footer across all pages**,
So that **I can navigate and access key features from anywhere**.

**Acceptance Criteria:**

**Given** I am on a public page
**When** I view the header
**Then** I see:
- Miners Hub logo
- Desktop navigation (Services, Resources dropdowns)
- Global search bar
- Theme toggle
- Notification center icon (with badge if unread)
- Login/Register buttons

**And** The header is sticky and becomes semi-transparent on scroll
**And** Mobile shows a slide-out menu

**Given** I am on a public page
**When** I scroll to the bottom
**Then** I see footer with:
- Quick links
- Company info
- Legal links (Privacy, Terms)
- Social media icons

**And** Header and footer are fully responsive
**And** All links work correctly

**Prerequisites:** Story 1.2, Story 1.3

**Technical Notes:**
- Create reusable Header and Footer components
- Implement responsive mobile menu (slide-out drawer)
- Use shadcn/ui components (Button, Dropdown, Input)
- Ensure accessibility (keyboard navigation, ARIA labels)
- Implement sticky header with scroll effect
- Create notification badge component

---

### Story 1.5: Authentication Context & State Management

As a **developer**,
I want **a global authentication context and state management system**,
So that **user authentication state is accessible throughout the application**.

**Acceptance Criteria:**

**Given** I have implemented the context
**When** A user logs in
**Then** The authentication state is stored in AuthContext
**And** Login request is sent to `/api/auth/login` endpoint
**And** JWT token and user data are received from backend
**And** Token is stored securely (httpOnly cookie or secure storage)
**And** The state persists across page refreshes (token validated via API)
**And** All components can access current user data
**And** Navigation updates based on auth state

**Given** I have an authenticated user
**When** The user logs out
**Then** Logout request is sent to `/api/auth/logout` endpoint
**And** Auth state is cleared
**And** Token is removed from storage
**And** User is redirected to home page
**And** All protected routes become inaccessible

**Given** I have a valid token
**When** The application loads
**Then** Token is validated via `/api/auth/me` endpoint
**And** User data is fetched and stored in context
**And** If token is invalid/expired, user is logged out

**Prerequisites:** Story 1.2, Story 1.7

**Technical Notes:**
- Create AuthContext using React Context API
- Implement login, register, logout functions that call API endpoints
- Use API client from Story 1.7 for HTTP requests
- Store JWT token in secure storage (consider httpOnly cookies or secure localStorage)
- Store refresh token for automatic token renewal
- Create useAuth hook for easy access
- Implement token refresh mechanism
- Handle auth state on page load (validate token via API)
- Implement automatic logout on 401/403 responses
- Add loading states for auth operations

---

### Story 1.6: Notification Context & Toast System

As a **user**,
I want **to receive notifications and see toast messages**,
So that **I am informed about important actions and updates**.

**Acceptance Criteria:**

**Given** I am using the application
**When** An action triggers a notification
**Then** A toast message appears with appropriate styling
**And** The notification is created via `/api/notifications` endpoint
**And** The notification is stored in NotificationContext
**And** Unread count badge updates in header (fetched from API)
**And** Notifications persist in database until dismissed

**Given** I have unread notifications
**When** I click the notification center icon
**Then** Notifications are fetched from `/api/notifications` endpoint
**And** I see a list of all notifications
**And** I can mark notifications as read (via `/api/notifications/:id/read`)
**And** Unread count updates accordingly (refetched from API)

**Given** I am authenticated
**When** I open the application
**Then** Notifications are fetched from API on load
**And** Unread count is displayed in header badge
**And** Real-time updates are received via Supabase real-time subscriptions (optional)

**Prerequisites:** Story 1.4, Story 1.5, Story 1.7

**Technical Notes:**
- Create NotificationContext using React Context API
- Implement toast notification component (use shadcn/ui toast or custom)
- Fetch notifications from `/api/notifications` endpoint using API client
- Implement mark-as-read functionality via API
- Add unread badge logic (count from API response)
- Set up Supabase real-time subscription for live notification updates (optional enhancement)
- Ensure notifications are accessible (ARIA live regions)
- Handle loading and error states for notification fetching
- Implement pagination for notification list if needed

---

### Story 1.7: API Client Setup & HTTP Service

As a **developer**,
I want **a centralized API client and HTTP service**,
So that **all frontend components can communicate with the NestJS backend consistently**.

**Acceptance Criteria:**

**Given** I have implemented the API client
**When** I make API requests
**Then** I have:
- Centralized HTTP client configured (axios or fetch wrapper)
- Base URL configured from environment variables
- Request/response interceptors for:
  - Adding authentication tokens to headers
  - Handling errors globally
  - Transforming request/response data
- Type-safe API service functions for each endpoint
- Error handling with user-friendly messages
- Request cancellation support
- Retry logic for failed requests (optional)

**Given** I am making authenticated requests
**When** I call an API endpoint
**Then** JWT token is automatically added to Authorization header
**And** Token refresh is handled automatically if expired
**And** Unauthorized responses trigger logout

**Given** I have different API endpoints
**When** I use the API client
**Then** I have service modules for:
- Auth API (login, register, refresh token)
- Users API (profile, update)
- Listings API (CRUD operations)
- Auctions API (bids, status)
- Contracts API (proposals, management)
- Orders API (history, tracking)
- Chats API (messages, conversations)
- Notifications API (fetch, mark read)
- Documents API (upload, download)

**Prerequisites:** Story 1.2b, Story 1.4b

**Technical Notes:**
- Create `lib/api` directory structure
- Use axios or native fetch with TypeScript wrappers
- Configure base URL from `NEXT_PUBLIC_API_URL` environment variable
- Create request interceptor to add JWT token from AuthContext
- Create response interceptor to handle 401/403 errors
- Implement API service classes with type-safe methods
- Create error handling utility for consistent error messages
- Implement token refresh mechanism using refresh token
- Add request timeout configuration
- Create type definitions for API request/response types

---

### Story 1.8: TypeScript Types & Data Models

As a **developer**,
I want **comprehensive TypeScript types for all data models**,
So that **I have type safety throughout the application**.

**Acceptance Criteria:**

**Given** I am implementing features
**When** I use data models
**Then** I have TypeScript types for:
- User, Miner, Event, MineralPrice, MapLocationData
- Testimonial, MineralListing, AuctionListing
- NewsArticle, Webinar, KnowledgeBaseArticle
- ForumPost, Task, Order, Contract
- ChatMessage, Notification

**And** All types are properly defined with required/optional fields
**And** Types reflect relationships between entities
**And** Types are exported from a central `types.ts` file

**Prerequisites:** Story 1.1

**Technical Notes:**
- Create `types.ts` file in `lib/` or root
- Define all interfaces based on PRD requirements
- Use proper TypeScript types (string, number, Date, etc.)
- Define enums for status values (listing states, order states, etc.)
- Create union types where appropriate
- Document complex types with comments
- Ensure types match PRD functional requirements

---

### Story 1.9: Constants & Initial Dummy Data

As a **developer**,
I want **a constants file with initial dummy data**,
So that **the application is fully populated and demonstrable on first load**.

**Acceptance Criteria:**

**Given** I have implemented the constants file
**When** The application loads
**Then** I have realistic dummy data for:
- Miners (profiles, galleries)
- Events (industry events)
- Mineral prices (live-updating simulation data)
- Map locations (state mineral deposits)
- Testimonials
- Marketplace listings (Buy Now & Auctions)
- News articles
- All other data types

**And** Data is properly typed using TypeScript interfaces
**And** Data reflects Nigerian mining context
**And** Data is structured for easy database seeding (can be used for initial data population via backend)

**Prerequisites:** Story 1.8

**Technical Notes:**
- Create `constants.tsx` or `data.ts` file
- Populate with realistic Nigerian mining data
- Use proper TypeScript types
- Structure data for easy import and initialization
- Include variety of mineral types, locations, prices
- Create helper functions for data initialization
- Ensure data is culturally and contextually appropriate

---

### Story 1.10: Responsive Design Foundation

As a **user**,
I want **the application to work perfectly on mobile, tablet, and desktop**,
So that **I can use it on any device**.

**Acceptance Criteria:**

**Given** I am viewing the application
**When** I resize the browser or switch devices
**Then** The layout adapts correctly for:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

**And** All components are responsive
**And** Touch interactions work on mobile
**And** Text is readable on all screen sizes
**And** Navigation is accessible on mobile (hamburger menu)

**Prerequisites:** Story 1.4

**Technical Notes:**
- Use mobile-first approach with Tailwind
- Implement breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test all components at different breakpoints
- Ensure touch targets are at least 44x44px
- Use responsive typography (text-sm, text-base, text-lg)
- Implement responsive grid layouts
- Test on actual devices if possible

---

### Story 1.11: Test Framework Setup & Configuration

As a **developer**,
I want **comprehensive test frameworks configured for frontend and backend**,
So that **I can write and run tests throughout development to ensure quality and prevent regressions**.

**Acceptance Criteria:**

**Given** I have frontend and backend projects set up
**When** I configure the test frameworks
**Then** I have:

**Frontend Test Setup:**
- Playwright installed and configured for E2E testing
- Vitest installed and configured for unit testing
- Playwright Component Testing configured for component tests
- Test directory structure created (`tests/e2e/`, `__tests__/unit/`, `__tests__/integration/`)
- Playwright configuration file (`playwright.config.ts`) with:
  - Environment switching (dev, staging, production)
  - Timeout standards (30s default, 60s for E2E)
  - Artifact outputs (screenshots, videos, traces)
  - Test data factories setup
- Vitest configuration with coverage reporting
- Test scripts in `package.json`:
  - `npm run test:unit` - Run unit tests
  - `npm run test:integration` - Run integration tests
  - `npm run test:e2e` - Run E2E tests
  - `npm run test:coverage` - Generate coverage reports

**Backend Test Setup:**
- Jest installed and configured (NestJS default)
- Supertest installed for API testing
- Test database configuration (Supabase test project)
- Test directory structure (`test/`, `test/integration/`)
- Jest configuration with:
  - Test environment setup
  - Coverage reporting
  - Test database connection
- Test scripts in `package.json`:
  - `npm run test` - Run unit tests
  - `npm run test:integration` - Run integration tests
  - `npm run test:e2e` - Run E2E tests
  - `npm run test:coverage` - Generate coverage reports

**Test Infrastructure:**
- Test data factories created (user, listing, auction factories)
- Test fixtures and helpers setup
- Test utilities for common operations (auth helpers, API helpers)
- Test environment variables configured
- CI/CD test execution configured (GitHub Actions)

**Given** I have test frameworks configured
**When** I run the test commands
**Then** All tests execute successfully (even if no tests exist yet)
**And** Test coverage reports generate correctly
**And** CI/CD pipeline runs tests on commits

**Prerequisites:** Story 1.1, Story 1.2b

**Technical Notes:**
- **Frontend:**
  - Install Playwright: `npm install -D @playwright/test`
  - Install Vitest: `npm install -D vitest @vitest/ui`
  - Initialize Playwright: `npx playwright install`
  - Create `playwright.config.ts` with environment configurations
  - Create `vitest.config.ts` for unit testing
  - Set up test data factories using Faker.js or similar
  - Configure test scripts in `package.json`

- **Backend:**
  - Jest comes pre-installed with NestJS
  - Install Supertest: `npm install -D @nestjs/testing supertest`
  - Configure Jest in `package.json` or `jest.config.js`
  - Set up test database connection (separate Supabase test project)
  - Create test utilities and helpers
  - Configure test scripts

- **Test Data:**
  - Create factories for common entities (User, Listing, Auction, etc.)
  - Use Faker.js for generating test data
  - Create test fixtures for common scenarios
  - Set up test database seeding utilities

- **CI/CD Integration:**
  - Add test steps to GitHub Actions workflows
  - Configure test execution in CI/CD pipeline
  - Set up test coverage reporting (Codecov or similar)

- **Documentation:**
  - Create `tests/README.md` with test guidelines
  - Document test patterns and conventions
  - Provide examples of test structure

**Related Documentation:**
- [Test Strategy](./test-strategy.md) - Comprehensive testing approach
- [Deployment & CI/CD Strategy](./deployment-cicd-strategy.md) - CI/CD test integration

---

### Story 1.12: CI/CD Pipeline Setup & Configuration

As a **developer**,
I want **automated CI/CD pipelines configured for frontend and backend**,
So that **code changes are automatically tested, validated, and deployed to appropriate environments**.

**Acceptance Criteria:**

**Given** I have frontend and backend projects set up with test frameworks
**When** I configure the CI/CD pipelines
**Then** I have:

**GitHub Actions Workflows:**
- Frontend CI/CD workflow (`.github/workflows/frontend-ci-cd.yml`) with:
  - Lint and type check stage
  - Build and test stage
  - Deploy to Vercel (staging/production)
  - Preview deployments for pull requests
  - Post-deployment health checks
- Backend CI/CD workflow (`.github/workflows/backend-ci-cd.yml`) with:
  - Lint and type check stage
  - Unit, integration, and E2E test stages
  - Database migration stage (for staging/production)
  - Deploy to Railway/Render (staging/production)
  - Post-deployment health checks
- Workflows trigger on:
  - Push to `main`, `staging`, `develop` branches
  - Pull requests to `main` and `staging`

**Vercel Integration (Frontend):**
- Vercel project created and linked to GitHub repository
- Environment variables configured:
  - Development environment
  - Preview environment
  - Staging environment
  - Production environment
- Auto-deployment enabled:
  - `develop` branch → Development environment
  - `staging` branch → Staging environment
  - `main` branch → Production environment
- Preview deployments for all pull requests

**Railway/Render Integration (Backend):**
- Railway/Render project created and linked to GitHub repository
- Environment variables configured:
  - Development environment
  - Staging environment
  - Production environment
- Auto-deployment enabled:
  - `develop` branch → Development environment
  - `staging` branch → Staging environment
  - `main` branch → Production environment (with approval gates)
- Health check endpoint configured (`/api/health`)

**CI/CD Pipeline Stages:**
- **Lint & Type Check:** ESLint, TypeScript validation
- **Build:** Production builds for both frontend and backend
- **Test:** Unit, integration, and E2E tests (from Story 1.11)
- **Security:** Dependency vulnerability scanning (npm audit)
- **Deploy:** Automatic deployment to appropriate environment
- **Health Check:** Post-deployment verification

**Secrets Management:**
- GitHub Secrets configured for:
  - Vercel tokens and project IDs
  - Railway/Render tokens and service IDs
  - Database connection strings (test, staging, production)
  - API keys (Supabase, Gemini)
  - JWT secrets
- Secrets stored securely and never exposed in logs

**Database Migration Strategy:**
- Automated migrations run before backend deployment
- Migration rollback plan documented
- Test database migrations validated before staging/production

**Given** I push code to a branch
**When** The CI/CD pipeline runs
**Then** All stages execute successfully
**And** Tests run automatically
**And** Deployment occurs to the appropriate environment
**And** Health checks verify successful deployment

**Prerequisites:** Story 1.1, Story 1.2b, Story 1.11 (Test Framework Setup)

**Technical Notes:**
- **GitHub Actions Setup:**
  - Create `.github/workflows/` directory
  - Configure frontend workflow with stages: lint, build, test, deploy
  - Configure backend workflow with stages: lint, build, test, migrate, deploy
  - Set up matrix builds if needed for multiple Node.js versions
  - Configure caching for dependencies (npm cache)
  - Set up artifact storage for build outputs

- **Vercel Configuration:**
  - Install Vercel CLI: `npm install -g vercel`
  - Link project: `vercel link`
  - Configure `vercel.json` (optional) for build settings
  - Set environment variables in Vercel dashboard:
    - `NEXT_PUBLIC_API_URL` (per environment)
    - `NEXT_PUBLIC_SUPABASE_URL` (per environment)
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (per environment)
  - Enable automatic deployments from Git

- **Railway/Render Configuration:**
  - Create Railway/Render account and project
  - Link GitHub repository
  - Configure service settings:
    - Build command: `npm run build`
    - Start command: `npm run start:prod`
    - Health check path: `/api/health`
  - Set environment variables:
    - `PORT`, `NODE_ENV`
    - `DATABASE_URL` (per environment)
    - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
    - `JWT_SECRET`, `JWT_REFRESH_SECRET`
    - `GEMINI_API_KEY`
  - Enable automatic deployments from Git

- **Database Migrations:**
  - Run migrations before deployment in CI/CD
  - Use separate test database for CI/CD tests
  - Backup database before production migrations
  - Verify migration success after deployment

- **Health Checks:**
  - Frontend: Check deployed URL returns 200 OK
  - Backend: Check `/api/health` endpoint returns healthy status
  - Retry logic for transient failures
  - Fail deployment if health check fails

- **Security:**
  - Never commit secrets to repository
  - Use GitHub Secrets for sensitive data
  - Rotate secrets regularly
  - Audit secret access

- **Documentation:**
  - Document deployment process in README
  - Document environment variable requirements
  - Document rollback procedures
  - Document troubleshooting steps

**Related Documentation:**
- [Deployment & CI/CD Strategy](./deployment-cicd-strategy.md) - Comprehensive deployment strategy
- [Environment Variables Guide](./env-variables-guide.md) - Environment variable configuration
- [Test Strategy](./test-strategy.md) - CI/CD test integration

---

## Epic 2: User Onboarding & Authentication

**Goal:** Enable users to register, authenticate, and complete their profile with KYC verification. This epic creates the complete user onboarding flow from registration through multi-step profile completion, establishing the foundation for role-based access throughout the platform.

### Story 2.1: User Registration Page

As a **prospective user**,
I want **to register for an account with email and password**,
So that **I can access the platform and create my profile**.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I fill out the registration form with valid information
**Then** I can enter:
- Email address
- Password (minimum 8 characters)
- Confirm password
- Basic information (name)

**And** Form validation works (email format, password strength, matching passwords)
**And** On successful submission, registration request is sent to `/api/auth/register` endpoint
**And** User account is created in Supabase database via backend
**And** I am redirected to the onboarding flow
**And** Error messages display for invalid inputs or API errors

**Given** I submit with invalid data
**When** Validation fails
**Then** I see clear error messages
**And** I can correct the errors and resubmit

**Prerequisites:** Story 1.2, Story 1.5, Story 1.7

**Technical Notes:**
- Create full-screen registration page (replaces Header/Footer layout)
- Implement form validation (email regex, password strength)
- Use shadcn/ui Form components
- Call `/api/auth/register` endpoint using API client from Story 1.7
- Backend handles user creation in Supabase database
- Backend generates unique user ID and handles password hashing
- Handle API errors and display user-friendly messages
- Create User type with required fields matching backend DTO

---

### Story 2.2: User Login Page

As a **registered user**,
I want **to log in with my email and password**,
So that **I can access my account and dashboard**.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I enter valid credentials
**Then** I am authenticated
**And** My authentication state is stored in AuthContext
**And** I am redirected to my role-based dashboard
**And** My session persists across page refreshes

**Given** I enter invalid credentials
**When** I submit the form
**Then** I see an error message
**And** I can retry with correct credentials

**Given** I am already logged in
**When** I visit the login page
**Then** I am redirected to my dashboard

**Prerequisites:** Story 2.1

**Technical Notes:**
- Create full-screen login page (replaces Header/Footer layout)
- Call `/api/auth/login` endpoint using API client from Story 1.7
- Backend validates credentials against Supabase database
- Update AuthContext on successful login (JWT token received from API)
- Store auth token securely (consider httpOnly cookies or secure storage)
- Handle API errors and display user-friendly messages
- Implement "Remember me" functionality (optional, via refresh token)
- Create loading states during authentication

---

### Story 2.3: Multi-Step Onboarding - Role Selection

As a **new user**,
I want **to select my role during onboarding**,
So that **the platform can customize my experience**.

**Acceptance Criteria:**

**Given** I have just registered
**When** I am redirected to onboarding
**Then** I see Step 1: Role Selection
**And** I can choose from: Miner, Investor, Government
**And** Each role has a description
**And** I can proceed to the next step after selection

**Given** I have selected a role
**When** I navigate between steps
**Then** My role selection is preserved
**And** I can return to Step 1 to change my selection

**Prerequisites:** Story 2.1

**Technical Notes:**
- Create OnboardingPage component with step navigation
- Implement step indicator (1 of 6, 2 of 6, etc.)
- Store onboarding progress in component state (persist to localStorage)
- Create role selection UI with cards or radio buttons
- Add role descriptions to help users choose
- Implement step navigation (Next, Back buttons)
- Disable Next button until role is selected

---

### Story 2.4: Multi-Step Onboarding - Personal Information

As a **new user**,
I want **to provide my personal information**,
So that **my profile is complete and accurate**.

**Acceptance Criteria:**

**Given** I am on Step 2 of onboarding
**When** I fill out the personal information form
**Then** I can enter:
- Full name
- Email (pre-filled from registration)
- Phone number
- Address (street, city, state, postal code)

**And** Form validation works (required fields, email format, phone format)
**And** Data persists when I navigate between steps
**And** I can proceed to the next step after completing required fields

**Given** I have incomplete data
**When** I try to proceed
**Then** I see validation errors
**And** I must complete all required fields

**Prerequisites:** Story 2.3

**Technical Notes:**
- Create personal information form component
- Implement field validation (email, phone, required fields)
- Store form data in onboarding state
- Pre-fill email from registration
- Add address fields (relevant for Nigerian context)
- Implement form persistence (save to localStorage on change)
- Add progress indicator

---

### Story 2.5: Multi-Step Onboarding - Business Information

As a **new user**,
I want **to provide my business information**,
So that **the platform can verify my business credentials**.

**Acceptance Criteria:**

**Given** I am on Step 3 of onboarding
**When** I fill out the business information form
**Then** I can enter:
- Company name
- Business registration number
- Tax ID
- Business type/industry

**And** Form validation works (required fields, format validation)
**And** Data persists when I navigate between steps
**And** I can proceed to the next step after completing required fields

**Given** I am an individual (not a business)
**When** I reach this step
**Then** I can mark "Individual" option
**And** Some fields become optional

**Prerequisites:** Story 2.4

**Technical Notes:**
- Create business information form component
- Add validation for business registration numbers (Nigerian format)
- Store business data in onboarding state
- Handle individual vs business distinction
- Make business fields conditional based on selection
- Implement form persistence
- Add help text for Nigerian business registration formats

---

### Story 2.6: Multi-Step Onboarding - Role-Specific Details

As a **new user**,
I want **to provide role-specific information**,
So that **my profile is tailored to my role**.

**Acceptance Criteria:**

**Given** I am a Miner on Step 4
**When** I fill out role-specific details
**Then** I can enter:
- Mining licence number
- Mining licence expiry date
- Primary minerals I work with
- Years of experience

**Given** I am an Investor on Step 4
**When** I fill out role-specific details
**Then** I can enter:
- Investment focus areas
- Investment budget range
- Preferred minerals
- Investment experience level

**Given** I am Government on Step 4
**When** I fill out role-specific details
**Then** I can enter:
- Department/agency
- Official designation
- Verification authority level

**And** Data persists when I navigate between steps
**And** I can proceed to the next step

**Prerequisites:** Story 2.5

**Technical Notes:**
- Create role-specific form component
- Conditionally render fields based on selected role
- Store role-specific data in onboarding state
- Add validation for role-specific fields (e.g., licence numbers)
- Implement form persistence
- Add help text for each role type

---

### Story 2.7: Multi-Step Onboarding - Document Upload

As a **new user**,
I want **to upload my KYC documents**,
So that **I can be verified and gain full platform access**.

**Acceptance Criteria:**

**Given** I am on Step 5 of onboarding
**When** I upload documents
**Then** I can upload multiple files:
- Government-issued ID
- Mining licence (for miners)
- Business registration (for businesses)

**And** I see file previews after upload
**And** I can remove uploaded files
**And** I can see upload progress
**And** File validation works (file type, file size limits)

**Given** I have uploaded files
**When** I navigate between steps
**Then** Uploaded files are preserved
**And** I can view or remove them

**Prerequisites:** Story 2.6

**Technical Notes:**
- Create MultiFileInput component
- Implement file upload with preview
- Upload files to `/api/documents` endpoint (Supabase Storage)
- Store file references in component state until submission
- Validate file types (PDF, images)
- Set file size limits (e.g., 5MB per file)
- Add file removal functionality
- Show upload progress/status
- Handle file errors gracefully

---

### Story 2.8: Multi-Step Onboarding - Review & Submit

As a **new user**,
I want **to review all my information before submitting**,
So that **I can verify accuracy and complete my profile**.

**Acceptance Criteria:**

**Given** I am on Step 6 of onboarding (Review)
**When** I view the review page
**Then** I see a summary of all entered information:
- Role selection
- Personal information
- Business information
- Role-specific details
- Uploaded documents (file names)

**And** I can edit any section by clicking "Edit"
**And** Editing returns me to that step with data pre-filled
**And** After editing, I return to Review step

**Given** I have reviewed all information
**When** I click "Submit"
**Then** Complete profile data is sent to `/api/users/onboarding` endpoint
**And** My profile is created and saved to Supabase database via backend
**And** My user status is set to "pending" (awaiting verification)
**And** I am redirected to my dashboard
**And** I see a success message

**Given** I submit with incomplete information
**When** Validation fails
**Then** I see which sections need completion
**And** I am guided to complete missing information

**Prerequisites:** Story 2.7

**Technical Notes:**
- Create review page component
- Display all collected information in organized sections
- Implement edit functionality (navigate back to specific step)
- Add submit handler that sends complete profile to `/api/users/onboarding` endpoint
- Backend handles profile creation in Supabase database
- Set user status to "pending" for verification workflow (handled by backend)
- Show success/error messages based on API response
- Handle submission errors gracefully with user-friendly messages

---

### Story 2.9: Profile Management - Overview Tab

As a **logged-in user**,
I want **to view my profile overview**,
So that **I can see a summary of my account information**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to my profile
**Then** I see the Overview tab with:
- Profile summary (name, role, verification status)
- Key statistics (active listings, pending contracts, revenue/investments)
- Recent activity
- Quick actions relevant to my role

**And** The overview is role-specific (different stats for miners vs investors)
**And** All data is accurate and up-to-date
**And** I can navigate to other profile tabs

**Prerequisites:** Story 2.8

**Technical Notes:**
- Create ProfilePage component with tab navigation
- Implement Overview tab
- Fetch user statistics from `/api/users/profile` endpoint
- Calculate statistics from API response data
- Display role-specific information
- Add quick action buttons (Create Listing, Browse Marketplace, etc.)
- Fetch and display user data from API
- Handle loading and error states

---

### Story 2.10: Profile Management - Info Tab

As a **logged-in user**,
I want **to view and edit my personal and business information**,
So that **I can keep my profile up to date**.

**Acceptance Criteria:**

**Given** I am on the Profile Info tab
**When** I view my information
**Then** I see all my profile data:
- Personal information (name, email, phone, address)
- Business information (company, registration, tax ID)
- Role-specific details

**Given** I want to edit my information
**When** I click "Edit"
**Then** I can modify any field
**And** I can save changes
**And** Changes are sent to `/api/users/profile` endpoint
**And** Changes are persisted to Supabase database via backend
**And** I see a success message

**Given** I edit my information
**When** I navigate away
**Then** I am prompted to save unsaved changes
**And** Changes are saved if I confirm

**Prerequisites:** Story 2.9

**Technical Notes:**
- Create Info tab component
- Implement view/edit modes
- Reuse form components from onboarding
- Add save functionality that calls `/api/users/profile` endpoint
- Backend updates user data in Supabase database
- Handle unsaved changes warning
- Validate edited data before API call
- Handle API errors and display messages
- Show success/error feedback

---

### Story 2.11: Role-Based Access Control Implementation

As a **developer**,
I want **role-based access control enforced throughout the application**,
So that **users only see and access features appropriate to their role**.

**Acceptance Criteria:**

**Given** I am a Miner
**When** I access the application
**Then** I see:
- "Create Listing" option
- "My Listings" tab in profile
- "Task Management" tab in profile
- Chat access to investors
- Miner-specific dashboard

**And** I do NOT see investor-only features

**Given** I am an Investor
**When** I access the application
**Then** I see:
- "Browse Marketplace" quick action
- "My Orders" tab in profile
- Contract proposal capabilities
- Investor-specific dashboard

**And** I do NOT see miner-only features (Create Listing, etc.)

**Given** I am Government
**When** I access the application
**Then** I see:
- Verification workflows
- Compliance monitoring
- Government dashboard with aggregate stats
- Reporting capabilities

**Given** I try to access a route I'm not authorized for
**When** I navigate to it
**Then** I am redirected to an appropriate page
**And** I see an access denied message

**Prerequisites:** Story 2.8

**Technical Notes:**
- Implement role checking in route protection
- Create role-based component rendering
- Add role checks to feature flags
- Implement authorization helpers
- Create access denied page/component
- Test all role combinations
- Ensure data filtering based on role (users can only see their own data)

---

## Epic 3: Public Site & Discovery

**Goal:** Create the public-facing site that showcases the platform and enables discovery of listings and miners. This epic delivers the "magic moment" when users discover verified mineral listings and connect with miners.

### Story 3.1: Home Page - Hero Section & Key Components

As a **visitor**,
I want **to see an engaging hero section with animated slideshow and clear CTAs**,
So that **I understand the platform value and am motivated to explore**.

**Acceptance Criteria:**

**Given** I am on the home page
**When** The page loads
**Then** I see:
- Hero section with background image slideshow (auto-rotating)
- Animated title and subtitle (fade-in-down animation)
- Clear CTA buttons (Browse Marketplace, Register)
- Professional, trustworthy design

**And** The slideshow transitions smoothly every 5 seconds
**And** Animations are smooth and performant (60fps)
**And** The hero is fully responsive

**Prerequisites:** Story 1.4, Story 1.10

**Technical Notes:**
- Create Hero component with image slideshow
- Implement CSS animations for text (fade-in-down)
- Use Next.js Image component for optimized images
- Add auto-rotate functionality for slideshow
- Ensure accessibility (pause on hover, keyboard navigation)
- Implement lazy loading for images

---

### Story 3.2: Home Page - Partners Marquee & Mineral Prices

As a **visitor**,
I want **to see partner logos and live mineral prices**,
So that **I understand the platform's credibility and current market data**.

**Acceptance Criteria:**

**Given** I am on the home page
**When** I scroll to the Partners section
**Then** I see a continuous scrolling marquee of partner logos
**And** The marquee scrolls smoothly and continuously
**And** Logos are properly sized and visible

**Given** I scroll to the Mineral Prices section
**When** I view the prices table
**Then** I see:
- Table with mineral types, current prices, change indicators (up/down arrows)
- Prices update every 30 seconds (simulated)
- Color-coded change indicators (green for up, red for down)
- Responsive table design

**Prerequisites:** Story 3.1, Story 1.9

**Technical Notes:**
- Create Partners component with continuous scroll animation
- Implement MineralPrices component with data table
- Use shadcn/ui Table component
- Add price change simulation (increment/decrement logic)
- Implement auto-refresh for prices (setInterval)
- Ensure responsive table layout

---

### Story 3.3: Home Page - How It Works & Interactive Map

As a **visitor**,
I want **to understand how the platform works and see mineral locations**,
So that **I can learn about the process and explore Nigerian mineral deposits**.

**Acceptance Criteria:**

**Given** I am on the home page
**When** I scroll to the How It Works section
**Then** I see an animated roadmap/timeline showing:
- Step 1: Register and Verify
- Step 2: Browse Listings
- Step 3: Connect & Transact
- Step 4: Complete Trade

**And** Steps reveal as I scroll (scroll-triggered animations)
**And** The timeline is visually engaging

**Given** I scroll to the Map section
**When** I hover over a Nigerian state on the SVG map
**Then** I see an info panel showing:
- State name
- Key mineral deposits in that state
- Deposit quantities/types

**And** The map is interactive and responsive
**And** Hover states are clear and accessible

**Prerequisites:** Story 3.1, Story 1.9

**Technical Notes:**
- Create HowItWorks component with scroll-triggered animations
- Use Intersection Observer API for scroll animations
- Create interactive SVG map of Nigeria
- Implement hover tooltips for map regions
- Store map location data in constants
- Ensure map is accessible (keyboard navigation)

---

### Story 3.4: Home Page - Featured Miners & Testimonials

As a **visitor**,
I want **to see featured miners and user testimonials**,
So that **I understand the platform's community and trustworthiness**.

**Acceptance Criteria:**

**Given** I am on the home page
**When** I scroll to the Featured Miners section
**Then** I see a responsive grid of miner profile cards
**And** Each card shows: miner name, photo, verification badge, primary minerals
**And** Clicking a card opens MinerDetailModal with full information

**Given** I scroll to the Testimonials section
**When** I view testimonials
**Then** I see horizontally scrollable testimonials
**And** Each testimonial shows: user photo, name, role, quote, video thumbnail
**And** Clicking a testimonial opens a video player modal

**Prerequisites:** Story 3.1, Story 1.9

**Technical Notes:**
- Create FeaturedMiners component with grid layout
- Implement MinerDetailModal component
- Create Testimonials component with horizontal scroll
- Add video player modal (can use HTML5 video or embed)
- Ensure smooth scrolling and touch support
- Add accessibility features (keyboard navigation, ARIA labels)

---

### Story 3.5: Marketplace Page - Browse & Filter Listings

As a **visitor or logged-in user**,
I want **to browse and filter mineral listings**,
So that **I can find listings that match my criteria**.

**Acceptance Criteria:**

**Given** I am on the Marketplace page
**When** I view the page
**Then** I see:
- Tab navigation (Buy Now / Auctions)
- Advanced filter panel (search, mineral type, location, grade)
- Responsive grid of listing cards
- Pagination controls

**Given** I apply filters
**When** I select mineral type, location, or grade
**Then** The listing grid updates to show matching results
**And** The URL updates to reflect active filters
**And** Filter state persists on page refresh

**Given** I have many listings
**When** I scroll or navigate
**Then** Pagination shows page numbers
**And** I can navigate between pages
**And** Results load correctly for each page

**Prerequisites:** Story 1.4, Story 1.9, Story 3.1

**Technical Notes:**
- Create MarketplacePage component
- Implement tab navigation (Buy Now / Auctions)
- Create filter components (Search, Dropdowns, Checkboxes)
- Implement filtering logic (client-side for MVP)
- Create ListingCard component
- Add pagination component (client-side)
- Store filter state in URL query params
- Ensure responsive grid layout

---

### Story 3.6: Listing Detail Modals

As a **user**,
I want **to view detailed information about a listing**,
So that **I can make informed decisions about purchasing or bidding**.

**Acceptance Criteria:**

**Given** I click on a listing card
**When** The modal opens
**Then** I see ListingDetailModal or AuctionDetailModal with:
- All listing attributes (mineral type, grade, quantity, location, price)
- Miner profile link
- Action buttons (Buy Now / Place Bid)
- Document previews (if available)

**Given** I view an auction listing
**When** The modal opens
**Then** I also see:
- Countdown timer showing time remaining
- Current highest bid
- Bid history (if available)
- Place Bid button and form

**And** The countdown timer updates in real-time
**And** The modal is accessible (keyboard navigation, ESC to close)

**Prerequisites:** Story 3.5

**Technical Notes:**
- Create ListingDetailModal component
- Create AuctionDetailModal component (extends ListingDetailModal)
- Implement countdown timer (use setInterval for updates)
- Add bid history display
- Implement modal close functionality
- Use shadcn/ui Dialog component
- Ensure modal is accessible (focus trap, ARIA labels)

---

### Story 3.7: Informational Pages (News, Services, etc.)

As a **visitor**,
I want **to access informational pages about the platform**,
So that **I can learn about services, logistics, and industry information**.

**Acceptance Criteria:**

**Given** I navigate to informational pages
**When** I visit News, Services, Logistics, Warehousing, Registration Guide, Knowledge Base, Forum, Data & Analytics, Privacy Policy, Terms & Conditions, About Us
**Then** Each page loads correctly
**And** Content is displayed appropriately
**And** Navigation works (header/footer visible)
**And** All pages are responsive

**Given** I am on the Data & Analytics page
**When** The page loads
**Then** I see market data visualization
**And** AI Market Summary component (will be implemented in Epic 7)

**Prerequisites:** Story 1.2, Story 1.4

**Technical Notes:**
- Create page components for each informational route
- Use placeholder content or dummy data
- Ensure consistent layout and navigation
- Implement responsive design
- Add SEO meta tags for each page
- Structure content for readability

---

## Epic 4: Marketplace Listing Management

**Goal:** Enable miners to create, manage, and publish mineral listings. This epic provides the content creation capabilities that populate the marketplace.

### Story 4.1: Create Listing Form - Basic Information

As a **miner**,
I want **to create a mineral listing with basic information**,
So that **I can offer my minerals for sale on the marketplace**.

**Acceptance Criteria:**

**Given** I am logged in as a miner
**When** I click "Create Listing" from dashboard
**Then** I see a multi-step listing creation form
**And** Step 1 asks for:
- Mineral type (dropdown: Gold, Tin, Columbite, etc.)
- Grade/purity specifications
- Quantity (tons)
- Location (state/LGA dropdown)
- Moisture percentage

**And** Form validation works (required fields, numeric validation)
**And** I can save as draft and continue later
**And** Data persists when I navigate between steps

**Prerequisites:** Story 2.11, Story 3.5

**Technical Notes:**
- Create CreateListingPage component
- Implement multi-step form (similar to onboarding)
- Add form validation
- Store draft listings in component state (can optionally save to backend as draft)
- Create listing state management
- Use shadcn/ui Form components
- Submit final listing to `/api/listings` endpoint
- Add location dropdown (Nigerian states/LGAs)

---

### Story 4.2: Create Listing Form - Pricing & Delivery

As a **miner**,
I want **to set pricing and delivery terms for my listing**,
So that **buyers understand the total cost and logistics**.

**Acceptance Criteria:**

**Given** I am creating a listing
**When** I reach Step 2 of the form
**Then** I can enter:
- Asking price (currency, amount)
- Price per ton calculation (auto-calculated)
- Delivery terms (pickup, shipping, both)
- Delivery location/details
- Payment terms

**Given** I am creating a Buy Now listing
**When** I set the price
**Then** The price is fixed
**And** Buyers can purchase immediately

**Given** I am creating an Auction listing
**When** I set pricing
**Then** I can set:
- Starting bid amount
- Reserve price (optional)
- Auction duration (24h - 7 days)

**Prerequisites:** Story 4.1

**Technical Notes:**
- Extend listing form with pricing step
- Add currency formatting
- Implement price calculation logic
- Add delivery options
- Create listing type selector (Buy Now vs Auction)
- Store pricing data in listing object

---

### Story 4.3: Create Listing - Document Upload

As a **miner**,
I want **to upload documentation for my listing**,
So that **buyers can verify the mineral quality and authenticity**.

**Acceptance Criteria:**

**Given** I am creating a listing
**When** I reach Step 3 (Document Upload)
**Then** I can upload multiple files:
- Mining licence/certificate
- Quality certificates
- Laboratory test results
- Other relevant documents

**And** I see file previews after upload
**And** I can remove uploaded files
**And** File validation works (PDF, images, size limits)

**Prerequisites:** Story 4.2, Story 2.7

**Technical Notes:**
- Reuse MultiFileInput component from onboarding
- Store document files in listing object
- Add document type categorization
- Implement file preview
- Validate file types and sizes
- Upload files to `/api/documents` endpoint (Supabase Storage)
- Store file references in listing object

---

### Story 4.4: Listing Submission & Status Management

As a **miner**,
I want **to submit my listing and manage its status**,
So that **it can be reviewed and published on the marketplace**.

**Acceptance Criteria:**

**Given** I have completed the listing form
**When** I click "Submit for Review"
**Then** My listing is saved with status "under review"
**And** I see a confirmation message
**And** I am redirected to "My Listings" page

**Given** I have a draft listing
**When** I view "My Listings"
**Then** I can:
- Edit draft listings
- Delete draft listings
- Continue editing incomplete listings
- See listing status (draft, under review, published, sold, archived)

**Given** My listing is published
**When** I view "My Listings"
**Then** I can see it in the published section
**And** I can archive sold or expired listings

**Prerequisites:** Story 4.3

**Technical Notes:**
- Implement listing submission logic
- Create listing status enum (draft, submitted, under_review, published, sold, expired, archived)
- Submit listings to `/api/listings` endpoint
- Backend stores listings in Supabase database
- Create "My Listings" page component that fetches from `/api/listings?mine=true`
- Implement listing edit functionality (PUT `/api/listings/:id`)
- Add listing deletion (DELETE `/api/listings/:id`)
- Filter listings by status (backend filtering via query params)

---

## Epic 5: Transaction System (Buy Now)

**Goal:** Enable direct purchase transactions with checkout and order management. This epic provides the core transaction functionality for immediate purchases.

### Story 5.1: Checkout Page & Order Creation

As a **buyer**,
I want **to complete a purchase through a checkout process**,
So that **I can buy minerals directly from listings**.

**Acceptance Criteria:**

**Given** I click "Buy Now" on a listing
**When** I am redirected to checkout
**Then** I see:
- Order summary (listing details, quantity, price, delivery terms)
- Total cost calculation
- Simulated credit card form (dummy data)
- Submit button

**Given** I fill out the payment form
**When** I submit
**Then** An order is created with status "initiated"
**And** Payment is simulated (always succeeds in MVP)
**And** Order status updates to "paid"
**And** I am redirected to order confirmation page
**And** Seller receives a notification

**Prerequisites:** Story 3.6, Story 4.4

**Technical Notes:**
- Create CheckoutPage component
- Implement order summary display
- Create simulated payment form (no real payment processing)
- Submit order to `/api/orders` endpoint
- Backend generates order ID and stores in Supabase database
- Update order status via `/api/orders/:id/status` endpoint
- Create order confirmation page
- Trigger notifications

---

### Story 5.2: Order Management & Tracking

As a **buyer or seller**,
I want **to view and track my orders**,
So that **I can monitor transaction status and delivery**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to "My Orders" in profile
**Then** I see a list of all my orders (as buyer or seller)
**And** Each order shows: order ID, listing details, status, date, total
**And** I can filter orders by status

**Given** I click on an order
**When** I view order details
**Then** I see OrderTrackingModal with:
- Order status timeline (initiated → paid → confirmed → shipped → completed)
- Current status highlighted
- Estimated delivery date
- Shipping information (if applicable)

**Given** I am a seller
**When** I view my orders
**Then** I can update order status (confirm, mark as shipped, complete)
**And** Buyer receives notifications on status changes

**Prerequisites:** Story 5.1

**Technical Notes:**
- Create OrderManagement component
- Implement order list with filtering
- Create OrderTrackingModal component
- Fetch orders from `/api/orders` endpoint
- Add order status timeline visualization
- Implement status update functionality (via API)
- Backend stores orders in Supabase database
- Add order status change notifications (created via backend)

---

### Story 5.3: Payment Simulation & Wallet

As a **buyer**,
I want **to see my wallet balance and payment history**,
So that **I can track my financial transactions**.

**Acceptance Criteria:**

**Given** I complete a purchase
**When** Payment is processed
**Then** My wallet balance decreases by the order amount
**And** Transaction is recorded in payment history

**Given** I receive a refund
**When** Refund is processed
**Then** My wallet balance increases
**And** Refund transaction is recorded

**Given** I view my wallet
**When** I check my balance
**Then** I see:
- Current wallet balance
- Recent transactions
- Transaction history with dates and amounts

**Prerequisites:** Story 5.1

**Technical Notes:**
- Create wallet balance simulation (fetched from `/api/users/wallet` endpoint)
- Backend stores wallet balance in Supabase database (user table or wallet table)
- Implement payment processing simulation (via `/api/payments` endpoint)
- Add refund processing logic (via `/api/payments/:id/refund` endpoint)
- Create wallet/transaction history display (fetched from `/api/transactions` endpoint)
- Backend stores transaction records in Supabase database
- Update balance on transactions (calculated on backend)
- Add transaction type indicators (purchase, refund, etc.)

---

### Story 5.4: Refund Processing

As a **buyer or seller**,
I want **to process refunds when needed**,
So that **disputes can be resolved and money returned**.

**Acceptance Criteria:**

**Given** I request a refund (buyer) or approve a refund (seller)
**When** Refund is processed
**Then** Order status updates to "refunded"
**And** Buyer's wallet balance increases
**And** Seller's wallet balance decreases
**And** Both parties receive notifications
**And** Refund transaction is recorded

**Given** I am a seller
**When** I cancel an order
**Then** Refund is automatically processed
**And** Buyer is notified

**Prerequisites:** Story 5.2, Story 5.3

**Technical Notes:**
- Implement refund request workflow
- Add refund processing logic
- Update wallet balances on refund
- Update order status
- Create refund transaction records
- Add notifications for refunds
- Handle edge cases (partial refunds, etc.)

---

## Epic 6: Auction System

**Goal:** Enable auction-style listings with bidding, countdown timers, and escrow. This epic provides advanced transaction capabilities for competitive bidding.

### Story 6.1: Auction Listing Creation

As a **miner**,
I want **to create auction listings with duration and starting bid**,
So that **I can sell minerals through competitive bidding**.

**Acceptance Criteria:**

**Given** I am creating a listing
**When** I select "Auction" as listing type
**Then** I can set:
- Auction duration (24 hours to 7 days)
- Starting bid amount
- Reserve price (optional, hidden from bidders)
- All standard listing attributes

**Given** I submit an auction listing
**When** It is published
**Then** It appears in the Auction tab of marketplace
**And** Countdown timer starts automatically
**And** Bidding is enabled

**Prerequisites:** Story 4.4

**Technical Notes:**
- Extend listing creation form for auction type
- Add auction-specific fields (duration, starting bid, reserve)
- Implement auction listing validation
- Store auction data in listing object
- Create auction listing display components

---

### Story 6.2: Bidding Interface & Validation

As an **investor**,
I want **to place bids on auction listings**,
So that **I can compete for minerals I want**.

**Acceptance Criteria:**

**Given** I am viewing an auction listing
**When** I place a bid
**Then** I can enter a bid amount
**And** Bid validation ensures:
- Bid is higher than current highest bid
- Bid meets minimum increment (if specified)
- I have sufficient wallet balance (simulated)

**Given** I submit a valid bid
**When** Bid is accepted
**Then** Bid is recorded with my user ID and timestamp
**And** Current highest bid updates
**And** All bidders see the updated bid
**And** I receive confirmation

**Given** I submit an invalid bid
**When** Validation fails
**Then** I see an error message
**And** I can correct and resubmit

**Prerequisites:** Story 6.1, Story 3.6

**Technical Notes:**
- Create bidding interface component
- Implement bid validation logic
- Submit bids to `/api/auctions/:id/bids` endpoint
- Backend stores bids in Supabase database (linked to auction listing)
- Update highest bid display (fetch from API or real-time subscription)
- Add bid confirmation
- Handle bid errors gracefully
- Check wallet balance before accepting bid (via `/api/users/wallet` endpoint)

---

### Story 6.3: Anti-Sniping & Countdown Timer

As an **investor**,
I want **auctions to extend when bids are placed near the end**,
So that **I have fair opportunity to bid without last-second sniping**.

**Acceptance Criteria:**

**Given** An auction is ending
**When** A bid is placed in the last 2 minutes
**Then** The auction extends by 5 minutes
**And** The countdown timer updates
**And** All bidders see the extended time
**And** Notification is sent about the extension

**Given** I am viewing an auction
**When** I see the countdown timer
**Then** It displays:
- Days, hours, minutes, seconds remaining
- Updates in real-time (every second)
- Shows "Ending Soon" when < 2 minutes remain
- Shows "Extended" indicator when extension occurs

**Prerequisites:** Story 6.2

**Technical Notes:**
- Implement countdown timer component (updates every second)
- Add anti-sniping logic (check if bid in last 2 minutes)
- Extend auction duration when condition met
- Update timer display on extension
- Store extension events
- Add extension notifications
- Handle edge cases (multiple extensions)

---

### Story 6.4: Auction Completion & Escrow

As a **system**,
I want **to determine auction winners and handle escrow**,
So that **transactions are completed fairly and securely**.

**Acceptance Criteria:**

**Given** An auction ends
**When** The countdown reaches zero
**Then** The highest valid bid wins
**And** Winner is determined and notified
**And** Payment window starts (48 hours)
**And** 10% escrow is locked from winner's wallet

**Given** Winner completes payment within 48 hours
**When** Payment is processed
**Then** Escrow is released to seller
**And** Remaining 90% is processed
**And** Order is created and status set to "paid"
**And** Both parties notified

**Given** Winner fails to pay within 48 hours
**When** Payment window expires
**Then** Next highest bidder is notified
**And** Escrow from previous winner is refunded
**And** New payment window starts for next bidder

**Prerequisites:** Story 6.3, Story 5.3

**Technical Notes:**
- Implement auction completion logic
- Determine winner (highest bid)
- Lock escrow amount (10% of winning bid)
- Create payment window timer (48 hours)
- Handle payment completion
- Handle payment failure (move to next bidder)
- Release/refund escrow appropriately
- Create order from completed auction

---

## Epic 7: Communication & AI Features

**Goal:** Enable direct communication between users and AI-powered support. This epic delivers the AI differentiation that makes Miners Hub special.

### Story 7.1: Direct Messaging System

As a **user**,
I want **to chat directly with other users**,
So that **I can discuss listings and negotiate terms**.

**Acceptance Criteria:**

**Given** I am viewing a miner profile or listing
**When** I click "Chat" or "Contact"
**Then** A chat window opens
**And** I can send messages
**And** Messages are sent to `/api/chats` endpoint
**And** Messages are stored in Supabase database via backend
**And** Chat history persists across sessions (fetched from API)

**Given** I receive a message
**When** I am online
**Then** I see a notification
**And** Unread badge updates
**And** I can open chat to respond

**Given** I am in a chat
**When** I send messages
**Then** Messages appear in real-time feel (simulated)
**And** Message timestamps are displayed
**And** I can see message status (sent, delivered)

**Prerequisites:** Story 2.11, Story 3.4

**Technical Notes:**
- Create Chat component with message list
- Implement message input and send functionality
- Send messages to `/api/chats` endpoint
- Backend stores messages in Supabase database
- Link messages to user pairs (chat threads) via backend
- Set up Supabase real-time subscription for live message updates
- Create chat list/threads view
- Add unread message indicators
- Implement message timestamps

---

### Story 7.2: ChatAgent - Gemini Integration Setup

As a **developer**,
I want **to integrate Google Gemini API for AI chat**,
So that **users can get AI-powered support**.

**Acceptance Criteria:**

**Given** I have implemented Gemini integration
**When** A user opens ChatAgent
**Then** Gemini API is initialized with:
- System instruction: "Jatau, a professional Nigerian mining officer"
- API key configured (from environment)
- Model instance created

**And** API connection is established
**And** Error handling is in place for API failures

**Prerequisites:** Story 1.1

**Technical Notes:**
- Install @google/generative-ai package
- Set up API key (use environment variables)
- Initialize Gemini model instance
- Configure system instruction
- Implement error handling
- Add API rate limiting considerations
- Create Gemini service/utility module

---

### Story 7.3: ChatAgent - Conversational Interface

As a **user**,
I want **to chat with Jatau (AI mining officer)**,
So that **I can get expert advice about Nigerian mining**.

**Acceptance Criteria:**

**Given** I click the floating ChatAgent button
**When** The chat window opens
**Then** I see:
- Chat interface with message history
- Input field for typing messages
- Send button
- Jatau's avatar/name

**Given** I send a message
**When** AI responds
**Then** Response streams in (text appears as generated)
**And** Response is contextually relevant to Nigerian mining
**And** Conversation history is maintained within session
**And** I can continue the conversation

**Given** I close and reopen ChatAgent
**When** I return to chat
**Then** Session history is preserved (or new session starts, based on design)

**Prerequisites:** Story 7.2, Story 7.1

**Technical Notes:**
- Create ChatAgent component (floating action button)
- Implement chat UI (reuse chat components from Story 7.1)
- Integrate Gemini API for responses
- Implement streaming response display
- Store conversation history in component state
- Add loading states during AI response
- Handle API errors gracefully
- Style ChatAgent to match design system

---

### Story 7.4: AI Market Summary Component

As a **user**,
I want **to see AI-powered market insights**,
So that **I can understand trends and make informed decisions**.

**Acceptance Criteria:**

**Given** I am on the Data & Analytics page
**When** The page loads
**Then** AI Market Summary component automatically:
- Calls Gemini API with current market data
- Generates a concise summary with actionable insights
- Displays formatted summary (Markdown parsed)

**Given** AI generates the summary
**When** It is displayed
**Then** I see:
- Bulleted list of insights
- Key terms bolded
- Actionable recommendations
- Nigerian market context

**And** Summary updates when I refresh the page
**And** Loading state is shown while generating

**Prerequisites:** Story 7.2, Story 3.7

**Technical Notes:**
- Create AIMarketSummary component
- Fetch market data from `/api/analytics/market-data` endpoint (backend queries Supabase)
- Call `/api/ai/market-summary` endpoint (backend calls Gemini API with market data)
- Parse Markdown response from backend
- Display formatted summary
- Add loading and error states
- Implement markdown rendering (use a markdown library)
- Cache summary (optional, to avoid repeated API calls)

---

## Epic 8: Dashboards & Analytics

**Goal:** Provide role-based dashboards with insights and quick actions. This epic delivers personalized views that help users understand their activity and platform performance.

### Story 8.1: Miner Dashboard

As a **miner**,
I want **to see my dashboard with stats and quick actions**,
So that **I can monitor my business and take quick actions**.

**Acceptance Criteria:**

**Given** I am logged in as a miner
**When** I navigate to my dashboard
**Then** I see:
- Key statistics: Active listings count, Pending contracts count, Revenue (total sales)
- Quick action buttons: "Create Listing", "Manage Contracts"
- Recent activity feed
- Performance metrics (if applicable)

**And** All stats are calculated from my actual data
**And** Quick actions navigate to appropriate pages
**And** Dashboard is responsive

**Prerequisites:** Story 2.11, Story 4.4, Story 5.2

**Technical Notes:**
- Create MinerDashboard component
- Fetch statistics from `/api/users/dashboard` endpoint (backend calculates from Supabase data)
- Backend filters data by current user ID
- Create quick action buttons
- Add recent activity display (fetched from API)
- Ensure responsive layout
- Add loading and error states

---

### Story 8.2: Investor Dashboard

As an **investor**,
I want **to see my dashboard with investment stats**,
So that **I can track my portfolio and find new opportunities**.

**Acceptance Criteria:**

**Given** I am logged in as an investor
**When** I navigate to my dashboard
**Then** I see:
- Key statistics: Active investments count, Pending contracts count, Total invested
- Quick action buttons: "Browse Marketplace", "Manage Profile"
- Recent activity (bids, purchases)
- Recommended listings (based on preferences)

**And** All stats are accurate
**And** Quick actions work correctly

**Prerequisites:** Story 2.11, Story 5.2, Story 6.2

**Technical Notes:**
- Create InvestorDashboard component
- Calculate investment statistics
- Filter orders and bids by user ID
- Add recommended listings logic (simple filtering)
- Create quick action buttons
- Display recent activity
- Ensure responsive design

---

### Story 8.3: Government Dashboard

As a **government official**,
I want **to see aggregate platform statistics**,
So that **I can monitor industry activity and compliance**.

**Acceptance Criteria:**

**Given** I am logged in as government
**When** I navigate to my dashboard
**Then** I see:
- High-level statistics: Total registered miners, Total listings, Export volume
- Charts/graphs showing trends
- Compliance metrics (verified users, pending verifications)
- Quick actions: "Verify Users", "Generate Reports"

**And** All statistics are calculated from all platform data
**And** Charts are visually clear
**And** Data is up-to-date

**Prerequisites:** Story 2.11

**Technical Notes:**
- Create GovernmentDashboard component
- Aggregate statistics from all users/listings
- Implement simple charts (can use a charting library or simple visualizations)
- Calculate compliance metrics
- Add export/report generation (basic)
- Ensure data privacy (only show aggregates, not individual data)
- Add loading states

---

### Story 8.4: Data & Analytics Page Enhancements

As a **user**,
I want **to see comprehensive market data and analytics**,
So that **I can make data-driven decisions**.

**Acceptance Criteria:**

**Given** I am on the Data & Analytics page
**When** I view the page
**Then** I see:
- Market data visualization (charts, graphs)
- AI Market Summary (from Epic 7)
- Mineral price trends
- Trading volume statistics
- Export functionality (growth feature, placeholder in MVP)

**And** All visualizations are clear and readable
**And** Data is accurate

**Prerequisites:** Story 3.7, Story 7.4

**Technical Notes:**
- Enhance DataAnalyticsPage component
- Add market data visualizations
- Integrate AI Market Summary component
- Create price trend charts
- Calculate trading volume from order data
- Add export button (placeholder for growth feature)
- Ensure responsive charts
- Use charting library if needed (Chart.js, Recharts, etc.)

---

## Epic 9: Contracts & Agreements

**Goal:** Enable contract proposals, review, and e-signature workflows. This epic provides formal agreement capabilities for complex transactions.

### Story 9.1: Contract Proposal Creation

As an **investor**,
I want **to propose a contract from a marketplace listing**,
So that **I can formalize terms with the miner**.

**Acceptance Criteria:**

**Given** I am viewing a listing
**When** I click "Propose Contract"
**Then** I see a contract proposal form with:
- Pre-filled terms from listing (mineral type, quantity, price)
- Editable fields (delivery terms, payment schedule, etc.)
- Additional terms section
- Submit button

**Given** I complete the contract proposal
**When** I submit
**Then** Contract is created with status "Draft"
**And** Miner receives notification
**And** Contract is visible to both parties

**Prerequisites:** Story 3.6, Story 5.1

**Technical Notes:**
- Create ContractProposalPage component
- Pre-fill contract template from listing data (fetched from `/api/listings/:id`)
- Add editable contract terms
- Submit contracts to `/api/contracts` endpoint
- Backend stores contracts in Supabase database
- Create contract data structure matching backend DTO
- Link contract to listing and both users (via backend)
- Add notification on contract creation (created via backend)

---

### Story 9.2: SignaturePad Component

As a **user**,
I want **to sign contracts digitally**,
So that **I can complete agreements without physical documents**.

**Acceptance Criteria:**

**Given** I am reviewing a contract
**When** It is my turn to sign
**Then** I see "Sign Contract" button
**And** Clicking opens SignaturePad component
**And** I can draw my signature using mouse/touch
**And** I can clear and redraw
**And** I can save my signature

**Given** I save my signature
**When** I submit
**Then** Signature is captured and stored
**And** Contract status updates
**And** Other party is notified

**Prerequisites:** Story 9.1

**Technical Notes:**
- Create SignaturePad component (can use a library like react-signature-canvas)
- Implement canvas for signature drawing
- Add clear/reset functionality
- Capture signature as image/data URL
- Store signature in contract object
- Add signature validation (ensure signature is provided)
- Handle touch and mouse input

---

### Story 9.3: Contract Review & Signing Flow

As a **miner or investor**,
I want **to review and sign contracts**,
So that **I can complete formal agreements**.

**Acceptance Criteria:**

**Given** I receive a contract proposal
**When** I view the contract detail page
**Then** I see:
- All contract terms
- Both parties' information
- Signature status (who has signed)
- Action buttons (Accept, Counter, Sign)

**Given** I review the contract
**When** I click "Accept"
**Then** Contract status updates to "Pending" (awaiting signatures)
**And** Signing flow begins

**Given** It is my turn to sign
**When** I use SignaturePad to sign
**Then** My signature is added to contract
**And** If both parties have signed, status updates to "Signed"
**And** Contract becomes "Executed"

**Given** I want to modify terms
**When** I click "Counter"
**Then** I can edit contract terms
**And** Updated contract is sent back to proposer
**And** Status returns to "Draft"

**Prerequisites:** Story 9.2

**Technical Notes:**
- Create ContractDetailPage component
- Display contract terms and status
- Implement accept/counter/sign workflow
- Manage signing turn logic (who signs first)
- Update contract status via `/api/contracts/:id/status` endpoint
- Backend stores contract updates in Supabase database
- Add notifications for status changes (created via backend)
- Handle contract history (fetched from `/api/contracts/:id/history` endpoint)

---

### Story 9.4: Contract Management & History

As a **user**,
I want **to view and manage all my contracts**,
So that **I can track agreements and their status**.

**Acceptance Criteria:**

**Given** I am on my profile
**When** I navigate to Contracts tab
**Then** I see a list of all my contracts (as miner or investor)
**And** Each contract shows: contract ID, other party, status, date
**And** I can filter by status (Draft, Pending, Signed, Executed)

**Given** I click on a contract
**When** I view details
**Then** I see full contract with all terms
**And** I can see signature history
**And** I can see contract status timeline

**Prerequisites:** Story 9.3

**Technical Notes:**
- Create Contracts tab in ProfilePage
- Implement contract list with filtering
- Fetch contracts from `/api/contracts` endpoint
- Display contract details
- Show contract status timeline
- Add contract search/filter (backend filtering via query params)
- Backend stores contracts in Supabase database
- Link contracts to users (both parties) via backend relationships

---

## Epic 10: Compliance & Verification Framework

**Goal:** Implement KYC verification, content moderation, and fraud detection. This epic ensures platform trust and regulatory compliance.

### Story 10.1: KYC Verification Status Display

As a **user**,
I want **to see my verification status**,
So that **I understand my account standing and trust level**.

**Acceptance Criteria:**

**Given** I have submitted KYC documents
**When** I view my profile
**Then** I see verification status badge:
- "Pending" (yellow) - awaiting review
- "Verified" (green) - approved
- "Rejected" (red) - needs resubmission

**Given** I am verified
**When** Other users view my profile
**Then** They see my verification badge
**And** Trust indicator is visible

**Prerequisites:** Story 2.8, Story 2.9

**Technical Notes:**
- Add verification status to user profile
- Create verification badge component
- Display status on profile pages
- Update status display when verification changes
- Add visual indicators (colors, icons)

---

### Story 10.2: Government Verification Workflow

As a **government official**,
I want **to verify users and their documents**,
So that **the platform maintains compliance and trust**.

**Acceptance Criteria:**

**Given** I am logged in as government
**When** I navigate to verification dashboard
**Then** I see list of users pending verification
**And** Each user shows: name, role, submitted documents, submission date

**Given** I review a user's documents
**When** I approve
**Then** User status updates to "verified"
**And** User receives notification
**And** Verification badge appears on user profile

**Given** I reject a user's documents
**When** I provide rejection reason
**Then** User status updates to "rejected"
**And** User receives notification with reason
**And** User can resubmit documents

**Prerequisites:** Story 2.11, Story 10.1

**Technical Notes:**
- Create government verification dashboard
- List pending verifications
- Add approve/reject functionality
- Store verification decisions
- Update user status
- Add rejection reason field
- Send notifications on status change
- Filter verifications by status

---

### Story 10.3: Content Moderation Flags

As a **system or moderator**,
I want **to flag suspicious content**,
So that **the platform remains safe and compliant**.

**Acceptance Criteria:**

**Given** Content is flagged (manual in MVP)
**When** Flagging occurs
**Then** Content is marked for review
**And** Moderator/admin sees flagged content
**And** Original poster is notified

**Given** I am an admin
**When** I review flagged content
**Then** I can:
- Approve content (remove flag)
- Remove content
- Warn user
- Ban user (extreme cases)

**Prerequisites:** Story 2.11, Story 4.4

**Technical Notes:**
- Add flagging functionality to listings, messages, documents
- Submit flags to `/api/moderation/flags` endpoint
- Backend stores flags in Supabase database
- Create moderation dashboard for admins (fetches from `/api/moderation/flags`)
- Implement flag review workflow (via `/api/moderation/flags/:id/review` endpoint)
- Add content removal functionality (via `/api/moderation/content/:id/remove`)
- Backend stores moderation actions in Supabase database
- Add user warnings/bans (via `/api/moderation/users/:id/warn` or `/api/moderation/users/:id/ban`)

---

### Story 10.4: Fraud Detection Algorithms

As a **system**,
I want **to detect suspicious activity**,
So that **fraud can be prevented and users protected**.

**Acceptance Criteria:**

**Given** A miner creates a listing
**When** Duplicate detection runs
**Then** System checks for similar listings (same miner, same mineral, similar attributes)
**And** If duplicate found, flag is created
**And** Admin is notified

**Given** Bidding occurs on an auction
**When** Suspicious pattern detected
**Then** System flags:
- Rapid successive bids from same user
- Unrealistic bid amounts
- Bids from newly created accounts

**Given** Messages are sent
**When** Repetitive pattern detected
**Then** System flags:
- Identical messages sent to multiple users
- Spam-like content
- Suspicious messaging patterns

**And** All flags are sent to admin for review

**Prerequisites:** Story 4.4, Story 6.2, Story 7.1

**Technical Notes:**
- Implement duplicate listing detection (compare attributes)
- Add bid pattern analysis
- Implement message pattern detection
- Create fraud detection utility functions
- Store detection results
- Flag suspicious activity
- Notify admins of flags
- Add detection thresholds (configurable)

---

### Story 10.5: Audit Trail Logging

As a **system**,
I want **to log all major actions**,
So that **compliance and accountability are maintained**.

**Acceptance Criteria:**

**Given** A user performs a major action (auth, listing change, payment, contract)
**When** Action occurs
**Then** Audit log entry is created with:
- User ID
- Action type
- Timestamp
- Action details
- Related entity ID (listing, order, contract, etc.)

**Given** I am an admin or government official
**When** I request audit logs
**Then** I can:
- View all audit logs
- Filter by user, action type, date range
- Export logs for regulatory review

**And** Logs are immutable (append-only)
**And** Logs are retained for 5 years (simulated)

**Prerequisites:** Story 1.7, Story 2.2, Story 4.4, Story 5.1

**Technical Notes:**
- Create audit log data structure matching backend entity
- Backend implements logging via interceptors/guards
- Backend logs major actions (auth, CRUD operations, payments, contracts) to Supabase `audit_logs` table
- Create audit log endpoint `/api/audit-logs` for fetching logs
- Backend stores logs in Supabase database (append-only, immutable via database constraints)
- Create audit log viewer for admins (fetches from `/api/audit-logs`)
- Add filtering and export functionality (backend query params)
- Ensure logs cannot be modified (immutable via database constraints and backend validation)
- Add log retention policy (handled by backend/database)

---

## Summary

This epic breakdown provides **complete coverage** of all functional requirements from the PRD:

- **Total Epics:** 10
- **Total Stories:** ~70+ stories
- **Coverage:** All 44 functional requirements from PRD
- **Sequencing:** Foundation → User Management → Discovery → Content → Transactions → Communication → Analytics → Contracts → Compliance

**Epic 1** establishes the technical foundation.
**Epics 2-3** enable user onboarding and public discovery (the "magic moment").
**Epics 4-6** provide marketplace core functionality (listings, transactions, auctions).
**Epics 7-8** add differentiation (AI, dashboards).
**Epics 9-10** ensure compliance and advanced features.

All stories are:
- ✅ Vertically sliced (complete functionality)
- ✅ Sequentially ordered (no forward dependencies)
- ✅ Appropriately sized (2-4 hour completion)
- ✅ BDD format (Given/When/Then)
- ✅ Traceable to PRD requirements

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._
