# Miners Hub Database Schema

## 1. Overview

The Miners Hub backend uses NestJS, TypeORM, and PostgreSQL. The current schema supports the implemented MVP: users, miner/investor profiles, KYC state, marketplace listings, documents, orders, escrow, payout accounts, contracts, auctions, bids, chats, notifications, forum posts/replies, events, audit logs, and persisted refresh-token revocation.

Future regulated-mining modules should be added with migrations, not `synchronize`, and should preserve auditability for compliance, payments, production, traceability, and administrative decisions.

## 2. Current Tables

### users

Purpose: account identity, role, verification/KYC state, profile data, and onboarding state.

Key fields:

- `id uuid primary key`
- `name varchar(255) nullable`
- `email varchar unique`
- `password_hash varchar`
- `role enum`: `miner`, `investor`, `government`, `admin`
- `verification_status enum`: `pending`, `verified`, `rejected`
- `phone_number varchar nullable`
- `address text nullable`
- `date_of_birth date nullable`
- `nationality varchar nullable`
- `nin varchar nullable`
- `profile_image_url text nullable`
- `metamap_identity_id varchar nullable`
- `metamap_verification_id varchar nullable`
- `metamap_last_payload jsonb nullable`
- `kyc_submitted_at timestamp nullable`
- `kyc_verified_at timestamp nullable`
- `kyc_rejected_at timestamp nullable`
- `onboarding_complete boolean`
- `onboarding_step integer`
- `onboarding_draft jsonb nullable`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `email`
- `role`
- `verification_status`

Relationships:

- One-to-one with `miners`
- One-to-one with `investors`
- One-to-many with `orders` as buyer
- One-to-many with `chats`, `notifications`, and `documents`

### miners

Purpose: seller/mining operator profile.

Key fields:

- `id uuid primary key`
- `user_id uuid unique`
- `company_name varchar`
- `mining_licence text nullable`
- `location varchar`
- `company_reg_number varchar nullable`
- `business_address text nullable`
- `business_website varchar nullable`
- `industry varchar nullable`
- `years_in_operation varchar nullable`
- `cooperative_name varchar nullable`
- `cooperative_reg_number varchar nullable`
- `partner_type varchar nullable`
- `partner_organization varchar nullable`
- `mining_equipment text[]`
- `certifications text[]`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `user_id`
- `location`

Relationships:

- One-to-one with `users`
- One-to-many with `listings`

### investors

Purpose: buyer/investor business profile.

Key fields:

- `id uuid primary key`
- `user_id uuid unique`
- `company_name varchar`
- `investment_focus text[]`
- `company_reg_number varchar nullable`
- `business_address text nullable`
- `business_website varchar nullable`
- `industry varchar nullable`
- `years_in_operation varchar nullable`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `user_id`

Relationships:

- One-to-one with `users`
- One-to-many with `orders` through buyer records

### listings

Purpose: mineral sale or auction listing.

Key fields:

- `id uuid primary key`
- `miner_id uuid`
- `mineral_type varchar`
- `quantity decimal(10,2)`
- `price decimal(10,2)`
- `grade_purity text nullable`
- `location text nullable`
- `moisture_percentage decimal(5,2) nullable`
- `status enum`: `draft`, `submitted`, `under_review`, `published`, `sold`, `expired`, `archived`
- `listing_type varchar`: `buy_now`, `auction`
- `images text[]`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `miner_id`
- `status`
- `mineral_type`
- `created_at`

Relationships:

- Many-to-one with `miners`
- One-to-many with `auctions`, `orders`, and `documents`

### documents

Purpose: uploaded KYC, license, listing, contract, and supporting documents.

Key fields:

- `id uuid primary key`
- `user_id uuid`
- `listing_id uuid nullable`
- `type enum`: `kyc`, `mining_licence`, `listing_attachment`, `contract`, `other`
- `file_url varchar`
- `file_name varchar`
- `file_size bigint`
- `mime_type varchar`
- `metadata jsonb nullable`
- `review_status enum`: `pending`, `approved`, `rejected`
- `review_notes text nullable`
- `reviewed_by uuid nullable`
- `reviewed_at timestamp nullable`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `user_id`
- `listing_id`
- `type`
- `review_status`
- `created_at`

Relationships:

- Many-to-one with `users`
- Many-to-one with `listings`

### orders

Purpose: buyer/seller transaction for a listing.

Key fields:

- `id uuid primary key`
- `buyer_id uuid`
- `seller_id uuid`
- `listing_id uuid`
- `total_amount decimal(10,2)`
- `quantity decimal(10,2)`
- `status enum`: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`
- `delivery_address text nullable`
- `payment_status varchar`: `pending`, `paid`, `refunded`
- `status_history jsonb`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `buyer_id`
- `seller_id`
- `listing_id`
- `status`
- `created_at`

Relationships:

- Many-to-one with `users` as buyer
- Many-to-one with `users` as seller
- Many-to-one with `listings`
- One-to-one with `escrow_transactions`

### escrow_transactions

Purpose: Flutterwave-backed escrow and payout lifecycle.

Key fields:

- `id uuid primary key`
- `order_id uuid unique`
- `buyer_id uuid`
- `seller_id uuid`
- `seller_payout_account_id uuid nullable`
- `gross_amount decimal(12,2)`
- `commission_amount decimal(12,2)`
- `seller_net_amount decimal(12,2)`
- `currency varchar`
- `status enum`: `pending_payment`, `funded`, `awaiting_release`, `release_processing`, `released`, `refund_processing`, `refunded`, `failed`
- `flutterwave_tx_ref varchar unique`
- `flutterwave_transaction_id varchar nullable`
- `flutterwave_payment_link text nullable`
- `flutterwave_payment_status varchar nullable`
- `seller_transfer_reference varchar nullable`
- `seller_transfer_status varchar`: `not_started`, `pending`, `successful`, `failed`
- `seller_transfer_id varchar nullable`
- `platform_commission_transfer_reference varchar nullable`
- `platform_commission_transfer_status varchar`: `not_started`, `pending`, `successful`, `failed`
- `platform_commission_transfer_id varchar nullable`
- `funded_at timestamp nullable`
- `released_at timestamp nullable`
- `refunded_at timestamp nullable`
- `metadata jsonb nullable`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `order_id unique`
- `buyer_id`
- `seller_id`
- `status`
- `flutterwave_tx_ref unique`

### seller_payout_accounts

Purpose: seller bank account and payout provider metadata.

Key fields:

- `id uuid primary key`
- `user_id uuid unique`
- `bank_name varchar`
- `bank_code varchar`
- `account_number varchar`
- `account_name varchar`
- `currency varchar`
- `status enum`: `pending`, `active`, `failed`
- `flutterwave_subaccount_id varchar nullable`
- `flutterwave_subaccount_reference varchar nullable`
- `failure_reason text nullable`
- `metadata jsonb nullable`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `user_id unique`
- `status`

### contracts

Purpose: listing-linked commercial contracts with signatures and SignNow metadata.

Key fields:

- `id uuid primary key`
- `party1_id uuid`
- `party2_id uuid`
- `listing_id uuid nullable`
- `terms text`
- `metadata jsonb nullable`
- `status enum`: `draft`, `proposed`, `under_review`, `signed`, `executed`, `terminated`
- `party1_signed_at timestamp nullable`
- `party2_signed_at timestamp nullable`
- `party1_signature text nullable`
- `party2_signature text nullable`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `party1_id`
- `party2_id`
- `listing_id`
- `status`
- `created_at`

### auctions

Purpose: auction wrapper for auction-type listings.

Key fields:

- `id uuid primary key`
- `listing_id uuid unique`
- `start_time timestamp`
- `end_time timestamp`
- `starting_bid decimal(10,2)`
- `current_bid decimal(10,2) nullable`
- `minimum_increment decimal(10,2)`
- `status varchar`: `active`, `completed`, `cancelled`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `listing_id`
- `start_time`
- `end_time`
- `status`

Relationships:

- Many-to-one with `listings`
- One-to-many with `bids`

### bids

Purpose: auction bid records.

Key fields:

- `id uuid primary key`
- `auction_id uuid`
- `bidder_id uuid`
- `amount decimal(10,2)`
- `created_at timestamp`

Indexes:

- `auction_id`
- `bidder_id`
- `created_at`
- `amount`

### chats

Purpose: direct user messages and unread state.

Key fields:

- `id uuid primary key`
- `sender_id uuid`
- `receiver_id uuid`
- `thread_id varchar`
- `message text`
- `read boolean`
- `read_at timestamp nullable`
- `created_at timestamp`

Indexes:

- `sender_id`
- `receiver_id`
- `thread_id`
- `created_at`

Implementation note: `thread_id` is built as a deterministic pair key from two user IDs. Keep it string-compatible rather than validating it as a single UUID.

### notifications

Purpose: user notification inbox.

Key fields:

- `id uuid primary key`
- `user_id uuid`
- `title varchar`
- `message text`
- `read boolean`
- `read_at timestamp nullable`
- `notification_type varchar`: `info`, `success`, `warning`, `error`
- `metadata jsonb nullable`
- `created_at timestamp`

Indexes:

- `user_id`
- `read`
- `created_at`

### forum_posts

Purpose: public/community discussion posts.

Key fields:

- `id uuid primary key`
- `author_id varchar nullable`
- `author_name varchar`
- `title varchar`
- `content text`
- `category varchar`
- `tags text[]`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `category`
- `created_at`

### forum_replies

Purpose: replies to forum posts.

Key fields:

- `id uuid primary key`
- `post_id uuid`
- `author_id varchar nullable`
- `author_name varchar`
- `content text`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `post_id`
- `created_at`

Relationship:

- Many-to-one with `forum_posts`, cascade delete on post removal

### events

Purpose: public/admin-managed events.

Key fields:

- `id uuid primary key`
- `title varchar`
- `description text nullable`
- `date date`
- `location varchar`
- `image_url text`
- `registration_url text nullable`
- `featured boolean`
- `status enum`: `draft`, `published`, `archived`
- `created_at timestamp`
- `updated_at timestamp`

Indexes:

- `status`
- `date`
- `featured`

### audit_logs

Purpose: audit trail for sensitive actions.

Key fields:

- `id uuid primary key`
- `user_id uuid`
- `action varchar`
- `metadata jsonb nullable`
- `ip_address text nullable`
- `user_agent text nullable`
- `timestamp timestamp`

Indexes:

- `user_id`
- `action`
- `timestamp`

### revoked_refresh_tokens

Purpose: persistent logout/revocation store for refresh tokens. Tokens are stored as SHA-256 hashes, not raw bearer tokens.

Key fields:

- `id uuid primary key`
- `token_hash varchar unique`
- `user_id uuid nullable`
- `expires_at timestamp nullable`
- `created_at timestamp`

Indexes:

- `token_hash unique`
- `user_id`
- `expires_at`

## 3. Current Relationship Map

```text
users 1--1 miners
users 1--1 investors
miners 1--* listings
listings 1--* documents
listings 1--* orders
listings 1--* auctions
auctions 1--* bids
users 1--* bids
users 1--* documents
users 1--* notifications
users 1--* chats as sender
users 1--* chats as receiver
users 1--* orders as buyer
users 1--* orders as seller
orders 1--1 escrow_transactions
users 1--1 seller_payout_accounts
contracts *--1 users as party1
contracts *--1 users as party2
contracts *--1 listings
forum_posts 1--* forum_replies
```

## 4. Proposed Miners Hub Extensions

These tables are not yet implemented. Add them with migrations when the associated roadmap modules begin.

### mine_sites

Purpose: physical mining site registry and GIS anchor.

Suggested fields:

- `id uuid primary key`
- `name varchar`
- `operator_id uuid references miners(id)`
- `license_id uuid nullable`
- `mineral_types text[]`
- `state varchar`
- `lga varchar nullable`
- `community varchar nullable`
- `latitude decimal nullable`
- `longitude decimal nullable`
- `boundary_polygon jsonb nullable` for MVP GeoJSON storage
- `site_status enum('planned', 'active', 'suspended', 'closed')`
- `risk_level enum('low', 'medium', 'high', 'critical')`
- `document_ids uuid[]`
- `production_report_ids uuid[]`
- `compliance_case_ids uuid[]`
- `environmental_record_ids uuid[]`
- `metadata jsonb nullable`
- `created_at timestamp`
- `updated_at timestamp`

MVP implementation stores coordinates as numeric latitude/longitude and optional GeoJSON boundary data. Recommendation: enable PostGIS before polygon editing, proximity search, clustering, and advanced layer queries.

### licenses

Purpose: mining license lifecycle.

Suggested fields:

- `id uuid primary key`
- `holder_user_id uuid references users(id)`
- `site_id uuid nullable references mine_sites(id)`
- `license_number varchar unique`
- `license_type varchar`
- `issuing_authority varchar`
- `issue_date date`
- `expiry_date date`
- `status varchar`
- `renewal_status varchar nullable`
- `document_ids uuid[]`
- `review_notes text nullable`
- `reviewed_by uuid nullable references users(id)`
- `reviewed_at timestamp nullable`
- `created_at timestamp`
- `updated_at timestamp`

Implemented statuses:

- License status: `submitted`, `under_review`, `approved`, `rejected`, `expired`
- Renewal status: `not_due`, `due_soon`, `in_progress`, `renewed`

### compliance_cases

Purpose: inspection findings, violations, assignments, and corrective actions.

Suggested fields:

- `id uuid primary key`
- `site_id uuid references mine_sites(id)`
- `subject_user_id uuid nullable references users(id)`
- `case_type varchar`
- `severity varchar`
- `status varchar`
- `assigned_to uuid nullable references users(id)`
- `findings text`
- `required_actions jsonb`
- `due_date date nullable`
- `inspection_scheduled_at timestamp nullable`
- `inspector_name varchar nullable`
- `inspection_notes text nullable`
- `closed_at timestamp nullable`
- `created_at timestamp`
- `updated_at timestamp`

Implemented board statuses: `open`, `inspection_scheduled`, `action_required`, `resolved`, `closed`.

Implemented severities: `low`, `medium`, `high`, `critical`.

### production_reports

Purpose: miner production reporting and royalty-ready data.

Suggested fields:

- `id uuid primary key`
- `site_id uuid references mine_sites(id)`
- `miner_id uuid references miners(id)`
- `mineral_type varchar`
- `period_start date`
- `period_end date`
- `quantity decimal(12,2)`
- `unit varchar`
- `grade varchar nullable`
- `destination varchar nullable`
- `estimated_value decimal(14,2) nullable`
- `royalty_rate decimal(5,2)`
- `royalty_due decimal(14,2) nullable`
- `supporting_document_ids uuid[]`
- `status varchar`
- `submitted_at timestamp nullable`
- `reviewed_by uuid nullable references users(id)`
- `reviewed_at timestamp nullable`
- `review_notes text nullable`
- `metadata jsonb nullable`
- `created_at timestamp`
- `updated_at timestamp`

Implemented statuses: `draft`, `submitted`, `under_review`, `approved`, `rejected`, `overdue`.

MVP royalty estimate: `royalty_due = estimated_value * royalty_rate / 100`. The default royalty rate is 3 percent until an official formula is configured.

### laboratory_partners

Purpose: lab partner registry.

Suggested fields:

- `id uuid primary key`
- `user_id uuid nullable references users(id)`
- `company_name varchar`
- `accreditation_number varchar nullable`
- `address text nullable`
- `status varchar`
- `created_at timestamp`
- `updated_at timestamp`

### lab_results

Purpose: assay results and certificates.

Suggested fields:

- `id uuid primary key`
- `lab_id uuid references laboratory_partners(id)`
- `requester_id uuid references users(id)`
- `listing_id uuid nullable references listings(id)`
- `production_report_id uuid nullable references production_reports(id)`
- `sample_reference varchar`
- `mineral_type varchar`
- `grade varchar nullable`
- `result_payload jsonb`
- `certificate_url text nullable`
- `status varchar`
- `verified_at timestamp nullable`
- `created_at timestamp`
- `updated_at timestamp`

### logistics_providers

Purpose: transporter/warehouse partner registry.

Suggested fields:

- `id uuid primary key`
- `user_id uuid nullable references users(id)`
- `company_name varchar`
- `service_areas text[]`
- `capabilities text[]`
- `status varchar`
- `contact_email varchar nullable`
- `contact_phone varchar nullable`
- `created_at timestamp`
- `updated_at timestamp`

### shipments

Purpose: order-linked logistics lifecycle.

Suggested fields:

- `id uuid primary key`
- `order_id uuid references orders(id)`
- `provider_id uuid nullable references logistics_providers(id)`
- `quote_amount decimal(12,2) nullable`
- `pickup_location text`
- `delivery_location text`
- `mineral_passport_id uuid nullable`
- `status varchar`
- `current_milestone varchar nullable`
- `milestones jsonb`
- `handoff_evidence jsonb nullable`
- `delivered_at timestamp nullable`
- `created_at timestamp`
- `updated_at timestamp`

### logistics_quote_requests

Purpose: persisted public or authenticated haulage quote requests.

Key fields:

- `id uuid primary key`
- `requester_user_id uuid nullable references users(id)`
- `order_id uuid nullable references orders(id)`
- `origin varchar`
- `destination varchar`
- `commodity varchar`
- `weight decimal(12,2)`
- `container_type varchar`
- `contact_name varchar`
- `contact_email varchar`
- `status varchar`
- `quoted_amount decimal(12,2) nullable`
- `quote_notes text nullable`
- `created_at timestamp`
- `updated_at timestamp`

### mineral_passports

Purpose: traceability certificate for a verified mineral batch.

Suggested fields:

- `id uuid primary key`
- `passport_number varchar unique`
- `site_id uuid references mine_sites(id)`
- `miner_id uuid references miners(id)`
- `production_report_id uuid nullable references production_reports(id)`
- `lab_result_id uuid nullable references lab_results(id)`
- `listing_id uuid nullable references listings(id)`
- `order_id uuid nullable references orders(id)`
- `shipment_id uuid nullable references shipments(id)`
- `contract_id uuid nullable references contracts(id)`
- `status varchar`
- `qr_code_url text nullable`
- `public_verification_token varchar unique`
- `issued_at timestamp nullable`
- `created_at timestamp`
- `updated_at timestamp`

### environmental_records

Purpose: environmental inspections, incidents, and remediation evidence.

Suggested fields:

- `id uuid primary key`
- `site_id uuid references mine_sites(id)`
- `reported_by uuid references users(id)`
- `record_type varchar`
- `severity varchar`
- `description text`
- `latitude decimal nullable`
- `longitude decimal nullable`
- `evidence_urls text[]`
- `status varchar`
- `assigned_to uuid nullable references users(id)`
- `resolved_at timestamp nullable`
- `created_at timestamp`
- `updated_at timestamp`

### investor_opportunities

Purpose: investment-ready opportunity listings.

Suggested fields:

- `id uuid primary key`
- `site_id uuid nullable references mine_sites(id)`
- `sponsor_id uuid references users(id)`
- `title varchar`
- `mineral_focus text[]`
- `capital_required decimal(14,2) nullable`
- `investment_type varchar`
- `risk_rating varchar nullable`
- `summary text`
- `documents jsonb nullable`
- `status varchar`
- `published_at timestamp nullable`
- `created_at timestamp`
- `updated_at timestamp`

## 5. Schema Governance

- Use explicit TypeORM migrations for every schema change.
- Add indexes for foreign keys, statuses, created timestamps, and high-traffic filters.
- Prefer enum values only where business state is stable; use lookup/config tables if government workflow states need runtime configuration.
- Keep sensitive KYC, bank, and document metadata access role-restricted.
- Preserve `created_at`/`updated_at` on mutable records.
- Add audit logs or immutable event tables for regulated actions.
- Use PostGIS for mine-site geography instead of storing complex GIS as plain strings.
