# Miners Hub - Architecture Document

**Author:** ismailawa  
**Date:** 2025-11-05  
**Version:** 1.0  
**Project:** Miners Hub - Mineral Trading & Resource Marketplace

---

## Executive Summary

Miners Hub is a full-stack web application connecting Nigeria's mineral producers, investors, and regulators. The architecture follows a modern, scalable pattern with separate frontend and backend repositories, leveraging Next.js 15+ for the frontend, NestJS for the backend API, and Supabase (PostgreSQL) for data persistence with real-time capabilities.

**Key Architectural Principles:**
- **Separation of Concerns:** Frontend and backend in separate repositories
- **API-First Design:** RESTful API with clear contracts
- **Real-Time Capabilities:** Supabase real-time subscriptions for live updates
- **Security-First:** Role-based access control, Row Level Security, audit trails
- **Compliance-Ready:** Built-in support for KYC/AML, audit logging, content moderation

---

## Project Initialization

### Frontend Setup

```bash
# Initialize Next.js project
npx create-next-app@latest miners-hub-frontend --typescript --tailwind --app --no-src-dir

# Navigate to frontend directory
cd miners-hub-frontend

# Initialize shadcn/ui
npx shadcn@latest init
```

**Initialization Decisions Made:**
- Next.js 15+ with App Router (not Pages Router)
- TypeScript enabled
- Tailwind CSS configured
- App directory structure (no `src/` folder)
- shadcn/ui component library initialized

### Backend Setup

```bash
# Initialize NestJS project
nest new miners-hub-backend --package-manager npm

# Navigate to backend directory
cd miners-hub-backend

# Install additional dependencies
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/config
npm install @supabase/supabase-js
npm install class-validator class-transformer
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @google/generative-ai
```

**Initialization Decisions Made:**
- NestJS with TypeScript
- TypeORM for database operations
- Supabase client for direct database access
- JWT authentication
- Google Gemini API integration

---

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| Project Structure | Separate repositories | N/A | All | Clear separation, independent deployment |
| Frontend Framework | Next.js | 15+ | All | App Router, SSR/SSG, excellent DX |
| UI Component Library | shadcn/ui | Latest | All | Accessible, customizable, Tailwind-based |
| Backend Framework | NestJS | Latest | All | Modular, scalable, TypeScript-first |
| Database | Supabase (PostgreSQL) | Latest | All | Managed PostgreSQL, real-time, RLS |
| ORM | TypeORM | Latest | All | Type-safe, migrations, relationships |
| Real-Time | Supabase Subscriptions | Latest | Epic 7 | Built-in real-time, no WebSocket server needed |
| Authentication | Supabase Auth + JWT | Latest | Epic 2 | Managed auth with custom backend validation |
| File Storage | Supabase Storage | Latest | Epic 2, 4 | Integrated with database, RLS support |
| AI Integration | Google Gemini API | Latest | Epic 7 | Streaming support, good for chat and summaries |
| API Style | RESTful | N/A | All | Standard, predictable, well-supported |
| State Management | React Context | N/A | All | Simple, no external library needed |

---

## Project Structure

### Frontend Repository (`miners-hub-frontend/`)

```
miners-hub-frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (public)/                 # Public routes
│   │   ├── page.tsx              # Home page
│   │   ├── marketplace/
│   │   ├── news/
│   │   └── ...
│   ├── (dashboard)/              # Authenticated routes
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── contracts/
│   │   └── ...
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles + theme variables
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Header, Footer
│   ├── features/                 # Feature-specific components
│   │   ├── marketplace/
│   │   ├── chat/
│   │   └── ...
│   └── shared/                    # Shared components
├── lib/                          # Utilities and helpers
│   ├── api/                      # API client and services
│   │   ├── client.ts             # HTTP client setup
│   │   ├── auth.ts               # Auth API
│   │   ├── listings.ts           # Listings API
│   │   └── ...
│   ├── contexts/                 # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   └── types.ts                  # TypeScript types
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Backend Repository (`miners-hub-backend/`)

```
miners-hub-backend/
├── src/
│   ├── main.ts                   # Application entry point
│   ├── app.module.ts             # Root module
│   ├── common/                   # Shared modules
│   │   ├── filters/              # Exception filters
│   │   ├── guards/               # Auth guards
│   │   ├── interceptors/         # Logging, transformation
│   │   └── pipes/                # Validation pipes
│   ├── config/                   # Configuration
│   │   ├── database.config.ts    # TypeORM config
│   │   └── supabase.config.ts    # Supabase config
│   ├── auth/                     # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   └── strategies/
│   ├── users/                    # User management module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   └── dto/
│   ├── listings/                 # Marketplace listings module
│   ├── auctions/                 # Auction system module
│   ├── contracts/                # Contract management module
│   ├── orders/                   # Order processing module
│   ├── chats/                    # Chat/messaging module
│   ├── notifications/            # Notification module
│   ├── documents/                # File upload module
│   ├── analytics/                # Analytics module
│   ├── ai/                       # AI integration module
│   │   ├── ai.controller.ts
│   │   ├── ai.service.ts
│   │   └── gemini.config.ts
│   └── audit-logs/               # Audit logging module
├── migrations/                   # TypeORM migrations
├── .env                          # Environment variables
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## Epic to Architecture Mapping

| Epic | Architecture Components | Key Patterns |
|------|------------------------|--------------|
| Epic 1: Foundation | Next.js setup, NestJS setup, TypeORM entities, API client | Project initialization, module structure |
| Epic 2: User Onboarding | Auth module, Users module, File upload, RBAC guards | Multi-step forms, document upload, role-based access |
| Epic 3: Public Site | Next.js pages, static generation, API routes | SSR/SSG, public content |
| Epic 4: Listings | Listings module, CRUD operations, file storage | RESTful API, file upload |
| Epic 5: Buy Now | Orders module, payment simulation | Transaction patterns, state management |
| Epic 6: Auctions | Auctions module, Bids module, real-time updates | Real-time subscriptions, anti-sniping logic |
| Epic 7: Communication & AI | Chats module, AI module, real-time subscriptions | WebSocket/SSE patterns, streaming responses |
| Epic 8: Dashboards | Analytics module, aggregation queries | Data aggregation, caching |
| Epic 9: Contracts | Contracts module, e-signatures | Document management, workflow state |
| Epic 10: Compliance | Audit logs, moderation, fraud detection | Event sourcing, rule engines |

---

## Technology Stack Details

### Core Technologies

**Frontend:**
- **Next.js 15+**: React framework with App Router, SSR, SSG
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible component library
- **React Context API**: Global state management

**Backend:**
- **NestJS**: Node.js framework with dependency injection
- **TypeScript**: Type safety
- **TypeORM**: ORM for database operations
- **Supabase Client**: Direct database access and real-time

**Database:**
- **Supabase (PostgreSQL)**: Managed PostgreSQL database
- **Row Level Security (RLS)**: Database-level access control
- **Real-time Subscriptions**: Live data updates

**External Services:**
- **Supabase Auth**: User authentication
- **Supabase Storage**: File storage
- **Google Gemini API**: AI chat and market summaries

### Integration Points

1. **Frontend ↔ Backend**: RESTful API calls via HTTP client
2. **Frontend ↔ Supabase**: Real-time subscriptions for chats, bids, notifications
3. **Backend ↔ Supabase**: TypeORM connection to PostgreSQL + Storage API
4. **Backend ↔ Gemini API**: HTTP requests for AI features
5. **Backend ↔ Supabase Auth**: Token validation and user management

---

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### API Client Pattern

**Frontend:**
```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor: Add JWT token
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error);
  }
);
```

**Pattern Rules:**
- All API calls use `apiClient` from `lib/api/client.ts`
- Service modules in `lib/api/` (e.g., `auth.ts`, `listings.ts`)
- Type-safe request/response types
- Error handling via interceptors

### NestJS Module Pattern

**Structure:**
```typescript
// Feature module structure
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
```

**Pattern Rules:**
- Feature-based modules (not layer-based)
- Controllers handle HTTP requests
- Services contain business logic
- Entities in `entities/` folder
- DTOs in `dto/` folder

### TypeORM Entity Pattern

```typescript
@Entity('table_name')
export class EntityName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  field: string;

  @ManyToOne(() => RelatedEntity)
  relation: RelatedEntity;

  @CreateDateColumn()
  createdAt: Date;
}
```

**Pattern Rules:**
- Use UUID for primary keys
- Timestamps: `createdAt`, `updatedAt`
- Relationships: `@ManyToOne`, `@OneToMany`, `@ManyToMany`
- Entity validation with class-validator decorators

### Real-Time Subscription Pattern

**Frontend:**
```typescript
// Supabase real-time subscription
const subscription = supabase
  .channel('table-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chats',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Handle real-time update
  })
  .subscribe();
```

**Pattern Rules:**
- Use Supabase real-time for live updates
- Subscribe in React components with `useEffect`
- Clean up subscriptions on unmount
- Handle connection errors gracefully

---

## Consistency Rules

### Naming Conventions

**Frontend:**
- Components: PascalCase (`UserCard.tsx`)
- Files: Match component name (`UserCard.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utilities: camelCase (`formatDate.ts`)
- API services: camelCase (`auth.ts`, `listings.ts`)
- Routes: kebab-case in URLs (`/marketplace`, `/my-listings`)

**Backend:**
- Modules: PascalCase (`UsersModule`)
- Controllers: PascalCase + Controller (`UsersController`)
- Services: PascalCase + Service (`UsersService`)
- Entities: PascalCase (`User`, `Listing`)
- DTOs: PascalCase + DTO (`CreateUserDto`)
- Routes: kebab-case (`/api/users`, `/api/listings`)
- Database tables: snake_case (`users`, `mineral_listings`)

### Code Organization

**Frontend:**
- Feature-based organization in `components/features/`
- Shared components in `components/shared/`
- API services grouped by feature in `lib/api/`
- Types centralized in `lib/types.ts`

**Backend:**
- Feature modules in `src/{feature}/`
- Shared code in `src/common/`
- Entities in `src/{feature}/entities/`
- DTOs in `src/{feature}/dto/`

### Error Handling

**Backend:**
```typescript
// Global exception filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;
    
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
```

**Frontend:**
```typescript
// Error handling in API client
try {
  const response = await apiClient.get('/endpoint');
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else if (error.response?.status === 404) {
    // Handle not found
  } else {
    // Generic error
    showToast('An error occurred. Please try again.');
  }
  throw error;
}
```

**Pattern Rules:**
- Global exception filter in NestJS
- Standardized error response format
- User-friendly error messages in frontend
- Log errors for debugging

### Logging Strategy

**Backend:**
- Use NestJS Logger
- Log requests via interceptor
- Log errors with context
- Audit logs for compliance (stored in database)

**Frontend:**
- Console logging in development
- Error logging to monitoring service (production)
- No sensitive data in logs

---

## Data Architecture

### Core Entities

**User Management:**
- `users` - Base user table
- `miners` - Miner-specific data (FK: user_id)
- `investors` - Investor-specific data (FK: user_id)

**Marketplace:**
- `listings` - Mineral listings (FK: miner_id → users.id)
- `auctions` - Auction data (FK: listing_id)
- `bids` - Auction bids (FK: auction_id, user_id)

**Transactions:**
- `orders` - Purchase orders (FK: buyer_id, seller_id, listing_id)
- `contracts` - Contract proposals (FK: proposer_id, recipient_id, listing_id)
- `transactions` - Payment transactions (FK: order_id)

**Communication:**
- `chats` - Chat messages (FK: sender_id, receiver_id)
- `notifications` - User notifications (FK: user_id)

**Compliance:**
- `documents` - KYC documents and attachments (FK: user_id, listing_id)
- `audit_logs` - Audit trail (FK: user_id)
- `flags` - Content moderation flags (FK: user_id, content_id)

### Entity Relationships

```
users
  ├── 1:1 → miners
  ├── 1:1 → investors
  ├── 1:N → listings (as miner)
  ├── 1:N → bids (as investor)
  ├── 1:N → orders (as buyer/seller)
  ├── 1:N → contracts (as proposer/recipient)
  ├── 1:N → chats (as sender/receiver)
  └── 1:N → notifications

listings
  ├── N:1 → users (miner)
  ├── 1:1 → auctions (optional)
  ├── 1:N → documents
  └── 1:N → orders

auctions
  ├── N:1 → listings
  └── 1:N → bids

bids
  ├── N:1 → auctions
  └── N:1 → users (investor)

contracts
  ├── N:1 → listings
  ├── N:1 → users (proposer)
  └── N:1 → users (recipient)
```

### Database Constraints

- **Foreign Keys:** All relationships enforced at database level
- **Unique Constraints:** Email, username where applicable
- **Indexes:** On frequently queried fields (user_id, listing_id, status)
- **Row Level Security (RLS):** Enabled on all tables for data protection

---

## API Contracts

### Authentication Endpoints

```
POST   /api/auth/register       - User registration
POST   /api/auth/login          - User login
POST   /api/auth/logout         - User logout
POST   /api/auth/refresh        - Refresh access token
GET    /api/auth/me             - Get current user
```

### User Endpoints

```
GET    /api/users/profile       - Get user profile
PUT    /api/users/profile       - Update user profile
POST   /api/users/onboarding    - Submit onboarding data
GET    /api/users/dashboard     - Get dashboard statistics
GET    /api/users/wallet        - Get wallet balance
```

### Listing Endpoints

```
GET    /api/listings            - List all listings (with filters)
GET    /api/listings?mine=true - Get user's listings
GET    /api/listings/:id        - Get listing details
POST   /api/listings            - Create listing
PUT    /api/listings/:id        - Update listing
DELETE /api/listings/:id       - Delete listing
```

### Auction Endpoints

```
GET    /api/auctions/:id        - Get auction details
POST   /api/auctions/:id/bids   - Place bid
GET    /api/auctions/:id/bids   - Get auction bids
```

### Contract Endpoints

```
GET    /api/contracts           - List contracts
GET    /api/contracts/:id       - Get contract details
POST   /api/contracts           - Create contract proposal
PUT    /api/contracts/:id/status - Update contract status
POST   /api/contracts/:id/sign  - Sign contract
GET    /api/contracts/:id/history - Get contract history
```

### Order Endpoints

```
GET    /api/orders              - List orders
GET    /api/orders/:id         - Get order details
POST   /api/orders             - Create order (checkout)
PUT    /api/orders/:id/status  - Update order status
```

### Chat Endpoints

```
GET    /api/chats              - List chat threads
GET    /api/chats/:threadId    - Get chat messages
POST   /api/chats              - Send message
```

### Notification Endpoints

```
GET    /api/notifications      - List notifications
PUT    /api/notifications/:id/read - Mark as read
```

### Document Endpoints

```
POST   /api/documents          - Upload document
GET    /api/documents/:id      - Download document
DELETE /api/documents/:id      - Delete document
```

### AI Endpoints

```
POST   /api/ai/chat            - Chat with AI (streaming)
GET    /api/ai/market-summary  - Get AI market summary
```

### Analytics Endpoints

```
GET    /api/analytics/market-data - Get market data
```

### Audit Log Endpoints

```
GET    /api/audit-logs         - List audit logs (admin only)
GET    /api/audit-logs/export  - Export audit logs (admin only)
```

### Response Format

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request",
  "timestamp": "2025-11-05T20:29:19.000Z",
  "path": "/api/listings"
}
```

---

## Security Architecture

### Authentication Flow

1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Backend validates credentials with Supabase Auth
3. Backend returns JWT access token and refresh token
4. Frontend stores access token (in memory or secure storage)
5. Frontend stores refresh token (httpOnly cookie recommended)
6. All authenticated requests include: `Authorization: Bearer {accessToken}`
7. On 401 response, frontend uses refresh token to get new access token

### Authorization

**Role-Based Access Control (RBAC):**
- Roles: `Miner`, `Investor`, `Government`, `Admin`
- NestJS guards check user role
- Route protection based on role
- Supabase RLS policies provide additional database-level protection

**Access Control Examples:**
- Miners can create/edit their own listings
- Investors can place bids and create orders
- Government can verify users and listings
- Admins have full access

### Data Protection

- **Row Level Security (RLS):** Enabled on all Supabase tables
- **Encryption:** HTTPS for all API calls, data encryption at rest (Supabase)
- **Input Validation:** All inputs validated via class-validator
- **SQL Injection Prevention:** TypeORM parameterized queries
- **XSS Prevention:** Input sanitization, React's built-in protections

### Audit Trail

- All major actions logged to `audit_logs` table
- Immutable, append-only logs
- Includes: user_id, action_type, timestamp, details
- Exportable for regulatory compliance

---

## Performance Considerations

### Frontend

- **Code Splitting:** Next.js automatic code splitting
- **Image Optimization:** Next.js Image component
- **Static Generation:** Home page, public pages (SSG)
- **Caching:** API response caching, static asset caching
- **Bundle Size:** Tree shaking, dynamic imports for large components

### Backend

- **Database Indexing:** Indexes on frequently queried fields
- **Query Optimization:** Use TypeORM query builder for complex queries
- **Connection Pooling:** TypeORM connection pool configuration
- **Caching:** Redis for frequently accessed data (optional, future enhancement)
- **Pagination:** All list endpoints support pagination

### Real-Time

- **Supabase Real-Time:** Efficient pub/sub system
- **Selective Subscriptions:** Only subscribe to relevant channels
- **Connection Management:** Proper cleanup of subscriptions

---

## Deployment Architecture

### Frontend Deployment

**Platform:** Vercel (recommended) or similar
- Automatic deployments from Git
- Edge network for fast global delivery
- Environment variables configuration

**Build Command:** `npm run build`
**Output Directory:** `.next`

### Backend Deployment

**Platform:** Railway, Render, or AWS
- Node.js runtime
- Environment variables for secrets
- Database connection via connection string

**Build Command:** `npm run build`
**Start Command:** `npm run start:prod`

### Database

**Platform:** Supabase (managed PostgreSQL)
- Automatic backups
- Point-in-time recovery
- Connection pooling
- Real-time capabilities

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

**Backend (.env):**
```env
PORT=3001
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
JWT_SECRET=xxx
JWT_REFRESH_SECRET=xxx
GEMINI_API_KEY=xxx
NODE_ENV=production
```

---

## Development Environment

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for database)
- Google Cloud account (for Gemini API)

### Setup Commands

**Frontend:**
```bash
# Clone and setup frontend
cd miners-hub-frontend
npm install
npx shadcn@latest init
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

**Backend:**
```bash
# Clone and setup backend
cd miners-hub-backend
npm install
cp .env.example .env
# Edit .env with your values
npm run migration:run
npm run start:dev
```

### Development Workflow

1. **Database Setup:**
   - Create Supabase project
   - Run TypeORM migrations: `npm run migration:run`
   - Configure RLS policies

2. **Frontend Development:**
   - Start dev server: `npm run dev`
   - Access at `http://localhost:3000`

3. **Backend Development:**
   - Start dev server: `npm run start:dev`
   - API available at `http://localhost:3001`

4. **Testing:**
   - Frontend: `npm run test`
   - Backend: `npm run test`

---

## Architecture Decision Records (ADRs)

### ADR-001: Separate Repositories for Frontend and Backend

**Decision:** Use separate Git repositories for frontend and backend.

**Rationale:**
- Clear separation of concerns
- Independent deployment pipelines
- Easier to scale teams independently
- Matches PRD structure (distinct frontend/backend)

**Alternatives Considered:**
- Monorepo: Would simplify code sharing but adds complexity

**Status:** Accepted

---

### ADR-002: Supabase Real-Time Subscriptions

**Decision:** Use Supabase real-time subscriptions for live updates (chats, bids, notifications).

**Rationale:**
- Leverages Supabase built-in capabilities
- No need for WebSocket server in NestJS
- Simpler implementation
- Aligns with PRD requirements

**Alternatives Considered:**
- NestJS WebSocket gateway: More control but more complex

**Status:** Accepted

---

### ADR-003: JWT Token Storage Strategy

**Decision:** Store access token in memory/localStorage, refresh token in httpOnly cookie.

**Rationale:**
- Balance between security and UX
- Refresh token more secure in httpOnly cookie
- Access token can be easily refreshed
- Standard pattern for SPA applications

**Alternatives Considered:**
- Both tokens in httpOnly cookies: More secure but requires cookie handling

**Status:** Accepted

---

### ADR-004: TypeORM for Database Operations

**Decision:** Use TypeORM as the ORM for database operations with Supabase PostgreSQL.

**Rationale:**
- Type-safe database operations
- Migration system for schema versioning
- Good TypeScript support
- Repository pattern fits NestJS architecture

**Alternatives Considered:**
- Prisma: Good alternative but TypeORM better integrated with NestJS

**Status:** Accepted

---

### ADR-005: RESTful API Design

**Decision:** Use RESTful API design with standard HTTP methods and resource-based URLs.

**Rationale:**
- Standard, predictable pattern
- Well-supported across tools and libraries
- Easy to understand and document
- Aligns with PRD API structure

**Alternatives Considered:**
- GraphQL: More flexible but adds complexity

**Status:** Accepted

---

## Next Steps

1. **Security Architecture:** Run `workflow create-security-architecture`
2. **DevOps Strategy:** Run `workflow create-devops-strategy`
3. **Test Strategy:** Run `workflow create-test-strategy`
4. **Solutioning Gate Check:** Run `workflow solutioning-gate-check`

---

_Architecture document generated: 2025-11-05_  
_This document serves as the "consistency contract" for AI agents implementing the system._

