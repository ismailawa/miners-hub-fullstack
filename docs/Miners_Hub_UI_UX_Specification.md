# Miners Hub UI/UX Specification

## 1. Experience Principles

Miners Hub should feel like a trusted civic infrastructure product with a marketplace layer: clear, professional, data-rich, and operationally efficient. The interface must support repeated daily work by miners, administrators, regulators, buyers, and partners rather than behave like a marketing website.

Public positioning should communicate Miners Hub as compliance-first mineral commerce infrastructure: verified minerals, compliant trade, traceable batches, and investor-ready opportunities. Marketplace language should remain present but secondary to trust, legality, and operational evidence.

Core principles:

- Trust first: verification, approval state, document status, payment state, and traceability must be visible.
- Compliance first: license category, export readiness, environmental obligations, AML/KYB risk, and review history must appear wherever they influence action.
- Operational clarity: users should always know what needs attention and what changed recently.
- Low friction: registration, KYC, listing creation, document upload, orders, contracts, and reporting must have guided flows.
- Mobile-aware: field users need responsive screens, short forms, resumable tasks, and upload-friendly interactions.
- Role-aware: each user sees the workflows, navigation, data, and alerts relevant to their responsibilities.
- Evidence-oriented: regulated actions should expose supporting documents, timestamps, comments, and status history.

## 2. Product Shell

The existing product uses:

- Public pages for discovery, marketplace browsing, services, logistics, warehousing, forum, news, knowledge base, analytics, registration guide, terms, and privacy.
- Authentication pages for login and registration.
- Onboarding pages for initial user setup.
- Dashboard layout with sidebar navigation, page title header, profile menu, unread message indicators, notifications, and role-aware navigation sections.

The dashboard shell should remain the primary authenticated experience.

Recommended authenticated navigation:

- Main: Overview, Messages, Notifications, Profile.
- Registry: Miner Registry, Investor Registry, Partner Registry.
- Operations: Mine Sites, Production Reports, Logistics, Laboratory Results, Mineral Passports.
- Marketplace: Listings, Auctions, Orders, Contracts, Transactions.
- Compliance: Licenses, Documents, Inspections, Environmental Records, Compliance Cases.
- Analytics: Revenue, Production, Compliance, Marketplace, Investor Activity.
- Administration: Users, KYC, Listing Approvals, Order Review, Events, Audit Logs, Settings.

Navigation must be role-filtered so miners, buyers, investors, regulators, laboratories, logistics partners, and admins are not overwhelmed by unavailable sections.

## 3. Visual System

### Tone

The interface should communicate institutional reliability and commercial confidence. Use restrained surfaces, readable tables, clear labels, compact dashboards, and consistent status indicators.

### Layout

- Use dense but comfortable admin layouts for dashboards and review queues.
- Prefer tables and split-detail views for operational data.
- Use cards for repeated items such as listings, events, forum posts, and summary metrics.
- Avoid decorative layouts in core workflows.
- Keep action buttons close to the records they affect.
- Preserve stable dimensions for tables, map panels, status chips, document cards, upload rows, and workflow steppers.

### Color

Use color meaningfully:

- Green: verified, approved, paid, completed.
- Amber: pending, review required, expiring soon.
- Red: rejected, overdue, disputed, high risk.
- Blue: informational, submitted, in progress.
- Neutral: draft, archived, inactive.

Status colors must be paired with text labels for accessibility.

### Typography

- Use compact headings inside dashboards and forms.
- Use larger display type only on public landing sections where appropriate.
- Keep labels explicit and short.
- Avoid negative letter spacing.
- Maintain readable line length for long policy, contract, and document-review text.

## 4. Key User Journeys

### 4.1 Miner Registration and Verification

Entry points:

- Public registration guide.
- Register page.
- Onboarding flow.

Flow:

1. User creates account and selects miner role.
2. User completes personal profile and business profile.
3. User uploads identity, company, and mining license documents.
4. User starts KYC verification.
5. System shows a checklist with clear pending, submitted, approved, or rejected states.
6. Admin reviews documents and verifies profile.
7. Miner dashboard unlocks listing, production, and site workflows based on verification state.

UX requirements:

- Use a stepper for account, identity, business, documents, KYC, and review.
- Provide save-and-resume behavior that returns users to the exact onboarding step they last edited.
- Show document requirements before upload.
- Show rejection reasons and resubmission actions.
- Prevent verified-only actions with inline explanations and direct next step.
- Show a Continue Onboarding action on the dashboard and public landing page for logged-in users whose onboarding or verification is incomplete.

### 4.2 Buyer Marketplace Purchase

Entry points:

- Public marketplace.
- Authenticated marketplace.
- Listing detail page.

Flow:

1. Buyer searches listings by mineral, quantity, price, location, grade, verification status, and availability.
2. Buyer reviews listing detail, seller verification, documents, lab results, mineral passport if available, and order terms.
3. Buyer starts chat or creates order.
4. Buyer signs contract where required.
5. Buyer funds escrow.
6. Seller confirms fulfillment.
7. Logistics milestones and delivery evidence are tracked.
8. Admin or automated workflow releases escrow after completion.

UX requirements:

- Listing cards must show mineral type, price, quantity, seller verification, grade, location, and status.
- Listing details must include a due diligence pack summarizing seller verification, approved supporting documents, grade evidence, product images, listing approval, and pending lab/passport status.
- Detail pages must show trust evidence before purchase actions.
- Payment and escrow states must be clear and non-ambiguous.
- Orders must have a timeline showing created, contracted, paid, shipped, delivered, released, refunded, or disputed states.

### 4.3 Admin Review Queue

Entry points:

- Admin dashboard.
- User management.
- Listing approvals.
- KYC documents.
- Orders.
- Compliance cases.

Flow:

1. Admin sees a queue grouped by priority and age.
2. Admin opens a record in a split view.
3. Admin reviews submitted fields, documents, status history, and related records.
4. Admin approves, rejects, requests changes, assigns another reviewer, or escalates.
5. System records audit log and notifies the affected user.

UX requirements:

- Use filterable tables for queues.
- Include bulk filters for status, role, age, mineral type, location, and risk.
- Keep approve/reject actions visible but protected by confirmation for high-impact actions.
- Require review notes for rejection or escalation.
- Show audit history on every regulated record.

### 4.4 Mine Site Mapping

Entry points:

- GIS map dashboard.
- Miner registry.
- License record.
- Production report.

Flow:

1. Authorized user creates or imports a mine site.
2. User adds coordinates or boundary polygon.
3. User links operator, license, mineral types, documents, and inspection records.
4. Admin or regulator verifies site information.
5. Site appears on map layers and analytics dashboards.

UX requirements:

- Map must support search, filter, cluster, and layer toggles.
- Site detail drawer should show license status, operator, mineral type, production summary, compliance flags, environmental risk, and recent activity.
- Mobile field entry should allow coordinate capture and photo upload.

### 4.5 Production Reporting

Entry points:

- Miner dashboard.
- Mine site detail.
- Production reporting calendar.

Flow:

1. Miner selects site and reporting period.
2. Miner enters mineral type, quantity, unit, grade, estimated value, and supporting evidence.
3. System estimates royalty obligations if formulas are configured.
4. Miner submits report.
5. Admin or regulator reviews and approves or requests changes.

UX requirements:

- Show reporting deadlines and overdue indicators.
- Use guided forms with unit validation.
- Show draft, submitted, under review, approved, rejected, and overdue states.
- Include exportable report summaries for government use.

### 4.6 Mineral Passport

Entry points:

- Listing detail.
- Order detail.
- Production report.
- Laboratory result.
- Public QR verification page.

Flow:

1. System compiles source site, miner, license, production report, lab result, listing, order, logistics, contract, and payment data.
2. Authorized user issues passport.
3. Passport receives a unique number and QR verification token.
4. Buyer, regulator, exporter, or public verifier views permitted passport details.

UX requirements:

- Passport should read as a certificate plus timeline.
- Clearly distinguish verified fields from self-reported fields.
- Public verification page must reveal only approved non-sensitive data.
- Show tamper-evident status such as active, revoked, expired, or disputed.

### 4.7 Environmental Monitoring

Entry points:

- Mine site detail.
- Compliance module.
- Mobile field reporting.
- Community reporting channel.

Flow:

1. User records inspection or incident.
2. User adds description, severity, location, evidence photos, and affected site.
3. Admin or regulator assigns action owner.
4. Owner updates remediation progress.
5. Case is closed with evidence and audit history.

UX requirements:

- Use severity labels and map markers.
- Show open environmental issues in site detail and compliance dashboards.
- Support photo-heavy mobile upload.
- Keep community-facing views separate from regulator-only notes.

## 5. Screen Specifications

### Public Home

Purpose: introduce Miners Hub, surface marketplace access, registration, services, analytics, and trust signals.

Primary components:

- Header with marketplace, services, logistics, forum, knowledge base, register, and login.
- Hero area with clear Miners Hub identity and compliance-first positioning: verified minerals, compliant trade, and investable opportunities.
- Mineral price or market snapshot.
- How it works.
- Featured miners/listings or services.
- Partner and stakeholder signals.
- Footer with policy links.

Homepage trust signals should prioritize verified actors, license-aware records, escrow-backed trade, traceability, lab evidence, logistics chain-of-custody, ESG/compliance workflows, and investor due diligence.

### Marketplace

Purpose: browse and evaluate mineral listings.

Primary components:

- Search input.
- Filters for mineral, price, quantity, grade, location, verification, listing type, and status.
- Listing grid or table toggle.
- Listing card with trust signals.
- Detail modal/page.
- Chat, order, bid, and contract actions.

### Dashboard Overview

Purpose: summarize user-specific work and platform state.

Miner widgets:

- Verification checklist.
- Active listings.
- Orders requiring action.
- Contract signature requests.
- Production reports due.
- Pending document reviews.
- Payment and escrow status.

Buyer/investor widgets:

- Saved listings.
- Active orders.
- Contract requests.
- Escrow status.
- Recommended opportunities.
- Messages.

Admin widgets:

- Pending KYC reviews.
- Pending listing approvals.
- Orders in dispute or escrow review.
- Compliance cases.
- Revenue summary.
- Production report status.
- Environmental alerts.

### Registry

Purpose: searchable verified source of stakeholder records.

Primary components:

- Role tabs for miners, investors, laboratories, logistics partners, financiers, insurers, processors, exporters, and cooperatives.
- Filterable table.
- Verification status.
- Profile completeness.
- Document status.
- Linked sites and listings.
- Detail drawer with timeline and admin actions.

### Mine Sites Map

Purpose: geospatial management of mining activity.

Primary components:

- Full-width map.
- Layer controls.
- Search and filters.
- Site pins/clusters.
- Site detail drawer.
- Add/edit site form.
- Linked licenses, production reports, compliance cases, and environmental records.

### Licensing and Compliance

Purpose: manage licenses, inspections, violations, and approvals.

Primary components:

- License table.
- Expiry calendar.
- Export readiness checklist table.
- ESG obligation register with CDA, EIA, rehabilitation, reclamation, compensation/remediation, and community benefit statuses.
- AML/KYB profile register with beneficial ownership, SCUML evidence, source-of-funds/source-of-minerals notes, suspicious activity state, and risk tier.
- Compliance case board.
- Inspection forms.
- Document viewer.
- Review notes.
- Audit timeline.

Interaction requirements:

- Add/edit license, export-readiness, ESG obligation, and compliance case workflows open in modals.
- Admin/government reviewers can approve, reject, block, waive, or require action from detail drawers without leaving the page.
- Investor-facing opportunity cards and details should show a concise ESG/community readiness summary, due-diligence review status, and risk score when a linked mine site has obligations.
- Investor opportunity reviewers can approve or require action on the diligence pack before publication.

### Production Reports

Purpose: capture periodic production data.

Primary components:

- Reporting calendar.
- Site selector.
- Production report form.
- Evidence upload.
- Royalty estimate panel.
- Review queue.
- Analytics summary.

### Laboratory Results

Purpose: request and verify assay results.

Primary components:

- Test request form.
- Sample reference.
- Lab assignment.
- Result upload.
- Certificate viewer.
- Verification status.
- Links to listing, production report, and passport.

### Logistics

Purpose: manage movement from seller to buyer.

Primary components:

- Quote request form.
- Shipment status timeline.
- Provider assignment.
- Pickup and delivery locations.
- Evidence upload.
- Delivery confirmation.
- Dispute trigger.

### Mineral Passport

Purpose: provide traceability and verification.

Primary components:

- Passport summary certificate.
- Source site and license block.
- Miner and buyer details based on visibility rules.
- Lab result block.
- Production report block.
- Order, contract, escrow, and logistics timeline.
- QR verification.
- Download or print action.

### Revenue Analytics

Purpose: show government and platform revenue visibility.

Primary components:

- Revenue KPIs.
- Transaction value by mineral.
- Royalty estimates.
- Fees and commissions.
- Escrow volume.
- Laboratory and logistics referral value.
- Filters by period, mineral, LGA, site, and status.
- Export action.

### Investor Portal

Purpose: promote investment-ready mining opportunities.

Primary components:

- Opportunity listings.
- Filters by mineral, capital requirement, location, risk, stage, and license status.
- Opportunity detail.
- Due diligence documents.
- Inquiry workflow.
- Saved opportunities.
- Analytics subscription upsell where applicable.

## 6. Form and Workflow Standards

- Every long form must support draft saving.
- Required fields must be visibly marked.
- Upload controls must show accepted file types, upload progress, file size, review state, and replacement action.
- Submission success should show next steps.
- Rejections must include reason, reviewer, timestamp, and resubmission path.
- High-impact actions such as escrow release, refund, license rejection, document rejection, and user suspension require confirmation.
- Date, currency, quantity, and unit fields must use structured controls.
- Tables must support pagination and empty states.

## 7. Status Model

Use consistent status patterns across the product.

Identity:

- Draft
- Submitted
- Under Review
- Verified
- Rejected
- Suspended

Documents:

- Uploaded
- Pending Review
- Approved
- Rejected
- Expired

Listings:

- Draft
- Pending Approval
- Active
- Sold
- Suspended
- Rejected
- Archived

Orders:

- Created
- Contract Pending
- Payment Pending
- Escrow Funded
- In Fulfillment
- Shipped
- Delivered
- Completed
- Cancelled
- Refunded
- Disputed

Compliance:

- Open
- Assigned
- Action Required
- Under Review
- Resolved
- Escalated

Mineral Passport:

- Draft
- Issued
- Active
- Revoked
- Disputed
- Expired

## 8. Empty, Loading, and Error States

Empty states should provide one direct action:

- No listings: create listing or browse marketplace depending on role.
- No documents: upload required document.
- No orders: browse marketplace.
- No production reports: create report.
- No mapped sites: add mine site.
- No compliance cases: show stable healthy state.

Error states:

- Explain what failed in plain language.
- Preserve user input after submission failures.
- Offer retry where useful.
- Provide contact/support path for payment, KYC, and contract failures.

Loading states:

- Use skeletons for tables, cards, dashboards, and detail panels.
- Use progress indicators for uploads and payment handoffs.
- Avoid blocking the whole page when only one panel is refreshing.

## 9. Accessibility and Responsiveness

- Meet WCAG 2.1 AA contrast where practical.
- All controls must be keyboard reachable.
- Status must not rely on color alone.
- Tables must collapse into readable card lists on small screens.
- Map screens must provide non-map list equivalents.
- Forms must use labels, helper text, validation messages, and focus states.
- Touch targets should be comfortable on mobile.
- Avoid text overlap in buttons, cards, sidebars, and tables at mobile widths.

## 10. Content Guidelines

- Use direct action labels: Approve, Reject, Request Changes, Release Escrow, Refund Buyer, Upload License, Submit Report.
- Avoid vague labels such as Continue where a more specific action is available.
- Use role-specific language: miner, buyer, investor, regulator, laboratory, logistics provider, administrator.
- Keep trust language precise: Verified Miner, Approved License, Lab Verified, Escrow Funded, Passport Issued.
- Separate public marketing language from operational dashboard language.

## 11. Smart Reference Inputs

Operational forms must not ask users to manually type UUIDs when the record can be searched. Use searchable record pickers for user, miner, site, license, listing, order, production report, laboratory result, mineral passport, shipment, provider, and document references.

Picker behavior:

- Display human labels first, such as company name, mine site name, license number, passport number, sample reference, tracking ID, mineral type, buyer/seller email, or location.
- Store the selected UUID internally.
- Show status as a badge where useful.
- Include a short description with location, company, email, grade, route, date, or quantity.
- Support contextual filtering. For example, after selecting a site, show only licenses and production reports linked to that site where possible.
- Prefill related fields only when the source record is authoritative. Examples: selecting a mine site may fill operator, minerals, state/LGA, coordinates, and license; selecting a listing may fill mineral type and grade; selecting a passport may fill order, listing, license, site, and shipment links.
- Keep manual ID entry only for records that do not yet have lookup support, and mark those as technical/back-office fields.

## 12. File Upload UX

Every user-supplied file should use a drop-zone upload control backed by Cloudinary. Operational evidence must create a document record and expose the document identity in the workflow.

Requirements:

- Upload immediately through the backend, not directly from the browser to third-party storage.
- Show upload progress, success, removal, and retry states.
- Use the returned document ID for workflow association and the returned URL only for viewing/downloading.
- Tag uploads with purpose and owning resource where available.
- For files uploaded before a record exists, attach the best available parent ID, such as site, shipment, listing, production report, mineral passport, or order, and include a purpose/correlation label.
- Avoid raw URL entry for certificates, proof, and compliance evidence once a drop-zone upload exists.

## 13. MVP UI Scope

The first complete Miners Hub UI release should prioritize:

- Role-based onboarding and verification checklist.
- Miner registry admin view.
- Marketplace listing and listing approval improvements.
- Order, contract, payment, and escrow timeline clarity.
- Document review queue.
- Admin dashboard with pending work and revenue summary.
- Mine site basic records and map view.
- Production report submission and review.
- Notification and message reliability.

## 14. Future UI Scope

Future releases should add:

- Advanced GIS layers and site risk visualization.
- Compliance case board and inspection scheduling.
- Laboratory result workflows.
- Logistics shipment management.
- Mineral passport certificate and public QR verification.
- Environmental monitoring dashboards.
- Investor opportunity portal and deal room, building on the implemented public opportunity view and ESG/community due-diligence summary.
- Mobile/PWA offline capture for field reports, inspections, and uploads.
