# Epic Technical Specification: Foundation & Core Infrastructure

Date: 2025-11-05
Author: ismailawa
Epic ID: 1
Status: Draft

---

## Overview

Epic 1 establishes the technical foundation for Miners Hub, a full-stack mineral trading marketplace connecting Nigeria's mineral producers, investors, and regulators. This epic creates the complete infrastructure required for the entire application, including separate frontend (Next.js) and backend (NestJS) projects, database setup (Supabase/PostgreSQL with TypeORM), core UI components, routing infrastructure, state management, API client layer, test frameworks, and CI/CD pipelines.

This foundation epic directly supports the PRD goal of creating a "trusted digital platform powering transparent trade, verified data, and smarter decisions" by providing the technical infrastructure for secure authentication, real-time communication, role-based access control, and compliance-ready audit logging. All subsequent epics depend on this foundation being properly established.

---

## Objectives and Scope

### In-Scope

- **Frontend Infrastructure:**
  - Next.js 15+ project initialization with TypeScript, Tailwind CSS, and shadcn/ui
  - App Router configuration with route protection
  - Core layout components (Header, Footer)
  - Theme system with light/dark mode support
  - Responsive design foundation
  - TypeScript types and data models
  - Constants and initial dummy data

- **Backend Infrastructure:**
  - NestJS project initialization with TypeScript
  - Supabase database connection and configuration
  - TypeORM setup with entity models for all core tables
  - Global exception filters and validation pipes
  - CORS configuration for frontend communication
  - Health check endpoint

- **State Management & API:**
  - Authentication context with React Context API
  - Notification context with toast system
  - Centralized API client with interceptors
  - Type-safe API service modules

- **Testing Infrastructure:**
  - Playwright for E2E testing (frontend)
  - Vitest for unit testing (frontend)
  - Jest for unit/integration testing (backend)
  - Supertest for API testing (backend)
  - Test data factories and fixtures

- **DevOps Infrastructure:**
  - GitHub Actions workflows for frontend and backend
  - Vercel integration for frontend deployment
  - Railway/Render integration for backend deployment
  - Environment variable management
  - Database migration automation

### Out-of-Scope

- **Feature Implementation:**
  - User registration/login pages (Epic 2)
  - Marketplace listings (Epic 4)
  - Transaction flows (Epic 5)
  - Auction system (Epic 6)
  - Chat functionality (Epic 7)
  - Dashboards (Epic 8)
  - Contracts (Epic 9)
  - Compliance features (Epic 10)

- **Advanced Features:**
  - Multi-factor authentication (growth phase)
  - Advanced fraud detection algorithms (Epic 10)
  - Real-time WebSocket connections (Epic 7 will use Supabase real-time)

- **External Integrations:**
  - Payment gateway integration (simulated in Epic 5)
  - Email service integration (future)
  - SMS service integration (future)

---

## System Architecture Alignment

This epic aligns with the architecture document's foundation layer, establishing:

**Frontend Architecture Components:**
- Next.js App Router structure (`app/` directory)
- Component library setup (`components/ui/` via shadcn/ui)
- Layout system (`components/layout/`)
- API client layer (`lib/api/`)
- Context providers (`lib/contexts/`)
- Type definitions (`lib/types.ts`)

**Backend Architecture Components:**
- NestJS module structure (`src/modules/`)
- Configuration modules (`src/config/`)
- Common modules (`src/common/` - filters, guards, interceptors, pipes)
- Database connection (`src/config/database.config.ts`)
- TypeORM entities (`src/*/entities/`)

**Integration Points Established:**
1. Frontend ↔ Backend: RESTful API client with JWT authentication
2. Backend ↔ Supabase: TypeORM DataSource connection to PostgreSQL
3. Frontend ↔ Supabase: Real-time subscription setup (infrastructure only, usage in Epic 7)
4. CI/CD ↔ Deployment Platforms: Automated deployment pipelines

**Constraints:**
- Separate repositories for frontend and backend (independent deployment)
- TypeScript strict mode enabled
- No external state management library (React Context only)
- Tailwind CSS exclusively (no CSS-in-JS)
- RESTful API only (no GraphQL)

---

## Detailed Design

### Services and Modules

#### Frontend Services

| Service/Module | Responsibility | Inputs | Outputs | Owner |
|----------------|----------------|--------|---------|-------|
| **API Client** (`lib/api/client.ts`) | Centralized HTTP client | Request config, auth token | HTTP responses, errors | Frontend |
| **Auth API Service** (`lib/api/auth.ts`) | Authentication API calls | Login/register credentials | User data, JWT tokens | Frontend |
| **Auth Context** (`lib/contexts/AuthContext.tsx`) | Global auth state management | User login/logout actions | Auth state, user data | Frontend |
| **Notification Context** (`lib/contexts/NotificationContext.tsx`) | Global notification state | Notification events | Toast messages, unread count | Frontend |
| **Theme Provider** (`components/theme/ThemeProvider.tsx`) | Theme management | Theme toggle action | Current theme, CSS variables | Frontend |
| **Route Protection** (`middleware.ts` or layout checks) | Route access control | Route path, auth state | Redirect or allow access | Frontend |

#### Backend Modules

| Module | Responsibility | Inputs | Outputs | Owner |
|--------|----------------|--------|---------|-------|
| **App Module** (`app.module.ts`) | Root module, dependency injection | Module imports | Configured NestJS app | Backend |
| **Database Config** (`config/database.config.ts`) | TypeORM DataSource configuration | Environment variables | Database connection | Backend |
| **Supabase Config** (`config/supabase.config.ts`) | Supabase client initialization | Supabase URL, keys | Supabase client instance | Backend |
| **Global Exception Filter** (`common/filters/http-exception.filter.ts`) | Error handling | Exceptions | Standardized error responses | Backend |
| **Global Validation Pipe** (`common/pipes/validation.pipe.ts`) | DTO validation | Request data | Validated or error response | Backend |
| **Health Check** (`health.controller.ts`) | Application health status | Health check request | Service status (200 OK) | Backend |

### Data Models and Contracts

#### Core Entities (TypeORM)

**User Entity:**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  role: 'miner' | 'investor' | 'government' | 'admin';

  @Column({ default: 'pending' })
  verificationStatus: 'pending' | 'verified' | 'rejected';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Listing, listing => listing.miner)
  listings: Listing[];

  @OneToMany(() => Order, order => order.buyer)
  orders: Order[];
}
```

**Miner Entity:**
```typescript
@Entity('miners')
export class Miner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.miner)
  @JoinColumn()
  user: User;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  miningLicence: string;

  @Column()
  location: string; // State/LGA

  @OneToMany(() => Listing, listing => listing.miner)
  listings: Listing[];
}
```

**Investor Entity:**
```typescript
@Entity('investors')
export class Investor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.investor)
  @JoinColumn()
  user: User;

  @Column()
  companyName: string;

  @Column({ type: 'text', array: true })
  investmentFocus: string[];

  @OneToMany(() => Order, order => order.buyer)
  orders: Order[];
}
```

**Listing Entity:**
```typescript
@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Miner, miner => miner.listings)
  miner: Miner;

  @Column()
  mineralType: string;

  @Column('decimal')
  quantity: number; // in tons

  @Column('decimal')
  price: number;

  @Column({ default: 'draft' })
  status: 'draft' | 'submitted' | 'under_review' | 'published' | 'sold' | 'expired' | 'archived';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**AuditLog Entity:**
```typescript
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  action: string;

  @Column('jsonb')
  metadata: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
}
```

#### TypeScript Types (Frontend)

```typescript
// lib/types.ts

export interface User {
  id: string;
  email: string;
  role: 'miner' | 'investor' | 'government' | 'admin';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Miner {
  id: string;
  userId: string;
  companyName: string;
  miningLicence?: string;
  location: string;
}

export interface Listing {
  id: string;
  minerId: string;
  mineralType: string;
  quantity: number;
  price: number;
  status: 'draft' | 'submitted' | 'under_review' | 'published' | 'sold' | 'expired' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};
```

### APIs and Interfaces

#### Frontend API Client Interface

```typescript
// lib/api/client.ts
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
```

#### Backend API Endpoints (Foundation Setup)

**Health Check:**
- **Method:** `GET`
- **Path:** `/api/health`
- **Request:** None
- **Response:** `200 OK` with `{ status: 'healthy' }`
- **Authentication:** None required

**Error Response Format:**
```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
```

### Workflows and Sequencing

#### Project Initialization Sequence

1. **Frontend Setup (Story 1.1):**
   ```
   Initialize Next.js → Configure TypeScript → Setup Tailwind → Install shadcn/ui → Create directory structure
   ```

2. **Backend Setup (Story 1.2b):**
   ```
   Initialize NestJS → Configure TypeScript → Setup CORS → Configure validation pipes → Create module structure
   ```

3. **Database Setup (Stories 1.3b, 1.4b):**
   ```
   Create Supabase project → Configure connection → Setup TypeORM → Create entities → Run migrations
   ```

4. **API Client Setup (Story 1.7):**
   ```
   Create HTTP client → Configure interceptors → Create service modules → Add type definitions
   ```

5. **State Management (Stories 1.5, 1.6):**
   ```
   Create AuthContext → Create NotificationContext → Integrate with API client → Add hooks
   ```

6. **Testing Infrastructure (Story 1.11):**
   ```
   Install Playwright/Vitest → Configure test scripts → Create test utilities → Setup CI/CD test execution
   ```

7. **CI/CD Setup (Story 1.12):**
   ```
   Create GitHub Actions workflows → Configure Vercel → Configure Railway/Render → Setup secrets → Test deployment
   ```

#### Request Flow (Foundation)

```
User Action → React Component → API Service → API Client → HTTP Request → 
NestJS Controller → Service → TypeORM → Supabase Database → Response → 
API Client → Context Update → Component Re-render
```

---

## Non-Functional Requirements

### Performance

**Frontend Performance:**
- Time to Interactive (TTI) < 3 seconds on 4G connection (PRD NFR)
- API response caching for frequently accessed data
- Code splitting for large components
- Image optimization via Next.js Image component
- Lazy loading for non-critical components

**Backend Performance:**
- API response time < 200ms for standard CRUD operations
- Database query optimization via TypeORM indexes
- Connection pooling for database connections (max 20 connections)
- Request timeout: 30 seconds

**Build Performance:**
- Frontend build time < 2 minutes
- Backend build time < 1 minute
- CI/CD pipeline execution < 10 minutes total

**Targets:**
- Support ≥ 10,000 concurrent users (PRD NFR)
- Database queries optimized with proper indexes
- Efficient API data fetching and caching strategies

### Security

**Authentication Security:**
- JWT tokens with expiration (15 minutes access, 7 days refresh)
- Secure token storage (httpOnly cookies preferred, secure localStorage fallback)
- Password strength requirements (min 8 characters)
- Token refresh mechanism to prevent session hijacking

**Data Protection:**
- HTTPS enforced in production
- XSS mitigation via React's built-in protections and input sanitization
- CSRF protection via token-based validation (NestJS)
- No secret keys in frontend code
- Environment variables for all secrets and API keys

**Database Security:**
- Supabase Row Level Security (RLS) policies for access control
- TypeORM entity validation for data integrity
- Encrypted database connections (SSL/TLS)
- Parameterized queries to prevent SQL injection

**API Security:**
- CORS configured to allow only frontend origin
- Rate limiting (future: 100 requests per minute per user)
- Input validation on all endpoints (class-validator)
- Error messages don't expose sensitive information

**Compliance:**
- Audit logging for all authentication events (PRD requirement)
- Data encryption at rest (Supabase managed)
- Data encryption in transit (HTTPS/TLS)

### Reliability/Availability

**Availability Target:**
- 99.5% uptime (PRD NFR)
- Graceful error handling with user-friendly messages
- Health check endpoint for monitoring
- Database connection retry logic (3 retries with exponential backoff)

**Error Handling:**
- Global exception filter for consistent error responses
- Client-side error boundaries for React components
- Offline mode support (localStorage fallback for cached data)
- Recovery after page refresh (token validation via API)

**Resilience:**
- Database connection pooling for reliability
- Request timeout handling
- Graceful degradation when API unavailable
- Data persistence via Supabase database across sessions

### Observability

**Logging:**
- Structured logging in NestJS (Winston or Pino)
- Log levels: ERROR, WARN, INFO, DEBUG
- Request/response logging for API calls
- Error stack traces in development, sanitized in production

**Metrics:**
- Health check endpoint for monitoring (`/api/health`)
- API response time tracking
- Database connection status monitoring
- Error rate tracking

**Tracing:**
- Request ID tracking for debugging
- User action tracking for audit trails
- API call tracing with timestamps

**Monitoring:**
- CI/CD pipeline status monitoring
- Deployment success/failure notifications
- Database migration status tracking

---

## Dependencies and Integrations

### Frontend Dependencies

| Package | Version | Purpose | Constraint |
|---------|---------|---------|------------|
| next | ^15.0.0 | React framework | Exact (15+) |
| react | ^18.0.0 | UI library | Peer dependency |
| react-dom | ^18.0.0 | DOM rendering | Peer dependency |
| typescript | ^5.0.0 | Type safety | Latest stable |
| tailwindcss | ^3.4.0 | Styling | Latest |
| @radix-ui/* | Latest | UI primitives (via shadcn) | Latest |
| axios | ^1.6.0 | HTTP client | Latest stable |
| @supabase/supabase-js | ^2.0.0 | Supabase client | Latest |

### Backend Dependencies

| Package | Version | Purpose | Constraint |
|---------|---------|---------|------------|
| @nestjs/core | ^10.0.0 | NestJS framework | Latest |
| @nestjs/common | ^10.0.0 | NestJS utilities | Latest |
| @nestjs/platform-express | ^10.0.0 | Express adapter | Latest |
| @nestjs/typeorm | ^10.0.0 | TypeORM integration | Latest |
| typeorm | ^0.3.0 | ORM | Latest |
| pg | ^8.11.0 | PostgreSQL driver | Latest |
| @supabase/supabase-js | ^2.0.0 | Supabase client | Latest |
| class-validator | ^0.14.0 | DTO validation | Latest |
| class-transformer | ^0.5.0 | DTO transformation | Latest |
| @nestjs/jwt | ^10.0.0 | JWT authentication | Latest |
| @google/generative-ai | Latest | Gemini API | Latest |

### Testing Dependencies

| Package | Version | Purpose | Environment |
|---------|---------|---------|-------------|
| @playwright/test | ^1.40.0 | E2E testing | Frontend dev |
| vitest | ^1.0.0 | Unit testing | Frontend dev |
| jest | ^29.0.0 | Unit testing | Backend dev |
| @nestjs/testing | ^10.0.0 | NestJS testing | Backend dev |
| supertest | ^6.3.0 | API testing | Backend dev |

### External Services

| Service | Purpose | Integration Method | Authentication |
|---------|---------|-------------------|----------------|
| **Supabase** | Database, Auth, Storage | REST API, Real-time subscriptions | API keys, RLS policies |
| **Google Gemini API** | AI features | HTTP REST API | API key |
| **Vercel** | Frontend hosting | Git-based deployment | OAuth token |
| **Railway/Render** | Backend hosting | Git-based deployment | API token |

### Integration Points

1. **Frontend → Backend:**
   - RESTful API via HTTP/HTTPS
   - Base URL: `NEXT_PUBLIC_API_URL` environment variable
   - Authentication: JWT Bearer token in Authorization header

2. **Backend → Supabase:**
   - PostgreSQL connection via TypeORM DataSource
   - Connection string: `DATABASE_URL` environment variable
   - Storage API: `SUPABASE_URL` + `SUPABASE_SERVICE_KEY`

3. **Backend → Gemini API:**
   - HTTP REST API
   - API key: `GEMINI_API_KEY` environment variable
   - Endpoint: `https://generativelanguage.googleapis.com/v1beta`

4. **CI/CD → Deployment Platforms:**
   - Vercel: GitHub Actions → Vercel API
   - Railway/Render: GitHub Actions → Platform API
   - Secrets stored in GitHub Secrets

---

## Acceptance Criteria (Authoritative)

### AC1: Frontend Project Setup
- **Given** I am starting a new project
- **When** I initialize the Next.js project
- **Then** I have a Next.js 15+ project with TypeScript, Tailwind CSS, and shadcn/ui configured
- **And** The project runs successfully with `npm run dev`
- **And** All dependencies are installed and working
- **Traceability:** Story 1.1 → PRD Tech Stack → Architecture Frontend Setup

### AC2: Backend Project Setup
- **Given** I am setting up the backend
- **When** I initialize the NestJS project
- **Then** I have a NestJS project with TypeScript configured
- **And** The backend runs successfully with `npm run start:dev`
- **And** Health check endpoint `/api/health` returns 200 OK
- **Traceability:** Story 1.2b → PRD Tech Stack → Architecture Backend Setup

### AC3: Database Connection
- **Given** I have a Supabase project created
- **When** I configure the database connection
- **Then** The database connection is established successfully
- **And** Connection health can be verified via health check endpoint
- **Traceability:** Story 1.3b → Architecture Database Setup → PRD Data Persistence

### AC4: TypeORM Entities
- **Given** I have database connection configured
- **When** I set up TypeORM with entities
- **Then** All core entity classes are defined (User, Miner, Investor, Listing, Order, Contract, Chat, Notification, Document, AuditLog)
- **And** Relationships are properly established
- **And** Migrations can be run successfully
- **Traceability:** Story 1.4b → Architecture Data Models → PRD Entity Requirements

### AC5: Theme System
- **Given** I am on any page
- **When** I toggle the theme switch
- **Then** The entire application switches between light and dark themes
- **And** The theme preference is saved in localStorage
- **And** The preference persists across page refreshes
- **Traceability:** Story 1.3 → PRD FR-10.1 → Architecture Theme System

### AC6: Core UI Components
- **Given** I am on a public page
- **When** I view the header
- **Then** I see Miners Hub logo, navigation, search bar, theme toggle, notification center, and login/register buttons
- **And** The header is sticky and responsive
- **Traceability:** Story 1.4 → PRD Navigation Requirements → Architecture UI Components

### AC7: Authentication Context
- **Given** I have implemented the context
- **When** A user logs in
- **Then** The authentication state is stored in AuthContext
- **And** Token is stored securely
- **And** The state persists across page refreshes
- **Traceability:** Story 1.5 → PRD FR-1.2 → Architecture Auth Context

### AC8: Notification Context
- **Given** I am using the application
- **When** An action triggers a notification
- **Then** A toast message appears
- **And** The notification is stored in NotificationContext
- **And** Unread count badge updates in header
- **Traceability:** Story 1.6 → PRD FR-10.2 → Architecture Notification System

### AC9: API Client
- **Given** I have implemented the API client
- **When** I make API requests
- **Then** JWT token is automatically added to Authorization header
- **And** Errors are handled globally
- **And** Type-safe API service functions are available
- **Traceability:** Story 1.7 → Architecture API Client Pattern → PRD API Integration

### AC10: TypeScript Types
- **Given** I am implementing features
- **When** I use data models
- **Then** All TypeScript types are properly defined (User, Miner, Listing, etc.)
- **And** Types are exported from a central `types.ts` file
- **Traceability:** Story 1.8 → Architecture Type Safety → PRD Type Requirements

### AC11: Test Framework Setup
- **Given** I have frontend and backend projects set up
- **When** I configure the test frameworks
- **Then** Playwright, Vitest, Jest, and Supertest are installed and configured
- **And** Test scripts are available in `package.json`
- **And** CI/CD pipeline runs tests on commits
- **Traceability:** Story 1.11 → Test Strategy → Architecture Testing

### AC12: CI/CD Pipeline Setup
- **Given** I have frontend and backend projects set up with test frameworks
- **When** I configure the CI/CD pipelines
- **Then** GitHub Actions workflows are created for frontend and backend
- **And** Vercel and Railway/Render integrations are configured
- **And** Automatic deployments occur on push to main/staging branches
- **Traceability:** Story 1.12 → Deployment & CI/CD Strategy → Architecture Deployment

---

## Traceability Mapping

| Acceptance Criteria | Spec Section | Component/API | Test Idea |
|---------------------|--------------|---------------|-----------|
| AC1: Frontend Setup | Services: Frontend Services | Next.js project, package.json | Verify `npm run dev` starts successfully |
| AC2: Backend Setup | Services: Backend Modules | NestJS app.module.ts, main.ts | Verify `/api/health` returns 200 |
| AC3: Database Connection | Data Models: TypeORM Entities | database.config.ts, TypeORM DataSource | Verify connection on app start |
| AC4: TypeORM Entities | Data Models: Core Entities | Entity classes, migrations | Verify entities map to database tables |
| AC5: Theme System | Services: Theme Provider | ThemeProvider.tsx, localStorage | Verify theme toggle works, persists |
| AC6: Core UI Components | Services: Route Protection | Header.tsx, Footer.tsx | Verify components render, responsive |
| AC7: Authentication Context | Services: Auth Context | AuthContext.tsx, useAuth hook | Verify login updates context, token stored |
| AC8: Notification Context | Services: Notification Context | NotificationContext.tsx, toast system | Verify notifications appear, badge updates |
| AC9: API Client | Services: API Client | api/client.ts, interceptors | Verify token added, errors handled |
| AC10: TypeScript Types | Data Models: TypeScript Types | lib/types.ts | Verify types compile, no errors |
| AC11: Test Framework | Dependencies: Testing | Playwright, Vitest, Jest configs | Verify tests run, coverage reports |
| AC12: CI/CD Pipeline | Dependencies: External Services | .github/workflows/*.yml | Verify pipeline runs on commit |

---

## Risks, Assumptions, Open Questions

### Risks

**R1: Technology Version Compatibility**
- **Risk:** Next.js 15+ or NestJS latest versions may have breaking changes
- **Mitigation:** Pin exact versions in package.json, test thoroughly before upgrading
- **Status:** Managed

**R2: Database Connection Failures**
- **Risk:** Supabase connection issues could block development
- **Mitigation:** Implement connection retry logic, use connection pooling, have fallback plan
- **Status:** Managed

**R3: CI/CD Pipeline Complexity**
- **Risk:** Complex deployment setup could delay development
- **Mitigation:** Start with basic workflows, iterate based on needs, document thoroughly
- **Status:** Managed

**R4: Test Framework Setup Time**
- **Risk:** Setting up multiple test frameworks could be time-consuming
- **Mitigation:** Prioritize one framework first (Playwright for E2E), add others incrementally
- **Status:** Managed

### Assumptions

**A1: Supabase Project Access**
- **Assumption:** Supabase project will be created and accessible before Story 1.3b
- **Validation:** Confirm Supabase project exists and credentials are available
- **Status:** Validated

**A2: Deployment Platform Access**
- **Assumption:** Vercel and Railway/Render accounts will be available for Story 1.12
- **Validation:** Confirm platform access and API tokens available
- **Status:** To be validated

**A3: Environment Variables**
- **Assumption:** All required environment variables will be documented and available
- **Validation:** Reference env-variables-guide.md for complete list
- **Status:** Validated

### Open Questions

**Q1: Token Storage Strategy**
- **Question:** Should we use httpOnly cookies or secure localStorage for JWT tokens?
- **Decision:** Prefer httpOnly cookies for security, localStorage as fallback
- **Status:** Resolved

**Q2: Test Database Strategy**
- **Question:** Should we use a separate Supabase test project or in-memory database?
- **Decision:** Separate Supabase test project for realistic testing
- **Status:** Resolved

**Q3: CI/CD Approval Gates**
- **Question:** Should production deployments require manual approval?
- **Decision:** Yes, production deployments should have approval gates
- **Status:** Resolved

---

## Test Strategy Summary

### Test Levels

**Unit Tests (60% target coverage):**
- Frontend: Vitest for utility functions, hooks, context providers
- Backend: Jest for services, controllers, DTOs
- **Scope:** Business logic, pure functions, data transformations

**Integration Tests (30% target coverage):**
- Frontend: Playwright Component Testing for component interactions
- Backend: Jest + Supertest for API endpoint testing, database operations
- **Scope:** API contracts, service interactions, database queries

**E2E Tests (10% target coverage):**
- Playwright for critical user journeys
- **Scope:** Complete user flows (login, registration, listing creation)

### Test Frameworks

- **Frontend E2E:** Playwright (cross-browser: Chromium, Firefox, WebKit)
- **Frontend Unit:** Vitest (fast, Vite-powered)
- **Frontend Component:** Playwright Component Testing
- **Backend Unit/Integration:** Jest (NestJS default)
- **Backend API:** Supertest (HTTP endpoint testing)

### Test Coverage

**Critical Paths (Must Test):**
- Project initialization (AC1, AC2)
- Database connection (AC3)
- Authentication flow (AC7)
- API client functionality (AC9)
- CI/CD pipeline execution (AC12)

**Important Paths (Should Test):**
- Theme system (AC5)
- Notification system (AC8)
- TypeORM entity relationships (AC4)
- Test framework setup (AC11)

**Nice to Have:**
- All UI component interactions (AC6)
- TypeScript type validation (AC10)

### Test Data Management

- **Factories:** Create test data factories for User, Listing, Miner, Investor entities
- **Fixtures:** Pre-defined test scenarios for common use cases
- **Seeding:** Test database seeding utilities for consistent test data

### CI/CD Integration

- **Pre-commit:** Lint and type check (optional)
- **Pull Request:** Run all tests (unit, integration, E2E)
- **Main Branch:** Full test suite + coverage reporting
- **Failure Handling:** Block merge if tests fail

---

_This technical specification provides the foundation for implementing Epic 1: Foundation & Core Infrastructure. All subsequent epics depend on this foundation being properly established and tested._

