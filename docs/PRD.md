# Miners Hub - Product Requirements Document

**Author:** ismailawa
**Date:** 2025-11-05
**Version:** 1.0

---

## Executive Summary

Miners Hub connects Nigeria's mineral producers, investors, and regulators on one trusted digital platform — powering transparent trade, verified data, and smarter decisions across the mining value chain.

### What Makes This Special

The "magic" of Miners Hub happens when users realize they can:

1. **Instantly discover real, verified mineral listings** from across Nigeria with rich filtering and AI-powered insights
2. **Chat directly with verified miners or investors** without intermediaries or brokers
3. **See AI-powered market insights** (via Gemini) explaining price movements and investment opportunities in clear, local context

That transformative moment occurs when a first-time visitor filters listings, opens a miner profile, and sees live data + AI commentary in one seamless, modern UI. This combination of transparency, direct connection, and intelligent analysis creates trust and efficiency in an industry historically fragmented by geography and intermediaries.

---

## Project Classification

**Technical Type:** Full-Stack Web Application (Frontend: Next.js SPA, Backend: NestJS API)
**Domain:** Mineral Trading & Resource Marketplace
**Complexity:** Medium-High (Regulated industry with compliance requirements)

**Project Structure:**
- **Frontend Framework:** Next.js (React + TypeScript + shadcn/ui)
- **Backend Framework:** NestJS (Node.js + TypeScript)
- **Database:** Supabase (PostgreSQL with real-time capabilities)
- **ORM:** TypeORM for database operations
- **Styling:** Tailwind CSS exclusively
- **State Management:** React Context for global state
- **API Integration:** RESTful API endpoints via NestJS backend
- **AI Integration:** Google Gemini API
- **Architecture:** Full-stack application with frontend (Next.js) and backend (NestJS) communicating via API, with Supabase as the database layer

### Domain Context

Nigeria's mineral trading industry requires:
- **KYC/AML Compliance:** Mandatory verification for all participants
- **Government Oversight:** Regulatory monitoring and reporting
- **Fraud Prevention:** Detection of duplicate listings, suspicious activity
- **Audit Trails:** Complete transaction history for compliance
- **Content Moderation:** Protection against scams and prohibited content

These regulatory requirements shape authentication, data retention, and audit logging throughout the platform.

---

## Success Criteria

The success of Miners Hub is measured by specific, meaningful metrics that reflect platform trust and user value:

| Metric | Target | Description |
|--------|--------|-------------|
| 🕐 **Listing Approval Time** | < 24 hours | Time from miner submission to visible marketplace (MVP simulated; later automated) |
| 🤝 **Buyer-Seller Match Rate** | ≥ 60% | Percentage of listings receiving ≥1 investor inquiry |
| ⚙️ **Transaction Dispute Rate** | < 2% | Percentage of total closed trades resulting in disputes |
| 🌟 **User Satisfaction (NPS)** | ≥ 65 | Overall experience benchmark |
| 🔐 **Verified User Coverage** | ≥ 90% | Percentage of active accounts KYC-verified |

### Business Metrics

- **Platform Trust Indicator:** Dispute rate below 2% demonstrates effective fraud prevention and user verification
- **Engagement Effectiveness:** 60% match rate shows marketplace liquidity and user intent alignment
- **Compliance Credibility:** 90% KYC coverage ensures regulatory readiness and platform legitimacy

Success means users experience seamless discovery of verified opportunities and make informed decisions through AI-enhanced insights, while maintaining the highest standards of transparency and compliance.

---

## Product Scope

### MVP - Minimum Viable Product

Core functionality for demonstration and initial adoption:

**Public Site:**
- Home page with hero, partners, mineral prices, how it works, featured miners, map, events, testimonials, newsletter
- Marketplace page with Buy Now and Auction tabs, advanced filtering, listing cards, pagination
- Informational pages: News, Services, Logistics, Warehousing, Registration Guide, Knowledge Base, Forum, Data & Analytics, Privacy Policy, Terms & Conditions, About Us

**Authentication & Onboarding:**
- User registration and login (full-screen pages)
- Multi-step onboarding: Role selection (Miner/Investor/Government), Personal Info, Business Info, Role-specific details, Document Upload (KYC stub)
- Document upload with preview and removal
- Final review step before submission

**Role-Based Dashboards:**
- **Miner:** Stats (active listings, pending contracts, revenue), quick actions (Create Listing, Manage Contracts)
- **Investor:** Stats (active investments, pending contracts), quick actions (Browse Marketplace, Manage Profile)
- **Government:** High-level stats (total registered miners, total listings, export volume charts)

**Marketplace Features:**
- Create and browse mineral listings (Buy Now + Auction simulations)
- Listing attributes: grade/purity, quantity, location, moisture %, documentation, asking price, delivery terms
- Auction countdown timers
- Listing detail modals

**AI Features:**
- ChatAgent (Gemini) for informational support (Jatau, Nigerian mining officer persona)
- AI Market Summary on Data & Analytics page (Gemini-powered insights)

**Core UX:**
- Theme toggle (Light/Dark) with localStorage persistence (client-side preference)
- Notification system with unread badges (stored in Supabase, real-time via subscriptions)
- Responsive design (mobile, tablet, desktop)

### Growth Features (Post-MVP)

**Enhanced Transactions:**
- Real-time bidding with anti-sniping (extend 5 min if bid in last 2 min)
- Escrow simulation (10% deposit lock)
- Contract workflow with e-signatures (SignaturePad component)
- Payment window management (48h after winning bid)

**Advanced Analytics:**
- Gemini-driven market insights dashboard
- Role-specific analytics portals (Government data dashboards, Investor portfolio view)
- Export functionality for reports

**Communication & Notifications:**
- Email/SMS notifications
- Push alerts
- Enhanced chat functionality

**Internationalization:**
- Multi-language support
- Multi-currency support

**Enterprise Integration:**
- Government data export APIs
- Enterprise reporting tools

### Vision (Future)

**Blockchain & Provenance:**
- Full blockchain-based provenance for minerals (traceability from mine to buyer)
- Immutable transaction records

**Payment & Escrow:**
- Integration with real payment gateways
- Professional escrow services
- Automated settlement

**Advanced AI:**
- AI-driven market forecasting
- Automated fraud detection
- Compliance auditing automation

**Geospatial Intelligence:**
- Satellite or IoT data overlays for mine activity tracking
- Real-time location-based insights

**Open Platform:**
- Open API for government & enterprise integration
- Third-party developer ecosystem
- Marketplace for extensions

---

## Domain-Specific Requirements

### Compliance & Regulatory

**KYC/AML Requirements:**
- Mandatory verification for all Miners & Investors
- Upload government-issued ID, mining licence, business registration docs
- Government role verifies and approves submissions
- Verification status visible on profiles

**Content Moderation:**
- Listings, documents, and chats scanned for prohibited content and scams
- Manual review in MVP, automated detection in growth phase
- Flagging system for suspicious content

**Fraud Detection:**
- Detect abnormal activity: duplicate listings, suspicious bids, repetitive messaging patterns
- Automated alerts for review
- User reputation scoring

**Data Retention:**
- Transaction & chat logs retained 5 years (simulated in MVP)
- Immutable audit trails
- Compliance reporting capabilities

**Audit Trails:**
- Every financial or contract action logged with user ID + timestamp
- Audit logs stored in Supabase `audit_logs` table
- Immutable, append-only log records via TypeORM
- Exportable logs for regulatory review via NestJS API

### Industry Standards

**Mineral Categories Supported:**
Gold, Tin, Columbite, Limestone, Coal, Lead/Zinc, Gypsum, Lithium, Granite, Others

**Listing Attributes:**
- Grade/purity specifications
- Quantity (tons)
- Location (state/LGA)
- Moisture percentage
- Documentation (licence PDFs)
- Asking price
- Delivery terms

These domain requirements ensure the platform meets Nigerian mining industry standards and regulatory expectations.

---

## Web Application Specific Requirements

### User Interface Architecture

**Responsive Design:**
- Mobile-first approach
- Breakpoints: mobile (320px+), tablet (768px+), desktop (1024px+)
- Touch-friendly interactions on mobile

**Component-Based Architecture:**
- Reusable UI components (Header, Footer, Cards, Modals, Forms)
- Consistent design system with Tailwind CSS
- Theme-aware components (light/dark mode)

**State Management:**
- React Context for global state (authentication, notifications, theme)
- Local component state for UI interactions
- API client for backend data operations (NestJS endpoints)
- Supabase real-time subscriptions for live data updates (chats, bids, notifications)
- LocalStorage for client-side preferences only (theme preference, temporary UI state)

### Navigation & Routing

**Public Routes:**
- Home, Marketplace, News, Services, Logistics, Warehousing, Registration Guide, Knowledge Base, Forum, Data & Analytics, Privacy Policy, Terms, About Us

**Authentication Routes:**
- Login, Register (full-screen, replace Header/Footer layout)

**Authenticated Routes:**
- Dashboard (role-based), Profile (with tabs), Contracts, Payment Checkout

**Route Protection:**
- Guest-only routes (Login, Register)
- Authenticated-only routes (Dashboard, Profile, Contracts)
- Role-based access control

### Data Persistence

**Backend Architecture:**
- **NestJS API:** RESTful endpoints for all data operations (CRUD operations, authentication, business logic)
- **Supabase Database:** PostgreSQL database with the following core tables:
  - `users` - User accounts and profiles
  - `miners` - Miner-specific information and verification data
  - `investors` - Investor profiles and preferences
  - `listings` - Mineral listings (Buy Now & Auctions)
  - `auctions` - Auction-specific data and bidding history
  - `bids` - Auction bid records
  - `orders` - Purchase and sales history
  - `contracts` - Contract proposals and signed contracts
  - `chats` - Chat messages and conversations
  - `notifications` - User notifications
  - `audit_logs` - Compliance and audit trail records
  - `documents` - KYC documents and listing attachments
- **TypeORM:** Entity models and database migrations for schema management
- **Supabase Features:** 
  - Row Level Security (RLS) for data access control
  - Real-time subscriptions for live updates (chats, bids, notifications)
  - Authentication and authorization via Supabase Auth
  - Storage for document uploads (KYC docs, listing attachments)

**Frontend Data Handling:**
- API client for communicating with NestJS backend
- React Context for global state management (auth, notifications, theme)
- LocalStorage for client-side preferences only (theme preference, temporary UI state)
- Optimistic UI updates with server synchronization

### Backend Architecture Details

**NestJS Application Structure:**
- **Modules:** Feature-based modules (auth, users, listings, auctions, contracts, chats, notifications, analytics)
- **Controllers:** RESTful API endpoints with proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **Services:** Business logic layer with TypeORM repository pattern
- **Entities:** TypeORM entity classes mapped to Supabase database tables
- **DTOs:** Data Transfer Objects for request/response validation using class-validator
- **Guards:** Authentication and authorization guards (JWT, role-based)
- **Interceptors:** Logging, error handling, and response transformation
- **Pipes:** Validation and transformation pipes for incoming data

**API Endpoints Structure:**
- `/api/auth` - Authentication (register, login, logout, refresh token)
- `/api/users` - User management (profile, update, roles)
- `/api/listings` - Marketplace listings (CRUD, search, filter)
- `/api/auctions` - Auction management (create, bid, status)
- `/api/contracts` - Contract proposals and management
- `/api/orders` - Order processing and history
- `/api/chats` - Direct messaging endpoints
- `/api/notifications` - Notification management
- `/api/analytics` - Data analytics and reports
- `/api/documents` - File upload and management

**TypeORM Integration:**
- Entity definitions with decorators (@Entity, @Column, @PrimaryGeneratedColumn, @ManyToOne, @OneToMany, etc.)
- Database migrations for schema versioning
- Repository pattern for data access
- Query builder for complex queries
- Transaction support for critical operations (payments, contracts)

**Supabase Integration:**
- Supabase client configured in NestJS for direct database access
- TypeORM configured to use Supabase PostgreSQL connection
- Supabase Auth integration for user authentication
- Supabase Storage for file uploads (documents, images)
- Supabase Realtime subscriptions for live updates (handled on frontend)

**Authentication & Authorization:**
- JWT-based authentication via Supabase Auth
- Role-based access control (RBAC) with NestJS guards
- Row Level Security (RLS) policies in Supabase for additional data protection
- Session management with refresh tokens

**Error Handling:**
- Global exception filter for consistent error responses
- Custom exception classes for business logic errors
- Validation error messages via class-validator
- HTTP status codes following REST best practices

### AI Integration

**Google Gemini API (via NestJS Backend):**
- **API Route:** `/api/ai/chat` and `/api/ai/market-summary`
- **ChatAgent:** Conversational interface with streaming responses
  - Frontend sends messages to NestJS endpoint
  - NestJS backend calls Gemini API with system instruction: "Jatau, a professional Nigerian mining officer"
  - Streaming responses forwarded to frontend via Server-Sent Events (SSE) or WebSocket
  - Session history maintained in Supabase database
- **AI Market Summary:** Automatic generation on page load with market data analysis
  - Frontend requests summary from `/api/ai/market-summary`
  - Backend queries market data from Supabase, sends to Gemini API
  - Returns formatted markdown summary to frontend
- **Security:** API keys stored in backend environment variables, never exposed to frontend

---

## User Experience Principles

### Visual Personality

**Modern, Professional, Clean, Trustworthy:**
- Clean, uncluttered layouts that prioritize information hierarchy
- Data-rich without feeling overwhelming
- Professional color palette (slate-50/800 light, charcoal/off-white dark)
- Amber-600 (light) / Yellow (dark) accent for CTAs and highlights

### Key Interaction Patterns

**The Magic Moment - Discovery Flow:**
1. User lands on Home → sees hero with animated slideshow
2. Scrolls to Mineral Prices → sees live-updating data
3. Clicks "Browse Marketplace" → filters by mineral type and location
4. Opens a listing → sees detailed info + AI commentary
5. Clicks miner profile → sees verification badges, gallery, contact options
6. Initiates chat → direct connection established

**The UI should reinforce this seamless discovery through:**
- Smooth animations (fade-in-down for hero, slide-in for onboarding)
- Clear visual hierarchy (verified badges, status indicators)
- Intuitive navigation (sticky header with search, theme toggle)
- Responsive feedback (loading states, hover effects, micro-interactions)

### Critical User Flows

**Miner Listing Creation:**
1. Dashboard → "Create Listing"
2. Form with mineral type, attributes, pricing, delivery terms
3. Document upload (licences, certificates)
4. Preview → Submit → Under Review status
5. Published → visible in Marketplace

**Investor Purchase Flow (Buy Now):**
1. Marketplace → Filter and browse
2. Click listing → Detail modal
3. "Buy Now" → Checkout page
4. Order summary + simulated payment form
5. Submit → Order confirmed → Order tracking

**Auction Bidding Flow:**
1. Marketplace → Auction tab
2. Select listing with countdown timer
3. View current bids → Place bid
4. Anti-sniping extension if bid in last 2 min
5. Win → Payment window (48h) → Contract generation

**Contract Workflow:**
1. Investor proposes contract from listing
2. Pre-filled template with terms
3. Miner reviews → Accept or Counter
4. Both parties sign (SignaturePad)
5. Contract status: Draft → Pending → Signed → Executed

---

## Functional Requirements

### FR-1: User Management & Authentication

**FR-1.1: User Registration**
- Users can register with email, password, and basic info
- Registration stores data via NestJS API to Supabase database
- Validation: email format, password strength (min 8 chars)
- **Acceptance Criteria:** User created in database via API, redirected to onboarding

**FR-1.2: User Login**
- Users can login with email and password
- Authentication via Supabase Auth, validated through NestJS API
- Authentication state stored in AuthContext
- Session persists across page refreshes (Supabase session token)
- **Acceptance Criteria:** User logged in via API, redirected to dashboard, auth state maintained

**FR-1.3: Multi-Step Onboarding**
- Step 1: Role Selection (Miner/Investor/Government)
- Step 2: Personal Info (name, email, phone, address)
- Step 3: Business Info (company name, registration number, tax ID)
- Step 4: Role-Specific Details (mining licence for miners, investment focus for investors)
- Step 5: Document Upload (KYC docs: ID, licence, registration)
- Step 6: Review & Submit
- **Acceptance Criteria:** All steps navigable, data persists, final submission sets user status to "pending"

**FR-1.4: Profile Management**
- Users can view and edit personal/business information
- Profile tabs: Overview, Info, My Listings (Miner only), Task Management (Miner only), Contracts, My Orders, Security, Notifications
- **Acceptance Criteria:** All profile sections accessible, data editable, changes persist

**FR-1.5: Role-Based Access Control**
- Miner: Create listings, manage contracts, upload docs, chat with investors
- Investor: Browse listings, place bids, buy now, propose contracts, manage orders
- Government: Verify users/listings, monitor transactions, generate reports
- Admin: Full CRUD access, content moderation, dispute resolution
- **Acceptance Criteria:** Users see only authorized features, unauthorized routes blocked

### FR-2: Marketplace & Listings

**FR-2.1: Create Mineral Listing**
- Miners can create listings with: mineral type, grade/purity, quantity (tons), location (state/LGA), moisture %, documentation uploads, asking price, delivery terms
- Listing states: draft → submitted → under review → published → sold/expired/archived
- Draft listings editable by miner
- **Acceptance Criteria:** Listing created via API and stored in Supabase database, visible in miner's "My Listings" tab

**FR-2.2: Browse & Filter Listings**
- Public marketplace with Buy Now and Auction tabs
- Filtering: search, mineral type, location, grade
- Responsive grid of listing cards
- Pagination for large result sets
- **Acceptance Criteria:** Filters work correctly, listings display in grid, pagination functional

**FR-2.3: Listing Detail View**
- Clicking listing opens detail modal (ListingDetailModal or AuctionDetailModal)
- Shows all attributes, miner profile link, action buttons (Buy Now / Place Bid)
- Auction listings show countdown timer and current bids
- **Acceptance Criteria:** Modal opens with all data, interactions functional, countdown accurate

**FR-2.4: Listing Lifecycle Management**
- Miners can edit draft listings
- Published listings appear in marketplace
- Sold or expired listings automatically archived
- **Acceptance Criteria:** Lifecycle transitions work, archived listings hidden from marketplace

### FR-3: Auction System

**FR-3.1: Auction Creation**
- Miners can create auction listings with duration (24h - 7 days)
- Starting bid and reserve price (optional)
- **Acceptance Criteria:** Auction created with countdown timer, visible in Auction tab

**FR-3.2: Bidding**
- Investors can place bids on auction listings
- Bid validation: must be higher than current bid
- Anti-sniping: extend 5 minutes if bid placed in last 2 minutes
- **Acceptance Criteria:** Bids accepted, countdown extends correctly, highest bid wins

**FR-3.3: Escrow & Deposit**
- 10% escrow lock on winning bid (stored in database)
- Payment window: 48 hours after auction ends
- **Acceptance Criteria:** Escrow recorded in Supabase database, payment window enforced via backend logic

**FR-3.4: Auction Completion**
- Highest valid bid wins
- Winner notified, payment window starts
- If payment fails, next highest bidder notified
- **Acceptance Criteria:** Winner determined correctly, notifications sent, payment flow initiates

### FR-4: Buy Now Transactions

**FR-4.1: Checkout Flow**
- Buyer selects "Buy Now" from listing detail
- Checkout page with order summary (listing details, price, delivery terms)
- Simulated credit card form (dummy data)
- **Acceptance Criteria:** Checkout page loads with correct data, form submission creates order

**FR-4.2: Order Management**
- Order states: initiated → paid → confirmed → shipped → completed/refunded
- Buyers and sellers can view order history
- Order tracking modal (OrderTrackingModal)
- **Acceptance Criteria:** Orders created with correct state, state transitions work, tracking accessible

**FR-4.3: Payment Simulation**
- Simulated payment processing (dummy credit card form)
- Payment success/failure handling
- Wallet balance updates (simulated)
- **Acceptance Criteria:** Payment simulation works, order state updates, wallet reflects changes

**FR-4.4: Refund Processing**
- Refund triggers (buyer request, seller cancellation, dispute resolution)
- Refund processed in simulated wallet
- Order state updated to "refunded"
- **Acceptance Criteria:** Refunds process correctly, wallet balance updates, order state reflects refund

### FR-5: Contract Management

**FR-5.1: Contract Proposal**
- Investors can propose contract from marketplace listing
- Pre-filled template with terms from listing
- Customizable terms (negotiable)
- **Acceptance Criteria:** Contract proposal created, visible to miner, terms editable

**FR-5.2: Contract Review & Signing**
- Contract detail page shows all terms, signatures, status
- SignaturePad component for digital signatures
- Signing flow: Miner reviews → Accepts → Both parties sign → Contract executed
- **Acceptance Criteria:** Contract signing flow works, signatures captured, status updates correctly

**FR-5.3: Contract Status Management**
- Contract states: Draft → Pending → Signed → Executed
- Status visible to both parties
- Contract history maintained
- **Acceptance Criteria:** Status transitions work, both parties see updates, history preserved

### FR-6: Communication & Chat

**FR-6.1: Direct Messaging**
- Users can chat directly with verified miners/investors
- Chat history stored in Supabase database
- Real-time updates via Supabase real-time subscriptions
- **Acceptance Criteria:** Messages sent/received via API, history persists in database, real-time chat functional

**FR-6.2: ChatAgent (AI Support)**
- Floating action button opens chat window
- Frontend sends messages to NestJS backend API endpoint `/api/ai/chat`
- Backend calls Gemini API with "Jatau" persona system instruction
- Streaming responses forwarded from backend to frontend via SSE/WebSocket
- Session history maintained in Supabase database
- **Acceptance Criteria:** Chat opens, messages sent to API, streaming responses received, history persists in database

### FR-7: AI Features

**FR-7.1: AI Market Summary**
- Data & Analytics page includes AI Market Summary component
- On component load, frontend calls NestJS backend endpoint `/api/ai/market-summary`
- Backend queries current market data from Supabase database
- Backend sends market data to Gemini API for analysis
- Generates concise, bulleted summary with actionable insights
- Markdown formatting parsed and displayed on frontend
- **Acceptance Criteria:** Summary generates on load via API call, insights displayed, formatting correct, data sourced from database

**FR-7.2: AI-Powered Insights**
- AI commentary on mineral prices and trends
- Context-aware explanations (Nigerian market focus)
- **Acceptance Criteria:** Insights relevant, contextually appropriate, enhance user understanding

### FR-8: Dashboard & Analytics

**FR-8.1: Role-Based Dashboards**
- **Miner Dashboard:** Stats (active listings, pending contracts, revenue), quick actions (Create Listing, Manage Contracts)
- **Investor Dashboard:** Stats (active investments, pending contracts), quick actions (Browse Marketplace, Manage Profile)
- **Government Dashboard:** High-level stats (total registered miners, total listings, export volume charts)
- **Acceptance Criteria:** Correct dashboard displayed per role, stats accurate, quick actions functional

**FR-8.2: Data & Analytics Page**
- Market data visualization
- AI Market Summary
- Export functionality (growth phase)
- **Acceptance Criteria:** Data displays correctly, AI summary generates, export works (if implemented)

### FR-9: Content & Information Pages

**FR-9.1: Public Information Pages**
- Home, News, Services, Logistics, Warehousing, Registration Guide, Knowledge Base, Forum, Data & Analytics, Privacy Policy, Terms & Conditions, About Us
- All pages responsive and accessible
- **Acceptance Criteria:** All pages load, content displays, navigation works

**FR-9.2: Home Page Sections**
- Hero with background slideshow, animated title/subtitle, CTA buttons
- Partners marquee (continuous scrolling)
- Mineral Prices table (live-updating with change indicators)
- How It Works (animated roadmap/timeline)
- Featured Miners grid (with MinerDetailModal)
- Interactive SVG map of Nigeria (hover shows mineral deposits)
- Events section
- Newsletter subscription form
- Testimonials (horizontally scrollable, video player modal)
- **Acceptance Criteria:** All sections render, animations work, interactions functional

### FR-10: Theme & Personalization

**FR-10.1: Theme Toggle**
- Light/Dark mode toggle in header
- Preference saved in localStorage (client-side only, no backend needed)
- CSS custom properties for theming
- **Acceptance Criteria:** Theme switches, preference persists in localStorage, all components theme-aware

**FR-10.2: Notification System**
- Global notification center with unread badge
- In-app notifications and toasts
- Notification preferences management
- **Acceptance Criteria:** Notifications display, badge updates, preferences save

### FR-11: Compliance & Verification

**FR-11.1: KYC Document Upload**
- Multi-file upload with previews
- File removal capability
- Document types: ID, mining licence, business registration
- **Acceptance Criteria:** Files upload, previews show, removal works, documents stored

**FR-11.2: Verification Status**
- Verification status visible on profiles
- Government role verifies submissions
- Verification badges displayed
- **Acceptance Criteria:** Status visible, verification process works, badges display correctly

**FR-11.3: Content Moderation**
- Listings, documents, chats scanned (manual in MVP)
- Flagging system for suspicious content
- **Acceptance Criteria:** Moderation flags work, suspicious content identified

**FR-11.4: Fraud Detection**
- Detect duplicate listings
- Flag suspicious bids
- Identify repetitive messaging patterns
- **Acceptance Criteria:** Detection algorithms work, alerts generated, suspicious activity flagged

---

## Non-Functional Requirements

### Performance

**Page Load Performance:**
- Time to Interactive (TTI) < 3 seconds on 4G connection
- Table data loads < 500ms when cached
- Optimized images and assets
- Code splitting for large components

**Runtime Performance:**
- Smooth scrolling and animations (60fps)
- Responsive interactions (button clicks, form submissions < 100ms feedback)
- Efficient API calls with request caching and debouncing
- Minimal re-renders (React optimization)
- Database query optimization via TypeORM and Supabase indexing

**Acceptance Criteria:** Performance targets met, Lighthouse scores > 90, smooth UX across devices

### Security

**Data Protection:**
- HTTPS enforced (production)
- XSS mitigation (input sanitization, React's built-in protections)
- CSRF protection (token-based via NestJS)
- No secret keys in frontend code
- Environment variables for API keys and secrets
- Supabase Row Level Security (RLS) for database access control
- TypeORM entity validation for data integrity

**Authentication Security:**
- Password strength requirements
- Secure session management
- Role-based access control enforced
- **Acceptance Criteria:** Security measures implemented, vulnerabilities mitigated

### Scalability

**Frontend Scalability:**
- Support ≥ 10,000 concurrent users via static generation + client caching
- Efficient API data fetching and caching strategies
- Pagination for large datasets (server-side pagination via NestJS)
- Lazy loading for images and components
- Database query optimization via TypeORM

**Acceptance Criteria:** Platform handles target load, performance maintained under scale

### Availability

**Uptime Target:**
- 99.5% uptime (cloud or simulated local)
- Graceful error handling
- Offline mode support (localStorage fallback)
- Recovery after refresh

**Acceptance Criteria:** Uptime target met, error handling robust, offline mode functional

### Accessibility

**WCAG 2.1 AA Compliance:**
- Keyboard navigation for all interactive elements
- Color contrast ratios meet AA standards
- ARIA labels for screen readers
- Focus indicators visible
- Semantic HTML structure

**Acceptance Criteria:** WCAG 2.1 AA compliance verified, accessible to all users

### Privacy

**GDPR-Aligned Privacy:**
- User data stored in Supabase database with encryption at rest
- Privacy policy clearly states data usage
- User consent for data collection
- Right to deletion (data removal via NestJS API with cascade handling)
- Row Level Security (RLS) policies in Supabase for data access control

**Acceptance Criteria:** Privacy requirements met, GDPR-aligned practices implemented

### Auditability

**Immutable Audit Trails:**
- All major actions (auth, listing change, payment) timestamped
- User ID associated with every action
- Immutable once written (append-only log)
- Exportable for regulatory review

**Acceptance Criteria:** Audit trails complete, immutable, exportable

### Resilience

**Offline Support:**
- Service worker for offline capability (optional)
- Graceful degradation when API unavailable
- Recovery after page refresh (data fetched from Supabase)
- Data persistence via Supabase database across sessions
- Client-side caching for improved performance

**Acceptance Criteria:** Offline mode functional, data persists, recovery works

---

## Implementation Planning

### Epic Breakdown Required

Requirements must be decomposed into epics and bite-sized stories (200k context limit).

**Next Step:** Run `workflow create-epics-and-stories` to create the implementation breakdown.

---

## References

- Project Documentation: [docs/index.md](./index.md)
- Source Tree Analysis: [docs/source-tree-analysis.md](./source-tree-analysis.md)

---

## Next Steps

1. **Epic & Story Breakdown** - Run: `workflow create-epics-and-stories`
2. **UX Design** - Run: `workflow create-ux-design`
3. **Architecture** - Run: `workflow create-architecture`

---

_This PRD captures the essence of Miners Hub - connecting Nigeria's mineral producers, investors, and regulators through transparent trade, verified data, and AI-powered insights._

_Created through collaborative discovery between ismailawa and AI facilitator._
