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
- [x] Implement dashboard and API permission boundaries so users only see role-appropriate areas.
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
- [x] Allow users to exit onboarding while preserving their draft step.
- [x] Implement document upload, secure owner/admin retrieval, deletion, and admin review.
- [x] Implement media/image upload for listings.
- [x] Implement marketplace listing creation, update, deletion, published browsing, filtering, and admin approval.
- [x] Improve marketplace search with expandable professional filter controls.
- [x] Handle notification fetch failures without noisy console errors.
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
- [x] Make dashboard navigation groups collapsible.
- [x] Keep only the active dashboard navigation group open.
- [x] Improve home page global search experience.
- [x] Convert dashboard add and edit forms to modal flows.
- [x] Remove empty form columns and standardize dashboard search/filter panels.
- [x] Implement public pages for marketplace, logistics, warehousing, services, forum, news, knowledge base, analytics, registration guide, terms, privacy, and about.
- [x] Make trusted partner homepage section backend-managed and hidden when no partners are published.

## Sprint 2: Registry, GIS, Compliance, and Reporting

### Story 2.1: Miner Registry

- [x] Build admin miner registry list from users, miner profiles, KYC, and documents.
- [x] Build miner registry detail view with verification state and timeline.
- [x] Add registry filters for role, verification status, document status, location, and mineral focus.
- [x] Add cross-role registry filters for miner, investor, laboratory, and logistics records.
- [!] Add financier and insurer registry filters when those registries are introduced. Blocked until financier and insurer registries exist.
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

### Story 3.5: End-to-End Logistics Fulfillment Cycle

- [x] Define and enforce the full logistics state machine across quote request, quote, acceptance, shipment creation, pickup, transit, delivery, dispute, cancellation, order status, and escrow release readiness.
- [x] Add logistics provider categories for international carrier, local haulage, warehousing, customs/clearing, and last-mile delivery so flows can route requests to the right provider type.
- [x] Add Maersk as a proposed international shipment provider option with service coverage metadata for ocean, intermodal carrier haulage, multi-carrier inland transport, ground freight, customs/clearance handoff, and cargo tracking handoff.
- [x] Model international shipment handoff fields for port of loading, port of discharge, container type, incoterms, export documents, customs status, ocean carrier reference, container/B/L tracking number, and external tracking URL.
- [!] Add Maersk API integration settings for sandbox/production base URLs, client credentials, consumer key, OAuth token caching, webhook signing/verification, access scope, and provider feature flags. Blocked until Maersk developer credentials and webhook signing requirements are issued.
- [!] Integrate Maersk Ocean Track & Trace or Multi Carrier Tracking API where approved, mapping container, booking, B/L, SCAC, milestone, vessel, ETA, and event timestamps into Miners Hub shipment milestones. Blocked until Maersk API access is approved.
- [x] Add Maersk webhook ingestion for shipment/container tracking events so international shipment milestones update without manual polling when webhook access is enabled.
- [!] Add Maersk API fallback polling for tracking references where webhook access is unavailable, with retry handling, 404 party-scope messaging, and shipment-age limits. Blocked until Maersk API access is approved.
- [!] Evaluate Maersk Ocean Invoice Summary API access for invoice retrieval, then map invoice number, carrier, shipment reference, charges, taxes, currency, due date, payment status, and invoice document link into logistics cost records. Blocked until invoice API access is approved.
- [x] Add invoicing fallback for Maersk shipments when API access is not approved: manual invoice upload via Cloudinary, invoice metadata entry, approval workflow, and reconciliation against accepted logistics quote.
- [x] Add local logistics provider registration for companies and independent vehicle owners, including fleet/vehicle profiles, plate number, vehicle type, capacity, service areas, driver/contact details, compliance documents, insurance status, and availability.
- [x] Add vehicle request flow for local haulage from mine/site/warehouse to buyer, port, processor, or storage location, with route, cargo weight, pickup window, required vehicle type, loading constraints, and safety/compliance notes.
- [x] Match local vehicle requests to eligible available providers by service area, vehicle capacity, capability, verification status, and quote response SLA.
- [x] Add order-linked logistics quote requests from paid or confirmed orders with pickup, delivery, commodity, quantity, buyer, seller, and listing details prefilled from the order.
- [x] Add structured logistics quotes with provider assignment, ETA, route notes, cost breakdown, currency, validity window, and accepted-by metadata.
- [x] Let the correct party accept or decline quoted logistics costs, then automatically create or schedule the shipment from the accepted quote.
- [x] Add role-specific logistics work queues for admins, buyers, sellers, and logistics providers so each user sees only relevant quotes, assignments, and shipments.
- [x] Replace proof URL entry with Cloudinary-backed drop-zone uploads for pickup proof, checkpoint evidence, handoff documents, and proof of delivery.
- [x] Synchronize shipment milestones into order status history and move eligible orders through processing, shipped, delivered, awaiting escrow release, disputed, or cancelled states.
- [x] Add notifications for quote received, quote accepted or declined, provider assigned, pickup scheduled, shipment picked up, checkpoint update, delivered, disputed, and cancelled.
- [x] Replace demo public tracking data with live `/api/logistics/shipments/track/:trackingId` results and resilient empty/error states.
- [x] Automatically link delivered shipments to mineral passports and refresh passport snapshots with tracking ID, provider, route, milestones, and delivery evidence.
- [x] Add logistics dispute and cancellation rules that pause delivery completion and prevent escrow release until resolved.
- [x] Add seed data covering Maersk international carrier and local vehicle provider scenarios.
- [ ] Add end-to-end tests covering order payment, quote, acceptance, shipment creation, milestone updates, proof upload, delivery confirmation, passport update, and escrow release readiness.

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
- [x] Add public investor opportunities discovery page.

### Story 4.4: Mobile/PWA Field Workflows

- [x] Audit current responsive behavior for field-critical screens.
- [x] Add mobile-first production report capture.
- [x] Add mobile-first inspection and environmental evidence upload.
- [x] Add offline queueing strategy for field submissions.
- [x] Add location capture for site, inspection, and incident records.
