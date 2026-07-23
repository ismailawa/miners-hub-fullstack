# Miners Hub System Architecture

## 1. Architecture Overview

Miners Hub is structured as a cloud-first web platform with a Next.js frontend, NestJS backend, PostgreSQL database, object/media storage, third-party identity and payment integrations, real-time messaging, and future GIS, laboratory, logistics, mobile, and analytics services.

The existing implementation is organized as:

- Frontend: `miners-hub-frontend`, built with Next.js, React, TypeScript, and Tailwind CSS.
- Backend: `miners-hub-backend`, built with NestJS, TypeScript, TypeORM, PostgreSQL, Socket.IO, JWT authentication, throttling, and modular domain services.
- Infrastructure: Docker Compose files for local/dev orchestration.
- Integrations: MetaMap-oriented KYC fields/endpoints, Flutterwave escrow/payment flows, SignNow contract workflows, Cloudinary/media upload support, and AI endpoints.

## 2. Logical System Diagram

```text
Users
  |
  | Web / Mobile / PWA
  v
Next.js Frontend
  |
  | REST API + WebSocket
  v
NestJS API Gateway / Application Backend
  |
  +-- Auth, Users, Roles, KYC
  +-- Miner Registry and Investor Profiles
  +-- Listings, Marketplace, Auctions, Orders
  +-- Contracts and E-Signature
  +-- Escrow, Payments, Payout Accounts
  +-- Documents and Media
  +-- Chats, Notifications, Forum, Events
  +-- Admin, Audit Logs, AI Analytics
  +-- Future: GIS, Licensing, Production, Labs, Logistics, Environment
  |
  +-- PostgreSQL / PostGIS
  +-- Object Storage / CDN
  +-- External Providers
        +-- MetaMap KYC
        +-- Flutterwave Payments and Transfers
        +-- SignNow E-Signature
        +-- Laboratory APIs
        +-- Logistics APIs
        +-- GIS Map Tiles / Geocoding
        +-- AI Model Provider
```

## 3. Current Backend Modules

### Auth Module

Responsible for registration, login, logout, profile session retrieval, token refresh, JWT strategy, JWT guard, role decorators, and role guard enforcement.

Key endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/refresh`

### Users Module

Responsible for user profile operations, verified miner discovery, and seller payout account setup.

Key endpoints:

- `GET /users/miners/verified`
- `GET /users/profile`
- `PUT /users/profile`
- `GET /users/payout-account`
- `POST /users/payout-account`

### KYC Module

Responsible for starting, completing, and retrieving MetaMap-style KYC verification state.

Key endpoints:

- `POST /kyc/metamap/start`
- `POST /kyc/metamap/complete`
- `GET /kyc/status`

### Listings Module

Responsible for mineral listings, seller listing management, public listing browsing, listing detail, update, and deletion.

Key endpoints:

- `GET /listings`
- `GET /listings/my/all`
- `GET /listings/:id`
- `POST /listings`
- `PATCH /listings/:id`
- `DELETE /listings/:id`

### Orders Module

Responsible for order creation, order retrieval, payment initiation, cancellation, and status changes.

Key endpoints:

- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `POST /orders/:id/payment`
- `POST /orders/:id/cancel`
- `PATCH /orders/:id/status`

### Escrow Module

Responsible for Flutterwave-backed escrow initiation, webhook processing, admin release, refunds, and payout lifecycle support.

Key endpoints:

- `POST /orders/:id/escrow/initiate`
- `POST /escrow/flutterwave/webhook`
- `POST /admin/orders/:id/escrow/release`
- `POST /admin/orders/:id/escrow/refund`

### Contracts Module

Responsible for contract creation, retrieval, status updates, local signing, SignNow links, SignNow sync, and webhook handling.

Key endpoints:

- `POST /contracts`
- `GET /contracts`
- `GET /contracts/:id`
- `PATCH /contracts/:id/status`
- `POST /contracts/:id/sign`
- `GET /contracts/:id/signnow-link`
- `POST /contracts/:id/sync-signnow`
- `POST /webhooks/signnow`

### Documents and Media Modules

Responsible for file upload, document metadata, document retrieval, deletion, and admin document review.

Key endpoints:

- `POST /media/upload`
- `POST /documents/upload`
- `GET /documents`
- `GET /documents/:id`
- `DELETE /documents/:id`
- `GET /admin/documents`
- `PATCH /admin/documents/:id/review`

### Auctions Module

Responsible for auction creation, listing auctions, auction detail, bid placement, and bid retrieval.

Key endpoints:

- `POST /auctions`
- `GET /auctions`
- `GET /auctions/:id`
- `POST /auctions/:id/bids`
- `GET /auctions/:id/bids`

### Chats and Notifications Modules

Responsible for user-to-user conversations, thread retrieval, message read status, notifications, unread counts, and real-time updates.

Key endpoints:

- `POST /chats`
- `GET /chats/threads`
- `GET /chats/threads/:threadId`
- `PATCH /chats/:id/read`
- `GET /notifications`
- `GET /notifications/unread-count`
- `POST /notifications`
- `PATCH /notifications/read-all`
- `PATCH /notifications/:id/read`

### Admin Module

Responsible for administrative visibility and control across users, listings, orders, documents, and events.

Key endpoints:

- `GET /admin/users`
- `PATCH /admin/users/:id/verify`
- `GET /admin/listings`
- `PATCH /admin/listings/:id/status`
- `GET /admin/orders`
- `GET /admin/orders/:id`
- `GET /admin/events`
- `POST /admin/events`
- `PATCH /admin/events/:id`
- `DELETE /admin/events/:id`

### AI, Forum, and Events Modules

Responsible for market support, AI assistance, community knowledge exchange, and public/admin events.

Key endpoints:

- `POST /ai/chat`
- `GET /ai/market-summary`
- `POST /ai/forecast`
- `GET /forum/posts`
- `GET /forum/posts/:id`
- `POST /forum/posts`
- `POST /forum/posts/:id/replies`
- `GET /events`

## 4. Current Data Model

Current entities include:

- `User`: identity, role, status, phone, address, date of birth, profile image, KYC fields, onboarding status.
- `Miner`: miner business profile, license, company details, equipment, mineral focus, and relationship to listings.
- `Investor`: investor business profile, investment focus, company details, and order relationship.
- `Listing`: mineral type, quantity, price, grade, description, status, listing type, images, miner, auctions, orders, documents.
- `Order`: buyer, seller, listing, total amount, quantity, delivery address, payment status, status history, escrow.
- `EscrowTransaction`: order, buyer, seller, seller payout account, gross/net/fee amounts, provider references, payment link, release/refund/payout states, metadata.
- `SellerPayoutAccount`: user bank account details and verification state.
- `Contract`: parties, listing, terms, structured metadata, status, signatures, and signature timestamps.
- `Document`: user, listing, document type, file metadata, metadata, review status, notes, reviewer, review timestamp.
- `Auction`: listing, start/end time, starting/current bid, status, bids.
- `Bid`: auction, bidder, amount.
- `Chat`: sender, receiver, thread, message, read status.
- `Notification`: user, title, message, read status, notification type, metadata.
- `ForumPost` and `ForumReply`: community discussion content.
- `Event`: public event information and publication status.
- `AuditLog`: user, action, metadata, IP address, user agent.

## 5. Proposed Miners Hub Domain Extensions

### Mine Site

Represents a physical mining site.

Suggested fields:

- `id`
- `name`
- `operator_id`
- `license_id`
- `mineral_types`
- `state`
- `lga`
- `community`
- `latitude`
- `longitude`
- `boundary_polygon`
- `site_status`
- `risk_level`
- `created_at`
- `updated_at`

PostgreSQL should be extended with PostGIS for coordinates, polygons, proximity search, and map-layer queries.

### License

Represents mining permits and license lifecycle.

Suggested fields:

- `id`
- `holder_id`
- `site_id`
- `license_number`
- `license_type`
- `issuing_authority`
- `issue_date`
- `expiry_date`
- `status`
- `renewal_status`
- `documents`
- `review_notes`

### Compliance Case

Represents inspection findings, violations, corrective actions, and approvals.

Suggested fields:

- `id`
- `site_id`
- `subject_user_id`
- `case_type`
- `severity`
- `status`
- `assigned_to`
- `findings`
- `required_actions`
- `due_date`
- `closed_at`

### Production Report

Represents periodic mineral production reporting.

Suggested fields:

- `id`
- `site_id`
- `miner_id`
- `mineral_type`
- `period_start`
- `period_end`
- `quantity`
- `unit`
- `grade`
- `estimated_value`
- `royalty_due`
- `status`
- `submitted_at`
- `reviewed_by`

### Laboratory Result

Represents assay/certification results.

Suggested fields:

- `id`
- `lab_id`
- `requester_id`
- `listing_id`
- `production_report_id`
- `sample_reference`
- `mineral_type`
- `grade`
- `result_payload`
- `certificate_url`
- `status`
- `verified_at`

### Logistics Shipment

Represents order-linked transport and delivery tracking.

Suggested fields:

- `id`
- `order_id`
- `provider_id`
- `quote_amount`
- `pickup_location`
- `delivery_location`
- `status`
- `current_milestone`
- `handoff_evidence`
- `delivered_at`

### Mineral Passport

Represents traceability for a verified mineral batch.

Suggested fields:

- `id`
- `passport_number`
- `site_id`
- `miner_id`
- `production_report_id`
- `lab_result_id`
- `listing_id`
- `order_id`
- `shipment_id`
- `contract_id`
- `status`
- `qr_code_url`
- `public_verification_token`
- `issued_at`

### Environmental Record

Represents environmental inspection, incident, or monitoring result.

Suggested fields:

- `id`
- `site_id`
- `reported_by`
- `record_type`
- `severity`
- `description`
- `latitude`
- `longitude`
- `evidence_urls`
- `status`
- `assigned_to`
- `resolved_at`

### Investor Opportunity

Represents investment-ready mining opportunities.

Suggested fields:

- `id`
- `site_id`
- `sponsor_id`
- `title`
- `mineral_focus`
- `capital_required`
- `investment_type`
- `risk_rating`
- `summary`
- `documents`
- `status`
- `published_at`

## 6. API Design Principles

- Use REST resources for stable domain objects.
- Use WebSockets only for real-time updates such as chat, notifications, order status, shipment status, and admin alert streams.
- Keep webhook endpoints isolated, authenticated where supported, and idempotent.
- Return consistent error payloads from the API client and backend.
- Use pagination, filtering, and sorting for all list endpoints.
- Use role-aware response shaping to prevent data leakage.
- Record audit logs for admin, compliance, payment, KYC, document, and traceability actions.

## 7. Proposed API Additions

### Registry and Mine Sites

- `GET /registry/miners`
- `GET /registry/miners/:id`
- `GET /mine-sites`
- `POST /mine-sites`
- `GET /mine-sites/:id`
- `PATCH /mine-sites/:id`
- `DELETE /mine-sites/:id`

Current MVP mine-site records use numeric coordinates and optional GeoJSON. PostGIS remains the recommended production extension before advanced polygons, proximity search, clustering, and layer queries.

### Licensing and Compliance

- `POST /licenses`
- `GET /licenses`
- `GET /licenses/:id`
- `PATCH /licenses/:id/status`
- `POST /compliance-cases`
- `GET /compliance-cases`
- `GET /compliance-cases/:id`
- `PATCH /compliance-cases/:id`

The MVP implementation supports miner license submissions, admin/government review decisions, expiry indicators, compliance case board states, inspection scheduling, corrective actions, and audit logging for review-sensitive changes.

### Production and Revenue

- `POST /production-reports`
- `GET /production-reports`
- `GET /production-reports/:id`
- `PATCH /production-reports/:id`
- `PATCH /production-reports/:id/review`
- `GET /analytics/revenue`
- `GET /analytics/production`

The MVP implementation supports miner production submission, reviewer approval/rejection, supporting evidence IDs, royalty-ready value/rate/due fields, and production analytics grouped by mineral.
- `GET /analytics/compliance`

### Laboratory, Logistics, and Traceability

- `POST /lab-results`
- `GET /lab-results`
- `PATCH /lab-results/:id/verify`
- `POST /shipments`
- `GET /shipments`
- `PATCH /shipments/:id/status`

Implemented logistics MVP endpoints:

- `POST /logistics/quote-requests`
- `GET /logistics/quote-requests`
- `PATCH /logistics/quote-requests/:id`
- `GET /logistics/providers`
- `POST /logistics/providers`
- `PATCH /logistics/providers/:id`
- `POST /logistics/shipments`
- `GET /logistics/shipments`
- `GET /logistics/shipments/:id`
- `GET /logistics/shipments/track/:trackingId`
- `PATCH /logistics/shipments/:id/status`

Shipments are linked to orders and include a nullable `mineral_passport_id` for Story 3.4 traceability records.
- `POST /mineral-passports`
- `GET /mineral-passports/:id`
- `GET /public/mineral-passports/:token`

### Environmental Monitoring and Investor Portal

- `POST /environmental-records`
- `GET /environmental-records`
- `PATCH /environmental-records/:id`
- `POST /investor-opportunities`
- `GET /investor-opportunities`
- `GET /investor-opportunities/:id`
- `POST /investor-opportunities/:id/inquiries`

## 8. Security Architecture

- Authentication: JWT access tokens with refresh token workflow.
- Authorization: role guards and route-level role requirements.
- Identity verification: MetaMap integration and internal admin verification.
- Payment security: Flutterwave webhook validation, payment reference idempotency, payout review, and transaction reconciliation.
- E-signature security: SignNow webhook verification and contract status sync.
- File security: upload type/size restrictions, signed URLs where possible, malware scanning for production, and document access authorization.
- Auditability: audit logs for sensitive actions, including actor, action, metadata, IP address, and user agent.
- Rate limiting: global throttling and tighter limits for auth, uploads, webhooks, and AI endpoints.
- Secrets: environment variable management with no secrets committed to source control.

## 9. Deployment Architecture

Recommended production deployment:

- Frontend hosted on a managed Node/Next.js platform or container service.
- Backend deployed as containerized NestJS service behind a load balancer.
- PostgreSQL managed database with automated backups and point-in-time recovery.
- PostGIS enabled for GIS features.
- Object storage/CDN for uploaded media and documents.
- Redis or managed queue introduced for background jobs, webhook processing, notification fanout, AI jobs, and scheduled reminders.
- Observability stack for logs, metrics, traces, uptime checks, and alerts.

## 10. Background Jobs

Recommended async jobs:

- KYC status synchronization.
- SignNow contract synchronization.
- Flutterwave payment reconciliation.
- Payout reconciliation.
- License expiry reminders.
- Production report submission reminders.
- Mineral passport generation.
- Notification delivery.
- AI forecast refresh.
- Analytics aggregation.
- Document virus scanning and OCR extraction.

## 11. Data Governance

- Define retention policies for KYC, identity documents, contracts, payment records, production reports, and environmental records.
- Separate public, private, regulator-only, and admin-only data fields.
- Maintain exportable reports for government reporting.
- Use immutable history for compliance, payment, production, and traceability events where practical.
- Store personally identifiable information with strict access controls.
- Record consent and legal basis for investor, miner, and partner data use.

## 12. Architecture Roadmap

### Near Term

- Document current API contracts and stabilize core flows.
- Add unified admin analytics endpoints.
- Add registry views over current user, miner, investor, KYC, and document data.
- Harden webhooks, audit logs, and upload validation.

### Mid Term

- Add PostGIS-backed mine sites.
- Add licensing, compliance, production reporting, laboratory, logistics, and mineral passport modules.
- Introduce queue workers and scheduled jobs.
- Add reporting dashboards and role-based exports.

### Long Term

- Launch mobile/PWA offline workflows.
- Integrate external laboratory and logistics APIs.
- Add public passport verification.
- Add advanced AI analytics, risk scoring, fraud detection, and investor intelligence.
