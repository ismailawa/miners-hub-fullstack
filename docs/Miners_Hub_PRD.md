# Miners Hub Product Requirements Document

## 1. Product Summary

Miners Hub is a digital ecosystem for formalizing mining activity, improving governance, increasing internally generated revenue, strengthening mineral traceability, and connecting stakeholders across the solid minerals value chain.

The product combines a government-facing mining administration platform with a commercial marketplace for miners, buyers, investors, laboratories, logistics providers, financiers, insurers, processors, exporters, communities, and development partners.

## 2. Problem Statement

Plateau State's mining sector is constrained by informal operations, fragmented records, revenue leakage, manual licensing and compliance processes, weak traceability, limited production reporting, poor logistics visibility, fragmented buyer networks, limited financing access, environmental oversight gaps, and insufficient data for policy decisions.

Miners Hub addresses these problems by creating a single source of truth for miner identity, site activity, compliance, production, trade, revenue, logistics, environmental monitoring, and investment promotion.

## 3. Goals

- Digitize miner, investor, and stakeholder registration.
- Maintain verified profiles for miners, cooperatives, buyers, regulators, logistics partners, laboratories, financiers, insurers, processors, exporters, and communities.
- Map mining sites and associate them with licenses, operators, minerals, production, inspections, environmental indicators, and transactions.
- Support licensing, document review, compliance workflows, and auditability.
- Enable secure mineral listings, auctions, orders, contracts, payments, escrow, and payout workflows.
- Provide mineral passport and traceability records from source site through testing, logistics, sale, and export.
- Improve royalty and fee visibility for government revenue collection.
- Provide dashboards for policy, market intelligence, investor engagement, and operational monitoring.
- Offer web and mobile-ready access for field users with low-bandwidth realities.

## 4. Success Metrics

- Number of registered and verified miners.
- Number of mapped mine sites.
- Number and percentage of licensed or compliance-reviewed sites.
- Number of production reports submitted on time.
- Royalty, fee, subscription, commission, referral, and escrow revenue tracked through the platform.
- Marketplace gross transaction value and completed orders.
- Number of mineral passports issued.
- Number of laboratory results attached to listings or passports.
- Number of logistics movements tracked.
- Number of investor inquiries and investment opportunities published.
- Number of environmental inspections and incidents recorded.
- Platform uptime, API latency, onboarding completion, and support resolution time.

## 5. Users and Roles

### Miner

Registers an account, completes KYC, creates or updates mining business profile, uploads licenses and supporting documents, publishes mineral listings, manages orders, signs contracts, receives payments, responds to buyer messages, reports production, and views operational tasks.

### Buyer or Investor

Registers an account, completes KYC where required, searches verified mineral listings, initiates chats, places orders, participates in auctions, signs contracts, funds escrow, tracks deliveries, reviews mineral passports, and submits investment inquiries.

### Government Administrator

Reviews users, documents, listings, orders, KYC documents, events, compliance records, production submissions, site records, environmental inspections, revenue dashboards, and audit logs.

### Regulator or Inspector

Reviews license status, schedules and records inspections, flags illegal or non-compliant activity, approves production records, and contributes environmental monitoring evidence.

### Laboratory

Receives test requests, uploads assay results, certifies grade and quality, and links results to mineral passports and marketplace listings.

### Logistics Provider

Provides haulage quotes, manages shipment milestones, records handoff evidence, and supports chain-of-custody tracking.

### Financier or Insurer

Reviews verified miner profiles, transaction history, production records, and investment opportunities to support financing, insurance, credit, and risk products.

### Community or Development Partner

Views approved public information, reports concerns, participates in engagement workflows, and monitors environmental or social commitments where authorized.

## 6. Current Product Capabilities

The current Miners Hub codebase already includes the following product foundations:

- Authentication, registration, login, logout, refresh token, profile retrieval, and profile update.
- Role-based access for miner, investor, and admin-oriented flows.
- KYC initiation and completion through MetaMap-related fields and endpoints.
- Miner and investor entity records.
- Marketplace listings with mineral type, quantity, price, grade or purity, description, status, listing type, images, and document attachments.
- Admin listing review and status management.
- Orders with buyer, seller, listing, amount, quantity, delivery address, payment status, and status history.
- Flutterwave escrow initiation, webhook handling, release, refund, seller payout accounts, and transaction records.
- Contracts with party relationships, listing association, terms, signatures, status updates, SignNow integration links, sync, and webhook handling.
- Auctions and bids for competitive marketplace transactions.
- Documents with uploads, listing association, review status, review notes, reviewer, and timestamps.
- Notifications, unread counts, read states, and typed metadata.
- Chat threads, message read status, and socket-based update support.
- Forum posts and replies for stakeholder discussions.
- Events and admin event management.
- AI chat, market summary, and forecast endpoints.
- Public pages for marketplace, forum, news, knowledge base, data analytics, services, logistics, warehousing, registration guide, and policy pages.
- Dashboard pages for overview, messages, profile, contracts, orders, transactions, listings, and miner task management.

## 7. Required Miners Hub Feature Set

### 7.1 Miner Registry

The system shall maintain a verified miner registry with user identity, business profile, license information, KYC status, company registration details, mineral focus, mining equipment, locations, documents, contact details, verification status, and onboarding completion.

Priority:

- MVP: extend current user, miner, KYC, and document workflows into a registry view for administrators.
- Phase 2: add cooperative membership, field verification, site association, and regulator notes.

### 7.2 GIS Mine Mapping

The system shall support digital mapping of mining sites, including coordinates, mineral type, license status, operator, production status, environmental risk indicators, inspection history, and map-layer filtering.

Priority:

- MVP extension: create mine site records and a map dashboard.
- Phase 2: add GIS layers, satellite/manual survey attachments, boundary polygons, and site risk scoring.

### 7.3 Licensing and Compliance

The system shall digitize license submission, document review, expiry tracking, renewal reminders, inspection records, compliance flags, and approval history.

Priority:

- MVP extension: build on existing documents and admin review workflows.
- Phase 2: add regulator roles, compliance case management, inspection scheduling, and renewal automation.

### 7.4 Production Reporting

The system shall allow miners or authorized agents to report production volumes, mineral type, site, reporting period, grade, destination, supporting laboratory evidence, and royalty-relevant values.

Priority:

- Phase 2: structured production report submission and admin validation.
- Phase 3: automated analytics, anomaly detection, and royalty calculation.

### 7.5 Buyer Marketplace

The system shall allow verified sellers to publish listings and buyers to search, filter, chat, order, bid, sign contracts, pay through escrow, and track transaction status.

Priority:

- Already partially implemented: listings, auctions, orders, contracts, chat, escrow, documents, notifications.
- Next: stronger search, mineral passport display, laboratory verification badges, logistics milestones, and buyer due diligence pack.

### 7.6 Logistics Management

The system shall connect transactions to logistics providers, haulage quotes, dispatch records, delivery milestones, delivery evidence, chain-of-custody events, and dispute triggers.

Priority:

- MVP extension: logistics quote and shipment records linked to orders.
- Phase 3: transporter profiles, route risk indicators, tracking integrations, and delivery proof uploads.

### 7.7 Laboratory Integration

The system shall support laboratory partner profiles, test requests, sample chain-of-custody, assay results, certificate upload, result verification, and linkage to listings, production reports, and mineral passports.

Priority:

- Phase 3: manual lab result upload and admin verification.
- Phase 4: API integration with partner laboratories.

### 7.8 Mineral Passport and Traceability

The system shall generate a mineral passport for compliant mineral batches, capturing source site, miner, license, production report, laboratory result, listing, order, logistics movement, buyer, contract, payment, and export-related documentation.

Priority:

- Phase 3: passport record model and printable/shareable certificate.
- Phase 4: QR-code verification and public verification endpoint.

### 7.9 Environmental Monitoring

The system shall record environmental inspections, remediation tasks, community concerns, incident reports, photos, geolocation, status, severity, and linked compliance action.

Priority:

- Phase 3: inspection and incident records.
- Phase 4: environmental dashboard, alerts, and integration with remote sensing or field collection tools.

### 7.10 Revenue Analytics

The system shall produce dashboards for government revenue, platform revenue, subscriptions, transaction fees, logistics commissions, laboratory referrals, financing referrals, escrow fees, royalties, and compliance-related fees.

Priority:

- MVP extension: aggregate current orders, escrow transactions, listing statuses, users, and documents.
- Phase 2: add royalty logic from production and verified transaction data.

### 7.11 Investor Portal

The system shall present verified investment opportunities, mining site summaries, production history, compliance profile, supporting documents, contact workflows, and inquiry tracking.

Priority:

- MVP extension: enhance investor profile and inquiry records.
- Phase 4: investor deal room, analytics subscriptions, and financing/insurance referral workflows.

### 7.12 Mobile App

The system shall support mobile-first workflows for miner registration, document upload, production reporting, inspections, environmental reports, logistics evidence, notifications, and offline-first field capture.

Priority:

- Phase 1: responsive web support.
- Phase 4: dedicated mobile app or PWA with offline queueing and location capture.

## 8. Functional Requirements

### Authentication and Identity

- Users can register as miners, investors, buyers, administrators, or future partner roles.
- Users can log in, refresh sessions, log out, and retrieve their profile.
- Users can save onboarding as a draft and resume at the exact step last edited.
- Users must complete required KYC before high-trust actions such as publishing listings, placing high-value orders, receiving payouts, or accessing regulated records.
- Administrators can verify users and review KYC/document submissions.

### Marketplace and Transactions

- Miners can create, update, and delete listings subject to approval rules.
- Buyers can browse listings, view detail pages, place orders, participate in auctions, and communicate with sellers.
- Orders must track status transitions, payment status, delivery address, and history.
- Escrow must support payment initiation, webhook confirmation, release, refund, and seller payout tracking.
- Notifications must be sent for listing review, order events, escrow events, contract events, document review, chat messages, and compliance updates.

### Contracts

- Users can create contracts tied to listings or standalone agreements.
- Contracts can store structured terms, status, party signatures, and timestamps.
- External e-signature integration should remain supported through SignNow-compatible workflows.
- Contract status changes must be auditable.

### Documents

- Users can upload required documents for KYC, licenses, listings, contracts, laboratory results, production reports, and environmental inspections.
- Admins can review, approve, reject, and annotate documents.
- The system should store file metadata and secure file URLs.

### Administration

- Admin users can manage users, listings, orders, documents, events, and Miners Hub governance records.
- Admin dashboards should show pending reviews, revenue indicators, compliance risks, marketplace performance, and adoption metrics.
- All sensitive admin actions should be recorded in audit logs.

### AI and Analytics

- AI chat should support guided user help, marketplace questions, registration assistance, and policy navigation.
- Market summaries and forecasts should use verified data sources and clearly mark confidence or assumptions.
- Analytics should distinguish transactional data, production data, revenue data, and forecast data.

## 9. Non-Functional Requirements

- Security: JWT authentication, role-based authorization, secure password hashing, upload validation, webhook signature validation, audit logging, rate limiting, and least-privilege access to sensitive records.
- Availability: target 99.5 percent uptime for MVP and 99.9 percent for production public-sector rollout.
- Performance: common dashboard and marketplace queries should return within 500 ms at API level under expected load.
- Scalability: architecture must support increased records across miners, sites, listings, orders, documents, and geospatial data.
- Traceability: regulated records must maintain immutable event history where feasible.
- Compliance: system must support data retention, privacy, regulator access controls, and exportable government reports.
- Accessibility: web interfaces should meet WCAG 2.1 AA patterns where practical.
- Low-bandwidth support: key workflows should minimize payload size and support progressive loading.
- Observability: logs, metrics, audit records, uptime checks, and alerting must be available for production operation.

## 10. Roadmap

### Phase 1: Discovery, Design, and Platform Hardening

- Confirm regulatory workflows with Plateau State stakeholders.
- Finalize role matrix and data dictionary.
- Stabilize existing authentication, KYC, listings, orders, contracts, escrow, admin, documents, chat, forum, and notifications.
- Produce pilot onboarding content and support flows.

### Phase 2: Registry, GIS, Compliance, and Reporting

- Launch miner registry.
- Add mine site records and GIS map.
- Add licensing and compliance case management.
- Add production reporting and royalty-ready data capture.
- Add government revenue dashboards.

### Phase 3: Marketplace, Logistics, Laboratory, and Traceability

- Enhance marketplace search, verification indicators, and due diligence packs.
- Add logistics management.
- Add laboratory partner workflows.
- Launch mineral passport and traceability records.
- Add environmental monitoring and inspection workflows.

### Phase 4: Finance, AI, Investor Services, and Mobile

- Expand investor portal.
- Add financing, insurance, and analytics subscription workflows.
- Improve AI analytics and forecasting.
- Launch mobile/PWA offline field workflows.
- Add public mineral passport verification.

## 11. Key Risks and Mitigations

- Adoption resistance: use phased rollout, stakeholder training, field support, and assisted onboarding.
- Connectivity limitations: design mobile-friendly, low-bandwidth, and offline-capable workflows.
- Data quality issues: require validation, admin review, audit trails, and clear ownership.
- Cybersecurity risk: enforce secure authentication, webhook validation, rate limiting, audit logs, backups, and incident response.
- Regulatory ambiguity: maintain configurable statuses, document templates, workflows, and report formats.
- Payment and escrow risk: reconcile provider webhooks, protect payout workflows, and expose clear dispute handling.

## 12. Open Product Decisions

- Final government role hierarchy and approval authority.
- Whether mobile will be native, PWA, or responsive web first.
- GIS provider and base map strategy.
- Official royalty formula and payment collection process.
- Required fields for mineral passport verification.
- Laboratory certification standards and API integration model.
- Data ownership and public/private visibility rules for sites, passports, and investor opportunities.
