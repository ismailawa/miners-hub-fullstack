# Miners Hub — Senior Backend Analysis & MVP Task List

**Analyst:** Antigravity (Senior Backend Dev Analysis Mode)
**Date:** 2026-06-26
**Repo:** `ismailawa/miners-hub-fullstack`
**Stack:** NestJS 11 · Next.js (App Router) · TypeORM · Supabase (PostgreSQL) · JWT Auth

---

## 1. Executive Summary

Miners Hub is a **Nigerian mineral trading marketplace** connecting verified Miners, Investors, and Government regulators. The vision is a trusted platform for transparent trade, KYC compliance, and AI-powered market intelligence.

**Current State:** Epic 1 (Foundation & Infrastructure) is largely **done**. Epics 2–10 are in `backlog` status. The database schema (13 entities) is solid. The frontend has UI shells for most pages but they use dummy/mock data. The backend has only 5 functional modules: `auth`, `users`, `notifications`, `admin`, and `listings`. Critical domain modules — **orders, auctions, contracts, chats, documents, and AI** — have **no backend implementation whatsoever**.

**MVP Goal:** A fully functional end-to-end flow where a Miner can register → onboard → create a listing → an Investor can browse → buy → track an order, with admin oversight — all wired to real backend APIs.

---

## 2. System Assessment

### 2.1 What Is Built ✅

#### Backend (NestJS)
| Module | Controller | Service | DTOs | Status |
|--------|-----------|---------|------|--------|
| Auth | ✅ | ✅ | ✅ | Functional — register, login, refresh |
| Users | ✅ | ✅ | Partial | Functional — profile, onboarding update |
| Admin | ✅ | ✅ | ❌ | Functional — user verify, listing status |
| Listings | ✅ | ✅ | Inline | Functional — CRUD, mine-only scope |
| Notifications | ✅ | ✅ | ❌ | Functional — read/unread, mark-as-read |

#### Database Entities (TypeORM)
All 13 core entities are defined with proper indexes and relations:
`users`, `miners`, `investors`, `listings`, `auctions`, `bids`, `orders`, `contracts`, `chats`, `notifications`, `documents`, `audit_logs`

#### Frontend (Next.js)
- Auth pages: Login, Register — connected to API ✅
- Onboarding multi-step flow — partially connected ✅
- Dashboard layout shell — connected to AuthContext ✅
- Admin user management page — API connected ✅
- Marketplace UI (MarketplacePage.tsx) — uses dummy data ⚠️
- Profile page — partially connected ⚠️
- All other dashboard pages (orders, contracts, logistics, warehousing, tasks, payment, transactions, data-analytics) — stub/empty pages ❌
- API client library — fully built with token refresh, interceptors ✅

### 2.2 What Is Missing ❌ (Gap Analysis)

#### Backend Gaps
| Domain | Missing |
|--------|---------|
| **Orders** | No OrdersModule — no controller, service, DTOs, or routes |
| **Auctions** | No AuctionsModule — no bidding logic, countdown, anti-sniping |
| **Contracts** | No ContractsModule — no proposal, review, signing endpoints |
| **Chats** | No ChatsModule — no send/receive, thread management |
| **Documents** | No DocumentsModule — no file upload to Supabase Storage |
| **AI** | No AiModule — no Gemini chat endpoint, no market summary endpoint |
| **Analytics** | No AnalyticsModule — no aggregation queries |
| **Validation** | No global ValidationPipe, no class-transformer usage in DTOs |
| **Error handling** | No global ExceptionFilter |
| **Audit Logs** | AuditLog entity exists but nothing writes to it |
| **Pagination** | No reusable pagination utility |
| **File Upload** | No Multer/Supabase Storage integration |
| **Security** | JWT secrets are placeholder values in .env |
| **Rate Limiting** | No @nestjs/throttler or equivalent |
| **Swagger/OpenAPI** | No API documentation |
| **Password Reset** | No forgot-password / reset-password flow |

#### Frontend Gaps
| Page / Feature | Status |
|---------------|--------|
| Marketplace listings page | Empty stub |
| Orders page | Empty stub |
| Contracts list page | Empty stub |
| Contract detail page | Component exists but not wired |
| Contract proposal page | Component exists but not wired |
| Payment/Checkout page | Component exists but not wired |
| Transactions page | Empty stub |
| Data Analytics page | Component exists (mock data) |
| Auction bidding UI | Component exists (mock data) |
| Chat (direct messaging) | Component exists (mock data) |
| ChatAgent (AI) | Component exists — not wired to backend |
| Profile page (full) | Partially wired |
| Admin listings management | Missing (only user management exists) |

---

## 3. Architecture Notes

### 3.1 Key Design Patterns Already Established
- **JWT Auth with Refresh Tokens** — 15m access / 7d refresh
- **Role-Based Guards** — JwtAuthGuard + RolesGuard + @Roles() decorator
- **Repository Pattern** via TypeORM injected repositories
- **Miner-scoped Listings** — listings always resolved through Miner profile, not User.id directly
- **Document storage** — currently saves Base64 in DB (NOT production safe — must migrate to Supabase Storage)

### 3.2 Critical Architectural Decisions Needed
1. **File Uploads** — Must use @nestjs/platform-express + multer or stream directly to Supabase Storage. Base64 in DB is a blocker.
2. **Real-time Chat** — Use Supabase Realtime on the frontend (no need for backend WebSocket in MVP); backend only handles persistence.
3. **AI Streaming** — Use Server-Sent Events (SSE) from NestJS for streaming Gemini responses.
4. **Audit Logging** — Create an AuditLogService used as a cross-cutting concern injected into all modules.

---

## 4. MVP Task List

> **Legend:** 🔴 Critical · 🟡 Important · 🟢 Nice-to-have
> Tasks are ordered by dependency — complete in sequence within each phase.

---

### PHASE 1 — Backend Foundation Hardening

#### 1.1 Global Infrastructure
- [ ] 🔴 Install and configure `@nestjs/throttler` — apply to auth endpoints (5 req/min)
- [ ] 🔴 Add global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` to `main.ts`
- [ ] 🔴 Add global `HttpExceptionFilter` to return consistent `{ statusCode, message, error }` shape
- [ ] 🔴 Move all inline DTOs from services to dedicated `*.dto.ts` files with `class-validator` decorators
- [ ] 🔴 Add `@nestjs/swagger` — document all existing endpoints with `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`
- [ ] 🔴 Replace placeholder JWT secrets in `.env` with cryptographically strong values (`openssl rand -base64 64`)
- [ ] 🟡 Add `helmet` middleware for HTTP security headers
- [ ] 🟡 Create a shared `PaginationDto` (page, limit, offset) and `PaginatedResponseDto<T>` for all list endpoints
- [ ] 🟡 Create `AuditLogService` — injectable service that writes to `audit_logs` table; accept `userId`, `action`, `resource`, `resourceId`, `metadata`

#### 1.2 File Upload Infrastructure
- [ ] 🔴 Create `DocumentsModule` with `DocumentsController` and `DocumentsService`
- [ ] 🔴 `POST /api/documents/upload` — accept multipart/form-data; upload to Supabase Storage bucket `documents`; return public URL
- [ ] 🔴 `GET /api/documents/:id` — retrieve document metadata for authenticated user
- [ ] 🔴 `DELETE /api/documents/:id` — soft-delete document record (owner or admin only)
- [ ] 🔴 Update `users.service.ts` `updateProfile()` — replace Base64 storage with Supabase Storage URL saved in `documents.file_url`
- [ ] 🟡 Add file type validation (PDF, JPG, PNG only) and size limit (10MB max)

#### 1.3 Auth Enhancements
- [ ] 🔴 Add `POST /api/auth/logout` endpoint — invalidate refresh token
- [ ] 🔴 Add `GET /api/auth/me` — return current authenticated user profile (with miner/investor relation)
- [ ] 🟡 Add `POST /api/auth/forgot-password` — send password reset email
- [ ] 🟡 Add `POST /api/auth/reset-password` — validate token, hash new password

---

### PHASE 2 — Orders Module (Core Transaction Flow)

#### 2.1 Backend
- [ ] 🔴 Create `OrdersModule` with `OrdersController`, `OrdersService`, and DTOs
- [ ] 🔴 `POST /api/orders` — create order from listing (`CreateOrderDto`: listingId, quantity, deliveryAddress); validate listing is `PUBLISHED` and `buy_now` type; calculate `totalAmount = quantity × listing.price`; create order with `status: pending`; fire `AuditLogService`
- [ ] 🔴 `GET /api/orders` — list orders for current user (buyer or seller), with optional `status` filter and pagination
- [ ] 🔴 `GET /api/orders/:id` — get single order (buyer or seller access only)
- [ ] 🔴 `PATCH /api/orders/:id/status` — update order status; validate allowed transitions per role
- [ ] 🔴 `POST /api/orders/:id/payment` — simulate payment confirmation: set `paymentStatus: paid`, `status: confirmed`; log to audit trail
- [ ] 🔴 `POST /api/orders/:id/cancel` — cancel order (pre-shipment only); set `paymentStatus: refunded` if paid
- [ ] 🟡 Add `GET /admin/orders` to AdminController — list all orders with filters
- [ ] 🟡 On order creation, send notification to seller via NotificationsService
- [ ] 🟡 On order status change, send notification to buyer

#### 2.2 Frontend
- [ ] 🔴 Wire `PaymentPage.tsx` to `POST /api/orders` and `POST /api/orders/:id/payment`
- [ ] 🔴 Build out `app/(dashboard)/orders/page.tsx` — list orders with Buying/Selling tabs
- [ ] 🔴 Wire `OrderTrackingModal.tsx` to `GET /api/orders/:id`
- [ ] 🟡 Add order status timeline to tracking modal
- [ ] 🟡 Connect Marketplace "Buy Now" button to Checkout with real listing data

---

### PHASE 3 — Auctions Module

#### 3.1 Backend
- [ ] 🔴 Create `AuctionsModule` with `AuctionsController`, `AuctionsService`, DTOs
- [ ] 🔴 `POST /api/auctions` — create auction for a listing; validate miner ownership; set listing type to `auction`
- [ ] 🔴 `GET /api/auctions` — list active auctions with pagination; join listing + miner data
- [ ] 🔴 `GET /api/auctions/:id` — get auction detail with current bids
- [ ] 🔴 `POST /api/auctions/:id/bids` — place a bid; validate bid > currentBid + minimumIncrement; bidder ≠ miner; implement anti-sniping (extend endTime by 5 min if placed in last 2 min)
- [ ] 🔴 `GET /api/auctions/:id/bids` — list bids for an auction
- [ ] 🟡 Cron job to finalize expired auctions: set `status: completed`, determine winner, create order, send notifications
- [ ] 🟡 `PATCH /api/auctions/:id/cancel` — admin or miner can cancel active auction

#### 3.2 Frontend
- [ ] 🔴 Wire Marketplace Auction tab to `GET /api/auctions`
- [ ] 🔴 Wire auction detail modal bid button to `POST /api/auctions/:id/bids`
- [ ] 🔴 Connect countdown timer to `auction.endTime` (client-side setInterval)
- [ ] 🟡 Show live bid list using Supabase Realtime subscription on `bids` table

---

### PHASE 4 — Contracts Module

#### 4.1 Backend
- [ ] 🔴 Create `ContractsModule` with `ContractsController`, `ContractsService`, DTOs
- [ ] 🔴 `POST /api/contracts` — propose contract (`CreateContractDto`: party2Id, listingId, terms); party1 = requesting user; status = `proposed`
- [ ] 🔴 `GET /api/contracts` — list contracts where user is party1 or party2; pagination + status filter
- [ ] 🔴 `GET /api/contracts/:id` — get contract detail (only parties involved)
- [ ] 🔴 `PATCH /api/contracts/:id/status` — update status; validate caller is a party
- [ ] 🔴 `POST /api/contracts/:id/sign` — sign contract; set partyXSignedAt + partyXSignature; if both signed → set `status: signed`
- [ ] 🟡 Notify counterparty when contract is proposed or signed
- [ ] 🟡 Store contract PDF snapshot to Supabase Storage on `executed` status

#### 4.2 Frontend
- [ ] 🔴 Build `app/(dashboard)/contracts/page.tsx` — list contracts using `GET /api/contracts`
- [ ] 🔴 Wire `ContractDetailPage.tsx` to `GET /api/contracts/:id` and `POST /api/contracts/:id/sign`
- [ ] 🔴 Wire `ContractProposalPage.tsx` to `POST /api/contracts`
- [ ] 🔴 Wire `SignaturePad.tsx` output to the sign endpoint call

---

### PHASE 5 — Chats Module

#### 5.1 Backend
- [ ] 🔴 Create `ChatsModule` with `ChatsController`, `ChatsService`, DTOs
- [ ] 🔴 `POST /api/chats` — send message (`SendMessageDto`: receiverId, message); auto-generate threadId from sorted pair of UUIDs for deduplication
- [ ] 🔴 `GET /api/chats/threads` — list all unique threads for current user (latest message per thread, unread count)
- [ ] 🔴 `GET /api/chats/threads/:threadId` — get all messages in a thread (paginated); mark all as read for current user
- [ ] 🔴 `PATCH /api/chats/:id/read` — mark single message as read
- [ ] 🟡 Wire Supabase Realtime subscription on frontend to `chats` table filtered by threadId for live updates

#### 5.2 Frontend
- [ ] 🔴 Wire `MinerChatModal.tsx` to `POST /api/chats` and `GET /api/chats/threads/:threadId`
- [ ] 🟡 Add messages/inbox page at `app/(dashboard)/messages/` showing all threads

---

### PHASE 6 — AI Module (Gemini Integration)

#### 6.1 Backend
- [ ] 🔴 Create `AiModule` with `AiController` and `AiService`
- [ ] 🔴 Install `@google/generative-ai` package
- [ ] 🔴 `POST /api/ai/chat` — accept `{ message, history }`; call Gemini with Jatau persona system instruction; stream response using SSE (`@Sse` decorator)
- [ ] 🔴 `GET /api/ai/market-summary` — query listings aggregate data; format as market context; call Gemini for analysis; return markdown summary
- [ ] 🟡 Cache market summary for 1 hour to reduce Gemini API calls
- [ ] 🟡 Store AI chat sessions in Supabase for history persistence

#### 6.2 Frontend
- [ ] 🔴 Wire `ChatAgent.tsx` to `POST /api/ai/chat` using streaming fetch (SSE)
- [ ] 🔴 Wire `DataAnalyticsPage.tsx` AI summary section to `GET /api/ai/market-summary`

---

### PHASE 7 — Listings Module Enhancements

- [ ] 🔴 Add `GET /api/listings` — public endpoint (no auth); support query params: mineralType, location, minPrice, maxPrice, listingType, page, limit; return only `PUBLISHED` listings
- [ ] 🔴 Add `GET /api/listings/:id` — public listing detail; join miner + miner.user
- [ ] 🔴 Add `moisturePercentage` to `CreateListingDto`; add server-side validation for all fields
- [ ] 🔴 Wire frontend `MarketplacePage.tsx` to `GET /api/listings` (replace dummy data)
- [ ] 🟡 Add `GET /api/listings/my` — authenticated miner's listings with all statuses
- [ ] 🟡 On listing creation, trigger notification to Admin for review

---

### PHASE 8 — Admin Module Enhancements

- [ ] 🔴 Add `GET /admin/orders` — list all orders with buyer/seller info
- [ ] 🔴 Add `GET /admin/contracts` — list all contracts
- [ ] 🔴 Add `GET /admin/documents` — list all KYC documents pending review
- [ ] 🔴 Add `PATCH /admin/documents/:id/review` — approve or reject document
- [ ] 🟡 Add Admin Listings management page to frontend (`app/(dashboard)/admin/listings/page.tsx`)
- [ ] 🟡 Add Admin Orders overview page to frontend (`app/(dashboard)/admin/orders/page.tsx`)
- [ ] 🟡 Integrate AuditLogService into all admin mutation actions

---

### PHASE 9 — Analytics Module

- [ ] 🟡 Create `AnalyticsModule` with `AnalyticsController` and `AnalyticsService`
- [ ] 🟡 `GET /api/analytics/overview` — total users, miners, investors, listings, orders, order volume
- [ ] 🟡 `GET /api/analytics/listings` — listings by mineral type, by status, by location
- [ ] 🟡 `GET /api/analytics/orders` — orders by status, monthly order volume trend
- [ ] 🟡 Wire `DataAnalyticsPage.tsx` to above endpoints (replace dummy chart data)

---

### PHASE 10 — Compliance & KYC Enforcement

- [ ] 🟡 Prevent miners with `verificationStatus !== 'verified'` from creating new listings (enforce in ListingsService)
- [ ] 🟡 Prevent investors with `verificationStatus !== 'verified'` from placing orders or bids
- [ ] 🟡 Add AuditLog writes to: login, logout, listing create, order create, bid place, contract sign, document upload, admin verify action
- [ ] 🟢 Create `GET /api/admin/audit-logs` endpoint for compliance export (paginated, filterable by userId, action, date range)

---

### PHASE 11 — Infrastructure & DevOps

- [ ] 🔴 Run `npm run migration:generate` for any new schema changes and commit migration files
- [ ] 🟡 Add `.env.example` file with all required variables documented
- [ ] 🟡 Set up Supabase Row Level Security (RLS) policies for tables accessed by direct Supabase client calls
- [ ] 🟡 Complete CI/CD pipeline (Story 1-12 is in `review` status) — ensure build, lint, test, and deploy steps pass
- [ ] 🟡 Add integration tests for critical flows: auth, listing creation, order creation, bid placement
- [ ] 🟢 Add Docker Compose health checks for backend and db services

---

## 5. Dependency Map

```
Phase 1 (Foundation Hardening)
    ├── Phase 2 (Orders) ← requires published listings
    ├── Phase 6 (AI) ← independent, just needs GEMINI_API_KEY
    └── Phase 7 (Listing Enhancements) ← feeds Marketplace UI

Phase 2 (Orders)
    └── Phase 5 (Chats) ← buyers may chat before ordering

Phase 3 (Auctions)
    └── Phase 2 (Orders) ← winning bid auto-creates an order

Phase 4 (Contracts)
    └── Phase 2 (Orders) ← contract may be linked to an order

Phase 8 (Admin)
    └── Phases 2, 3, 4, 7 ← admin manages all of the above

Phase 9 (Analytics)
    └── Phases 2, 3, 4, 7 ← aggregates data from all modules

Phase 10 (Compliance)
    └── Phase 1 ← AuditLogService must exist first
```

---

## 6. Estimated Effort

| Phase | Scope | Backend SP | Frontend SP | Total |
|-------|-------|-----------|-------------|-------|
| 1 — Foundation Hardening | Infra, Auth, Uploads | 8 | 3 | 11 |
| 2 — Orders | Full CRUD + payment sim | 8 | 8 | 16 |
| 3 — Auctions | Bids + anti-sniping | 8 | 6 | 14 |
| 4 — Contracts | Proposals + signing | 6 | 5 | 11 |
| 5 — Chats | Messaging threads | 5 | 4 | 9 |
| 6 — AI (Gemini) | Chat + market summary | 5 | 4 | 9 |
| 7 — Listings (enhance) | Filters + public API | 3 | 5 | 8 |
| 8 — Admin (enhance) | More admin endpoints | 4 | 4 | 8 |
| 9 — Analytics | Aggregation queries | 4 | 4 | 8 |
| 10 — Compliance/KYC | Guards + audit | 4 | 2 | 6 |
| 11 — Infrastructure | Migration, CI, RLS | 5 | 0 | 5 |
| **Total** | | **60** | **45** | **105** |

---

## 7. Definition of MVP Done

The MVP is complete when the following journeys work end-to-end with **real database data**:

| # | Journey | Status |
|---|---------|--------|
| 1 | Miner registers → completes onboarding → uploads KYC docs → profile saved | ✅ Mostly done |
| 2 | Admin verifies miner → miner creates listing → admin publishes it | ✅ Mostly done |
| 3 | Investor browses marketplace → clicks Buy Now → checkout → order created | ❌ Missing |
| 4 | Seller sees new order notification → confirms → marks shipped → buyer marks delivered | ❌ Missing |
| 5 | Investor browses auctions → places bid → wins → order auto-created | ❌ Missing |
| 6 | Investor proposes contract → miner reviews → both sign → contract executed | ❌ Missing |
| 7 | User opens ChatAgent → chats with "Jatau" AI → gets market intelligence | ❌ Missing |
| 8 | Admin dashboard shows pending KYC, pending listings, and order volume | ❌ Partial |

**All Phase 1–8 tasks must be completed to turn journeys 3–8 from ❌ to ✅.**

---

## 8. Quick Wins — Start Here

These deliver immediate value with zero upstream dependencies:

1. 🔴 **Add `ValidationPipe` globally** — single line change in `main.ts`, immediately safer
2. 🔴 **Add `GET /api/listings` (public with filters)** — unlocks real marketplace data on the frontend today
3. 🔴 **Add `GET /api/auth/me`** — simplifies frontend AuthContext; removes repeated profile fetches
4. 🔴 **Create `AuditLogService`** — needed by every future module; build it early
5. 🔴 **Create `DocumentsModule`** — blocks all KYC file uploads throughout the system

---

*Analysis complete — 2026-06-26. Use this document as the single source of truth for MVP sprint planning.*
