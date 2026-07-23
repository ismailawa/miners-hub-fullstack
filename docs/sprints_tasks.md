# Miners Hub Sprint Tasks

This checklist is the progress tracker for Miners Hub development. Codex should update task status before and after implementation work.

Status legend:

- `[ ]` Not started
- `[/]` In progress
- `[x]` Completed
- `[!]` Blocked

## Sprint 1: Platform Hardening and Documentation

### Story 1.1: Product and Technical Baseline

- [x] Generate Miners Hub Product Requirements Document.
- [x] Generate Miners Hub System Architecture document.
- [x] Generate Miners Hub UI/UX Specification.
- [x] Create Codex Miners Hub workflow skill.
- [x] Audit current project implementation and update completed sprint tasks.
- [x] Rename project documentation and workflow references to Miners Hub.
- [x] Add professional Miners Hub logo and favicon assets across the app shell.
- [x] Create dedicated database schema document from current TypeORM entities and proposed Miners Hub extensions.
- [x] Document current API contracts for frontend/backend integration.

### Story 1.2: Core Platform Stability

- [x] Silence TypeScript 6 baseUrl deprecation warning in frontend and backend configs.
- [x] Review authentication, refresh token, and role guard behavior.
- [x] Review KYC flow and admin verification state handling.
- [x] Review document upload, review, deletion, and access authorization.
- [x] Review notification and chat real-time update reliability.
- [x] Review audit log coverage for admin and regulated actions.
- [x] Persist revoked refresh tokens outside process memory.
- [x] Add audit logging for document upload/delete and listing create/update/delete.

### Story 1.3: Implemented MVP Capabilities Found in Codebase

- [x] Implement user registration, login, logout, refresh token, and authenticated profile retrieval.
- [x] Implement role guards and admin-only route protection.
- [x] Implement MetaMap-style KYC start, completion, status tracking, and onboarding lock state.
- [x] Implement miner and investor profile creation/update during onboarding.
- [x] Persist onboarding drafts, resume exact step, and gate investment/sales actions until verification.
- [x] Implement document upload, secure owner/admin retrieval, deletion, and admin review.
- [x] Implement media/image upload for listings.
- [x] Implement marketplace listing creation, update, deletion, published browsing, filtering, and admin approval.
- [x] Implement buy-now orders with status transitions and status history.
- [x] Implement Flutterwave escrow payment initiation, webhook handling, release, refund, and seller payout account management.
- [x] Implement contracts with proposal, status transitions, local signatures, SignNow links, sync, and webhook handling.
- [x] Implement auctions, bid placement, bid history, auction finalization, and winning-bid order creation.
- [x] Implement user notifications, unread counts, mark-read, and mark-all-read.
- [x] Implement real-time chat threads, messages, unread counts, read states, and Socket.IO updates.
- [x] Implement forum posts and replies.
- [x] Implement public/admin events.
- [x] Implement AI chat, market summary, and price forecast endpoints/UI.
- [x] Implement authenticated dashboard shell with overview, messages, profile, contracts, orders, transactions, listings, tasks, marketplace, and admin sections.
- [x] Implement public pages for marketplace, logistics, warehousing, services, forum, news, knowledge base, analytics, registration guide, terms, privacy, and about.

## Sprint 2: Registry, GIS, Compliance, and Reporting

### Story 2.1: Miner Registry

- [x] Build admin miner registry list from users, miner profiles, KYC, and documents.
- [x] Build miner registry detail view with verification state and timeline.
- [x] Add registry filters for role, verification status, document status, location, and mineral focus.
- [!] Add cross-role registry filters when investor, laboratory, logistics, financier, and insurer registries are introduced. Blocked until those registries exist.
- [x] Add cooperative and partner profile fields where required.

### Story 2.2: GIS Mine Mapping

- [x] Add mine site domain model and migration.
- [x] Fix TypeORM nullable column metadata for mine-site and related domain entities.
- [x] Add mine site CRUD API endpoints.
- [x] Add mine site map UI with filters and site detail drawer.
- [x] Link mine sites to miners, licenses, production reports, compliance cases, and environmental records.
- [x] Evaluate PostGIS enablement for geospatial queries.

### Story 2.3: Licensing and Compliance

- [x] Add license domain model and migration.
- [x] Add license submission and admin review workflows.
- [x] Add license expiry reminders and status indicators.
- [x] Add compliance case domain model and migration.
- [x] Add inspection scheduling and compliance case board.

### Story 2.4: Production Reporting

- [x] Add production report domain model and migration.
- [x] Add miner production report submission flow.
- [x] Add admin/regulator production report review queue.
- [x] Add royalty-ready fields and estimate panel.
- [x] Add production analytics dashboard.

## Sprint 3: Marketplace, Logistics, Laboratory, and Traceability

### Story 3.1: Marketplace Trust and Search

- [x] Improve marketplace filters for mineral, location, grade, verification, price, quantity, and listing type.
- [x] Add verified seller and document/lab badges to listing cards and detail pages.
- [x] Add due diligence pack section to listing detail.
- [x] Improve order and escrow timeline clarity.
- [x] Add frontend controls for existing backend min/max price filters.
- [x] Add marketplace filters for grade, quantity, and seller verification status.

### Story 3.2: Logistics Management

- [x] Add logistics provider profile model.
- [x] Add shipment domain model and migration.
- [x] Add logistics quote request flow.
- [x] Add shipment milestone tracking and proof of delivery upload.
- [x] Link shipments to orders and mineral passports.
- [x] Implement public logistics information, quote form UI, and demo shipment tracking UI.
- [x] Persist logistics quote requests through backend API.

### Story 3.3: Laboratory Integration

- [x] Add laboratory partner profile model.
- [x] Add lab result domain model and migration.
- [x] Add lab test request workflow.
- [x] Add lab certificate upload and admin verification.
- [x] Link lab results to listings, production reports, and mineral passports.

### Story 3.4: Mineral Passport and Traceability

- [x] Add mineral passport domain model and migration.
- [x] Add passport generation from site, license, production, lab, listing, order, logistics, contract, and escrow data.
- [x] Add passport detail UI with certificate and timeline.
- [x] Add public QR verification endpoint and page.
- [x] Add passport status model for active, revoked, disputed, and expired states.

## Sprint 4: Environment, Revenue, Investor Services, and Mobile

### Story 4.1: Environmental Monitoring

- [x] Add environmental record domain model and migration.
- [x] Add environmental inspection and incident reporting forms.
- [x] Add site-linked environmental dashboard.
- [x] Add remediation task tracking and evidence uploads.
- [x] Add community-safe reporting view with restricted private fields.

### Story 4.2: Revenue Analytics

- [x] Add revenue analytics endpoint aggregating orders, escrow, fees, and commissions.
- [x] Add royalty analytics from production reports and verified transaction data.
- [x] Add dashboard filters by period, mineral, LGA, site, and status.
- [x] Add exportable government revenue reports.

### Story 4.3: Investor Portal

- [x] Add investor opportunity domain model and migration.
- [x] Add opportunity publishing workflow.
- [x] Add investor inquiry tracking.
- [x] Add opportunity detail with due diligence documents and risk indicators.
- [x] Add analytics subscription hooks for investor intelligence.

### Story 4.4: Mobile/PWA Field Workflows

- [x] Audit current responsive behavior for field-critical screens.
- [x] Add mobile-first production report capture.
- [x] Add mobile-first inspection and environmental evidence upload.
- [x] Add offline queueing strategy for field submissions.
- [x] Add location capture for site, inspection, and incident records.
