# Miners Hub API Contracts

## 1. Overview

The Miners Hub backend exposes a REST API under the `/api` global prefix and a Socket.IO chat gateway. The frontend API clients in `miners-hub-frontend/lib/api` call these endpoints with the same `/api/...` paths.

Authentication uses JWT bearer tokens for protected endpoints. Admin endpoints require `admin` role authorization.

## 2. Shared Conventions

- Base API path: `/api`
- Auth header: `Authorization: Bearer <accessToken>`
- IDs: UUID strings
- Pagination query shape: `limit`, `offset`
- Common list response shape where pagination is used:

```ts
{
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
```

- Common timestamps: ISO date strings in API JSON responses.
- File uploads: `multipart/form-data`.

## 3. Authentication

### POST /api/auth/register

Access: public

Request:

```ts
{
  name: string;
  email: string;
  password: string;
  role?: "miner" | "investor" | "government" | "admin";
}
```

Response:

```ts
{
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

### POST /api/auth/login

Access: public

Request:

```ts
{
  email: string;
  password: string;
}
```

Response:

```ts
{
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

### POST /api/auth/logout

Access: public

Request:

```ts
{
  refreshToken?: string;
}
```

Response:

```ts
{
  message: string;
}
```

### GET /api/auth/me

Access: authenticated

Response:

```ts
{
  user: User;
}
```

### POST /api/auth/refresh

Access: public

Request:

```ts
{
  refreshToken: string;
}
```

Response:

```ts
{
  accessToken: string;
}
```

## 4. Users and Profiles

### GET /api/users/miners/verified

Access: public

Response: `Miner[]`

### GET /api/users/profile

Access: authenticated

Response: current `User` with role profile relations where available.

### PUT /api/users/profile

Access: authenticated

Request: partial profile payload. Used by onboarding to update base user fields plus miner/investor profile data.

Onboarding draft fields:

```ts
{
  onboardingStep?: number;
  onboardingDraft?: {
    formData?: Record<string, unknown>;
    additionalDocs?: Array<{ key: string; label: string }>;
    step?: number;
    savedAt?: string;
  } | null;
}
```

Response: updated `User`.

### GET /api/users/payout-account

Access: authenticated

Response: `SellerPayoutAccount | null`

### POST /api/users/payout-account

Access: authenticated seller/miner

Request:

```ts
{
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  currency?: string;
}
```

Response: `SellerPayoutAccount`

## 5. KYC

### POST /api/kyc/metamap/start

Access: authenticated

Request:

```ts
{
  identityId?: string;
  verificationId?: string;
  payload?: Record<string, unknown>;
}
```

Response:

```ts
{
  status: "pending" | "verified" | "rejected";
  verificationStatus: "pending" | "verified" | "rejected";
  onboardingComplete: boolean;
  metamapIdentityId?: string | null;
  metamapVerificationId?: string | null;
  kycSubmittedAt?: string | null;
  kycVerifiedAt?: string | null;
  kycRejectedAt?: string | null;
}
```

### POST /api/kyc/metamap/complete

Access: authenticated

Request: same as start.

Response: same as start.

### GET /api/kyc/status

Access: authenticated

Response: same KYC status object.

## 6. Listings

### GET /api/listings

Access: public

Query:

```ts
{
  mineralType?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  gradePurity?: string;
  minQuantity?: number;
  maxQuantity?: number;
  sellerVerificationStatus?: "pending" | "verified" | "rejected";
  listingType?: "buy_now" | "auction";
  limit?: number;
  offset?: number;
}
```

Response: paginated published listings with seller verification state and listing document review metadata when available.

### GET /api/listings/my/all

Access: authenticated miner

Response: `Listing[]`

### GET /api/listings/:id

Access: public

Response: published `Listing`.

### POST /api/listings

Access: authenticated miner

Request:

```ts
{
  mineralType: string;
  quantity: number;
  price: number;
  gradePurity?: string;
  location?: string;
  listingType?: "buy_now" | "auction";
  moisturePercentage?: number;
  images?: string[];
}
```

Response: submitted `Listing`.

### PATCH /api/listings/:id

Access: authenticated listing owner

Request: partial listing payload.

Response: updated listing resubmitted for review.

### DELETE /api/listings/:id

Access: authenticated listing owner

Response:

```ts
{
  success: true;
}
```

## 7. Orders and Escrow

### POST /api/orders

Access: authenticated buyer/investor

Request:

```ts
{
  listingId: string;
  quantity: number;
  deliveryAddress?: string;
}
```

Response: `Order`

### GET /api/orders

Access: authenticated

Query:

```ts
{
  role?: "buyer" | "seller";
  status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  limit?: number;
  offset?: number;
}
```

Response: paginated orders.

### GET /api/orders/:id

Access: authenticated buyer or seller on the order

Response: `Order`

### POST /api/orders/:id/payment

Access: authenticated buyer

Purpose: legacy/manual payment confirmation.

Response: updated `Order`.

### POST /api/orders/:id/escrow/initiate

Access: authenticated buyer

Response:

```ts
{
  order: Order;
  escrow: EscrowTransaction;
  paymentLink?: string | null;
  txRef: string;
}
```

### POST /api/orders/:id/cancel

Access: authenticated buyer or seller

Response: updated `Order`.

### PATCH /api/orders/:id/status

Access: authenticated buyer or seller, constrained by allowed transitions.

Request:

```ts
{
  status: "pending" |
    "confirmed" |
    "processing" |
    "shipped" |
    "delivered" |
    "cancelled" |
    "refunded";
}
```

Response: updated `Order`.

### POST /api/escrow/flutterwave/webhook

Access: payment provider webhook

Headers: Flutterwave verification hash where configured.

Response:

```ts
{
  received: true;
  status: string;
}
```

## 8. Contracts

### POST /api/contracts

Access: authenticated investor/buyer

Request:

```ts
{
  party2Id?: string;
  listingId: string;
  title?: string;
  terms: string;
  value?: number;
  startDate?: string;
  endDate?: string;
}
```

Response: `Contract`

### GET /api/contracts

Access: authenticated

Query:

```ts
{
  status?: "draft" | "proposed" | "under_review" | "signed" | "executed" | "terminated";
  limit?: number;
  offset?: number;
}
```

Response: paginated contracts for the current user.

### GET /api/contracts/:id

Access: authenticated contract party

Response: `Contract`

### PATCH /api/contracts/:id/status

Access: authenticated contract party

Request:

```ts
{
  status: "draft" |
    "proposed" |
    "under_review" |
    "signed" |
    "executed" |
    "terminated";
}
```

Response: updated `Contract`.

### POST /api/contracts/:id/sign

Access: authenticated contract party

Request:

```ts
{
  signature: string;
}
```

Response: updated `Contract`.

### GET /api/contracts/:id/signnow-link

Access: authenticated contract party

Query:

```ts
{
  redirectUri?: string;
}
```

Response:

```ts
{
  link: string;
}
```

### POST /api/contracts/:id/sync-signnow

Access: authenticated contract party

Response: updated `Contract`.

### POST /api/webhooks/signnow

Access: SignNow webhook

Response:

```ts
{
  ok: true;
}
```

## 9. Auctions

### POST /api/auctions

Access: authenticated listing owner/miner

Request:

```ts
{
  listingId: string;
  startTime: string;
  endTime: string;
  startingBid: number;
  minimumIncrement?: number;
}
```

Response: `Auction`

### GET /api/auctions

Access: public

Query: `limit`, `offset`

Response: paginated active auctions.

### GET /api/auctions/:id

Access: public

Response: auction with bids.

### POST /api/auctions/:id/bids

Access: authenticated bidder

Request:

```ts
{
  amount: number;
}
```

Response: `Bid`

### GET /api/auctions/:id/bids

Access: public

Query: `limit`, `offset`

Response: paginated bids.

## 10. Documents and Media

### POST /api/documents/upload

Access: authenticated

Content type: `multipart/form-data`

Fields:

- `file`
- `type`: `kyc`, `mining_licence`, `listing_attachment`, `contract`, `other`
- `listingId?`
- `uploadCategory?`

Response: `Document`

### GET /api/documents

Access: authenticated

Response: current user's documents.

### GET /api/documents/:id

Access: authenticated owner or admin

Response: `Document`

### DELETE /api/documents/:id

Access: authenticated owner or admin

Response: empty success response.

Frontend note: `downloadDocumentFile()` references `/api/documents/:id/file`, but no backend endpoint currently exists for that route.

### POST /api/media/upload

Access: authenticated

Content type: `multipart/form-data`

Fields:

- `file`
- `context?`: `profile`, `listing`, `event`, `general`

Response:

```ts
{
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}
```

## 11. Notifications

### GET /api/notifications

Access: authenticated

Response:

```ts
{
  notifications: Notification[];
}
```

### GET /api/notifications/unread-count

Access: authenticated

Response:

```ts
{
  count: number;
}
```

### POST /api/notifications

Access: authenticated

Request:

```ts
{
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  metadata?: Record<string, unknown>;
}
```

Response:

```ts
{
  notification: Notification;
}
```

### PATCH /api/notifications/read-all

Access: authenticated

Response:

```ts
{
  success: true;
}
```

### PATCH /api/notifications/:id/read

Access: authenticated notification owner

Response:

```ts
{
  notification: Notification;
}
```

## 12. Chats and WebSockets

### POST /api/chats

Access: authenticated

Request:

```ts
{
  receiverId: string;
  message: string;
}
```

Response: `ChatMessage`

### GET /api/chats/threads

Access: authenticated

Response: chat thread summaries with latest message and unread count.

### GET /api/chats/threads/:threadId

Access: authenticated thread participant

Query: `limit`, `offset`

Response: messages in the thread; unread messages for the current receiver are marked read.

### PATCH /api/chats/:id/read

Access: authenticated receiver

Response: updated message.

### Socket.IO Chat Gateway

Namespace/path: backend Socket.IO gateway for chat.

Authentication: JWT token in socket handshake auth.

Client events:

- `chat:join` with `{ threadId: string }`
- `chat:leave` with `{ threadId: string }`
- `chat:send` with `{ receiverId: string; message: string }`

Server events:

- `chat:message`
- `chat:thread:update`
- `chat:error`

## 13. Forum

### GET /api/forum/posts

Access: public

Query:

```ts
{
  category?: "all" | "general" | "equipment" | "investment" | "policy";
  search?: string;
}
```

Response: `ForumPost[]`

### GET /api/forum/posts/:id

Access: public

Response: `ForumPost` with replies.

### POST /api/forum/posts

Access: authenticated

Request:

```ts
{
  title: string;
  content: string;
  category?: "general" | "equipment" | "investment" | "policy";
}
```

Response: `ForumPost`

### POST /api/forum/posts/:id/replies

Access: authenticated

Request:

```ts
{
  content: string;
}
```

Response: `ForumReply`

## 14. Events

### GET /api/events

Access: public

Query:

```ts
{
  limit?: number;
}
```

Response: published events.

Admin event create/update/delete routes are listed under Admin.

## 15. AI

### POST /api/ai/chat

Access: public

Request:

```ts
{
  message: string;
  history?: Array<{ role: "user" | "model"; content: string }>;
}
```

Response:

```ts
{
  response: string;
}
```

### GET /api/ai/market-summary

Access: public

Response:

```ts
{
  summary: string;
  generatedAt: string;
}
```

### POST /api/ai/forecast

Access: public

Request:

```ts
{
  mineral: string;
  historicalPrices: number[];
}
```

Response:

```ts
{
  prices: number[];
}
```

## 16. Admin

All admin routes require authenticated admin role.

### GET /api/admin/users

Query:

```ts
{
  status?: "pending" | "verified" | "rejected";
  limit?: number;
  offset?: number;
}
```

Response: `User[]`

### GET /api/admin/miner-registry

Purpose: admin registry list composed from miner profiles, user/KYC state, documents, licenses, and listing activity.

Query:

```ts
{
  status?: "pending" | "verified" | "rejected";
  documentStatus?: "pending" | "approved" | "rejected";
  location?: string;
  mineralType?: string;
  limit?: number;
  rawOffset?: number;
}
```

Response:

```ts
Array<{
  id: string;
  userId: string;
  companyName: string;
  location: string;
  miningLicence?: string | null;
  companyRegNumber?: string | null;
  businessAddress?: string | null;
  businessWebsite?: string | null;
  industry?: string | null;
  yearsInOperation?: string | null;
  cooperativeName?: string | null;
  cooperativeRegNumber?: string | null;
  partnerType?: string | null;
  partnerOrganization?: string | null;
  miningEquipment: string[];
  certifications: string[];
  user: {
    id: string;
    name?: string | null;
    email: string;
    phoneNumber?: string | null;
    verificationStatus: "pending" | "verified" | "rejected";
    onboardingComplete: boolean;
    kycSubmittedAt?: string | null;
    kycVerifiedAt?: string | null;
    kycRejectedAt?: string | null;
    metamapVerificationId?: string | null;
    createdAt: string;
  } | null;
  documentSummary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  listingSummary: {
    total: number;
    published: number;
    submitted: number;
    minerals: string[];
  };
  licenseStatus: "pending" | "approved" | "rejected" | "missing";
  latestDocumentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}>;
```

### GET /api/admin/miner-registry/:id

Purpose: admin registry detail view with verification state, documents, listing activity, and timeline.

Response:

```ts
AdminMinerRegistryItem & {
  verification: {
    status: "pending" | "verified" | "rejected";
    onboardingComplete: boolean;
    kycSubmittedAt?: string | null;
    kycVerifiedAt?: string | null;
    kycRejectedAt?: string | null;
    metamapVerificationId?: string | null;
    licenseStatus: "pending" | "approved" | "rejected" | "missing";
  };
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    reviewStatus: "pending" | "approved" | "rejected";
    reviewNotes?: string | null;
    reviewedAt?: string | null;
    createdAt: string;
  }>;
  listings: Array<{
    id: string;
    mineralType: string;
    status: string;
    quantity: number;
    price: number;
    createdAt: string;
  }>;
  timeline: Array<{
    id: string;
    title: string;
    status: string;
    occurredAt: string;
    description?: string | null;
  }>;
}
```

### PATCH /api/admin/users/:id/verify

Request:

```ts
{
  status: "pending" | "verified" | "rejected";
}
```

Response: updated `User`.

## Mine Sites

### GET /api/mine-sites

Purpose: authenticated mine-site map registry. Admins see all sites; miners see sites linked to their miner profile.

Query:

```ts
{
  search?: string;
  state?: string;
  mineralType?: string;
  siteStatus?: "planned" | "active" | "suspended" | "closed";
  riskLevel?: "low" | "medium" | "high" | "critical";
  operatorId?: string;
  page?: number;
  limit?: number;
  rawOffset?: number;
}
```

Response: paginated `MineSite[]`.

### POST /api/mine-sites

Request:

```ts
{
  name: string;
  operatorId?: string; // required for admins; inferred from current miner for miners
  licenseId?: string | null;
  mineralTypes: string[];
  state: string;
  lga?: string | null;
  community?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  boundaryPolygon?: Record<string, unknown> | null;
  siteStatus?: "planned" | "active" | "suspended" | "closed";
  riskLevel?: "low" | "medium" | "high" | "critical";
  documentIds?: string[];
  productionReportIds?: string[];
  complianceCaseIds?: string[];
  environmentalRecordIds?: string[];
  metadata?: Record<string, unknown> | null;
}
```

Response: created `MineSite`.

### GET /api/mine-sites/:id

Response: `MineSite`.

### PATCH /api/mine-sites/:id

Request: partial mine-site payload. Admins can reassign `operatorId`; miners can update only their own mine sites.

Response: updated `MineSite`.

### DELETE /api/mine-sites/:id

Response:

```ts
{
  success: true;
}
```

## Licensing and Compliance

### GET /api/licenses

Purpose: authenticated license queue. Admin and government users see all licenses; miners see their own submissions.

Query:

```ts
{
  status?: "submitted" | "under_review" | "approved" | "rejected" | "expired";
  renewalStatus?: "not_due" | "due_soon" | "in_progress" | "renewed";
  search?: string;
  siteId?: string;
  page?: number;
  limit?: number;
  rawOffset?: number;
}
```

Response: paginated licenses with holder, site, and expiry indicators.

### POST /api/licenses

Request:

```ts
{
  holderUserId?: string; // admin/government only; miners submit for self
  siteId?: string | null;
  licenseNumber: string;
  licenseType: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  documentIds?: string[];
}
```

Response: created license with status `submitted`.

### GET /api/licenses/:id

Response: license detail.

### PATCH /api/licenses/:id

Request: partial license payload. Miner edits reset the record to `submitted`; reviewer edits preserve review status.

Response: updated license.

### PATCH /api/licenses/:id/status

Request:

```ts
{
  status: "submitted" | "under_review" | "approved" | "rejected" | "expired";
  reviewNotes?: string;
}
```

Response: reviewed license with reviewer metadata.

### GET /api/compliance-cases

Purpose: compliance case board and inspection schedule.

Query:

```ts
{
  status?: "open" | "inspection_scheduled" | "action_required" | "resolved" | "closed";
  severity?: "low" | "medium" | "high" | "critical";
  caseType?: string;
  siteId?: string;
  page?: number;
  limit?: number;
  rawOffset?: number;
}
```

Response: paginated compliance cases with linked site, subject user, assignee, inspection schedule, and required actions.

### POST /api/compliance-cases

Request:

```ts
{
  siteId: string;
  subjectUserId?: string | null;
  caseType: string;
  severity?: "low" | "medium" | "high" | "critical";
  assignedTo?: string | null;
  findings: string;
  requiredActions?: Array<Record<string, unknown>>;
  dueDate?: string | null;
  inspectionScheduledAt?: string | null;
  inspectorName?: string | null;
  inspectionNotes?: string | null;
}
```

Response: created compliance case.

### GET /api/compliance-cases/:id

Response: compliance case detail.

### PATCH /api/compliance-cases/:id

Request: partial compliance case payload, including status and inspection schedule updates.

Response: updated compliance case.

## Production Reports

### GET /api/production-reports

Purpose: authenticated production report queue. Admin and government users see all reports; miners see reports for their own miner profile.

Query:

```ts
{
  status?: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "overdue";
  siteId?: string;
  minerId?: string;
  mineralType?: string;
  periodStart?: string;
  periodEnd?: string;
  page?: number;
  limit?: number;
  rawOffset?: number;
}
```

Response: paginated production reports with linked site, miner, reviewer, evidence IDs, and royalty fields.

### POST /api/production-reports

Request:

```ts
{
  siteId: string;
  minerId?: string; // reviewer-created reports only; miners infer from site ownership
  mineralType: string;
  periodStart: string;
  periodEnd: string;
  quantity: number;
  unit: string;
  grade?: string | null;
  destination?: string | null;
  estimatedValue?: number | null;
  royaltyRate?: number;
  supportingDocumentIds?: string[];
  status?: "draft" | "submitted";
  metadata?: Record<string, unknown> | null;
}
```

Response: created production report. `royaltyDue` is calculated from `estimatedValue` and `royaltyRate`.

### GET /api/production-reports/:id

Response: production report detail.

### PATCH /api/production-reports/:id

Request: partial production report payload. Miner edits resubmit the report unless saved as draft.

Response: updated production report.

### PATCH /api/production-reports/:id/review

Request:

```ts
{
  status: "submitted" | "under_review" | "approved" | "rejected" | "overdue";
  reviewNotes?: string;
}
```

Response: reviewed production report with reviewer metadata.

### GET /api/analytics/production

Response:

```ts
{
  totalReports: number;
  approvedReports: number;
  pendingReview: number;
  totalQuantity: number;
  estimatedValue: number;
  royaltyDue: number;
  byMineral: Record<
    string,
    {
      quantity: number;
      value: number;
      royalty: number;
    }
  >;
}
```

### GET /api/admin/listings

Query:

```ts
{
  status?: "draft" | "submitted" | "under_review" | "published" | "sold" | "expired" | "archived";
  limit?: number;
  offset?: number;
}
```

Response: `Listing[]`

### PATCH /api/admin/listings/:id/status

Request:

```ts
{
  status: "draft" |
    "submitted" |
    "under_review" |
    "published" |
    "sold" |
    "expired" |
    "archived";
}
```

Response: updated `Listing`.

### GET /api/admin/orders

Query:

```ts
{
  status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  limit?: number;
  offset?: number;
}
```

Response: `Order[]`

### GET /api/admin/orders/:id

Response: `Order`

### POST /api/admin/orders/:id/escrow/release

Response: updated `EscrowTransaction`

### POST /api/admin/orders/:id/escrow/refund

Response: updated `EscrowTransaction`

### GET /api/admin/documents

Query:

```ts
{
  status?: "pending" | "approved" | "rejected";
  type?: "kyc" | "mining_licence" | "listing_attachment" | "contract" | "other";
  limit?: number;
  offset?: number;
}
```

Response: `Document[]`

### PATCH /api/admin/documents/:id/review

Request:

```ts
{
  status: "pending" | "approved" | "rejected";
  notes?: string;
}
```

Response: updated `Document`.

### GET /api/admin/events

Response: `Event[]`

### POST /api/admin/events

Request:

```ts
{
  title: string;
  description?: string;
  date: string;
  location: string;
  imageUrl: string;
  registrationUrl?: string;
  featured?: boolean;
  status?: "draft" | "published" | "archived";
}
```

Response: `Event`

### PATCH /api/admin/events/:id

Request: partial event payload.

Response: updated `Event`.

### DELETE /api/admin/events/:id

Response:

```ts
{
  success: true;
}
```

## 17. Laboratory Results

### GET /api/lab-results/partners

Access: authenticated

Response: laboratory partner list with status, accreditation, address, and contact fields.

### POST /api/lab-results/partners

Access: admin

Request:

```ts
{
  userId?: string | null;
  companyName: string;
  accreditationNumber?: string | null;
  address?: string | null;
  status?: "pending" | "active" | "suspended";
  contactEmail?: string | null;
  contactPhone?: string | null;
}
```

Response: created laboratory partner.

### PATCH /api/lab-results/partners/:id

Access: admin

Request: partial laboratory partner payload.

Response: updated laboratory partner.

### POST /api/lab-results

Access: authenticated

Request:

```ts
{
  labId: string;
  listingId?: string | null;
  productionReportId?: string | null;
  mineralPassportId?: string | null;
  sampleReference: string;
  mineralType: string;
  grade?: string | null;
  assayValue?: number | null;
  assayUnit?: string | null;
  resultPayload?: Record<string, unknown>;
  certificateUrl?: string | null;
}
```

Response: created lab result. Results with certificate or payload data move to `submitted`; bare test requests stay `requested`.

### GET /api/lab-results

Access: authenticated

Query: `status`, `labId`, `listingId`, `productionReportId`, pagination fields.

Response: paginated lab result list. Admins see all records; users see records they requested, laboratory records assigned to their user, or records linked to their listings/production reports.

### PATCH /api/lab-results/:id

Access: authenticated owner/linked lab/admin

Request: partial lab result payload.

Response: updated lab result.

### PATCH /api/lab-results/:id/verify

Access: admin

Request:

```ts
{
  status: "verified" | "rejected";
  reviewNotes?: string | null;
}
```

Response: verified or rejected lab result with verifier metadata.

## 18. Mineral Passports

### POST /api/mineral-passports

Access: admin or government/regulator

Request:

```ts
{
  minerId?: string;
  siteId?: string | null;
  licenseId?: string | null;
  productionReportId?: string | null;
  labResultId?: string | null;
  listingId?: string | null;
  orderId?: string | null;
  shipmentId?: string | null;
  contractId?: string | null;
  escrowTransactionId?: string | null;
  snapshot?: Record<string, unknown>;
}
```

Response: generated mineral passport with `passportNumber`, `publicVerificationToken`, `qrCodeUrl`, active status, linked record IDs, issuer metadata, and compiled snapshot.

### GET /api/mineral-passports

Access: authenticated

Query: `status`, `minerId`, `listingId`, `orderId`, pagination fields.

Response: paginated mineral passport register. Admins/regulators see all; regular users see passports linked to their miner profile or orders.

### GET /api/mineral-passports/:id

Access: authenticated user with access to the passport

Response: detailed passport with linked miner, site, license, production report, lab result, listing, order, shipment, contract, escrow, and snapshot data.

### PATCH /api/mineral-passports/:id/status

Access: admin or government/regulator

Request:

```ts
{
  status: "active" | "revoked" | "disputed" | "expired";
  reason?: string | null;
}
```

Response: updated passport. Status changes append to snapshot status history.

### GET /api/public/mineral-passports/:token

Access: public

Response: limited public verification payload for active passports only.

## 19. Environmental Records

### GET /api/environmental-records/community

Access: public

Query: `siteId`, `recordType`, `severity`, `status`, pagination fields.

Response: paginated community-safe environmental records. Private notes, reporter identity, assigned user identity, and non-public evidence metadata are excluded.

### POST /api/environmental-records

Access: authenticated

Request:

```ts
{
  siteId: string;
  recordType: "inspection" | "incident" | "community_concern" | "monitoring" | "remediation";
  severity?: "low" | "medium" | "high" | "critical";
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  evidenceUrls?: string[];
  status?: "open" | "under_review" | "action_required" | "in_remediation" | "resolved" | "closed";
  assignedTo?: string | null;
  remediationActions?: Array<{
    action: string;
    owner?: string;
    dueDate?: string;
    status?: string;
    evidenceUrls?: string[];
  }>;
  communityVisible?: boolean;
  privateNotes?: string | null;
}
```

Response: created environmental record linked to the mine site and reporter.

### GET /api/environmental-records

Access: authenticated

Query: `siteId`, `recordType`, `severity`, `status`, `assignedTo`, pagination fields.

Response: paginated environmental record dashboard. Admins and government users see all records; other users see records they reported, records assigned to them, or records for sites they operate.

### GET /api/environmental-records/:id

Access: authenticated user with access to the record

Response: environmental record detail with site, reporter, assignee, evidence, remediation actions, private notes, and audit timestamps.

### PATCH /api/environmental-records/:id

Access: authenticated user with access to the record

Request: partial environmental record update fields, including status, severity, evidence URLs, assignee, remediation actions, community visibility, private notes, and `resolvedAt`.

Response: updated environmental record.

## 20. Revenue Analytics

### GET /api/analytics/revenue

Access: authenticated

Query: `period`, `dateFrom`, `dateTo`, `mineral`, `lga`, `siteId`, `status`.

Response: revenue analytics from orders, escrow transactions, and production reports:

```ts
{
  filters: {
    period: "30d" | "90d" | "ytd" | "12m" | "custom";
    dateFrom: string;
    dateTo: string;
    mineral: string | null;
    lga: string | null;
    siteId: string | null;
    status: string | null;
  }
  totals: {
    orderCount: number;
    orderGross: number;
    escrowGross: number;
    commissionRevenue: number;
    sellerNetPayout: number;
    refundedAmount: number;
    royaltyDue: number;
    approvedRoyaltyDue: number;
    governmentRevenue: number;
  }
  byMineral: Array<{
    mineral: string;
    orderCount: number;
    orderGross: number;
    commissionRevenue: number;
    royaltyDue: number;
  }>;
  byStatus: Array<{ status: string; count: number; amount: number }>;
  royaltyByLga: Array<{
    lga: string;
    reportCount: number;
    royaltyDue: number;
    approvedRoyaltyDue: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    orderGross: number;
    commissionRevenue: number;
    royaltyDue: number;
    governmentRevenue: number;
  }>;
  recentTransactions: Array<{
    id: string;
    createdAt: string;
    mineralType: string;
    location?: string | null;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    commissionAmount: number;
    escrowStatus?: string | null;
  }>;
}
```

Admins and government users receive platform-wide analytics. Miners receive their seller-side orders and production royalties. Investors receive buyer-side order analytics.

### GET /api/analytics/revenue/export

Access: authenticated

Query: same filters as `GET /api/analytics/revenue`.

Response: CSV revenue report with summary totals, mineral breakdown, and royalty by LGA.

## 21. Investor Opportunities

### POST /api/investor-opportunities

Access: authenticated admin, government user, or miner

Request:

```ts
{
  siteId?: string | null;
  title: string;
  mineralFocus: string[];
  capitalRequired?: number | null;
  investmentType: string;
  stage?: "exploration" | "development" | "production" | "expansion";
  riskRating?: "low" | "medium" | "high" | "critical";
  licenseStatus?: string | null;
  summary: string;
  dueDiligenceDocuments?: Array<{
    title: string;
    url: string;
    type?: string;
    restricted?: boolean;
  }>;
  riskIndicators?: string[];
  dueDiligenceSummary?: Record<string, unknown> | null;
  analyticsSubscriptionEnabled?: boolean;
  status?: "draft" | "published" | "closed" | "archived";
}
```

Response: created investor opportunity with computed `riskScore`, `riskScoreBreakdown`, `dueDiligenceSummary`, and `dueDiligenceReviewStatus`. Publishing requires approved due-diligence review.

### GET /api/investor-opportunities

Access: authenticated

Query: `mineral`, `location`, `riskRating`, `stage`, `licenseStatus`, `minCapital`, `maxCapital`, `status`, pagination fields.

Response: paginated opportunity listings with mine site summary, sponsor summary, inquiry count, capital requirement, stage, license status, due diligence document metadata, ESG summary, risk score, review status, and risk indicators. Admins and government users can filter all statuses; other users see published opportunities and their own sponsored drafts.

### GET /api/investor-opportunities/:id

Access: authenticated user with access to the opportunity

Response: opportunity detail. Admins, government users, and the sponsor also receive inquiry tracker data.

### PATCH /api/investor-opportunities/:id

Access: admin, government user, or opportunity sponsor

Request: partial opportunity update, including status changes for publishing, closing, or archiving.

Response: updated opportunity.

### PATCH /api/investor-opportunities/:id/review

Access: admin or government user

Request:

```ts
{
  reviewStatus: "draft" | "pending_review" | "approved" | "action_required" | "rejected";
  reviewNotes?: string | null;
  riskScore?: number;
  riskIndicators?: string[];
  dueDiligenceSummary?: Record<string, unknown> | null;
}
```

Response: reviewed opportunity with score breakdown and reviewer metadata. If a published opportunity is moved out of `approved`, it returns to draft.

### POST /api/investor-opportunities/:id/inquiries

Access: authenticated investor; admins and government users may also test/seed inquiries

Request:

```ts
{
  message: string;
  investmentRange?: string | null;
  contactPreference?: string | null;
  dueDiligenceConsent?: boolean;
  analyticsSubscriptionInterest?: boolean;
}
```

Response: created investor inquiry.

### PATCH /api/investor-opportunities/inquiries/:id

Access: admin, government user, or opportunity sponsor

Request:

```ts
{
  status?: "new" | "contacted" | "due_diligence" | "closed";
  notes?: string | null;
}
```

Response: updated investor inquiry.

## 22. Planned API Families

The following API families are planned but not currently implemented:

- `/api/registry/miners`
- `/api/mine-sites`
- `/api/licenses`
- `/api/compliance-cases`
- `/api/production-reports`
- `/api/analytics/production`
- `/api/analytics/compliance`
- `/api/shipments`

## 23. Frontend Alignment Notes

- `lib/api/listings.ts` and the marketplace UI support mineral, location, grade, seller verification, min/max price, min/max quantity, and listing type filters.
- `lib/api/documents.ts` includes a document file download helper for `/api/documents/:id/file`; the backend currently returns document metadata at `/api/documents/:id` and does not expose that file route.
- `lib/api/users.ts` includes `getMinerProfile` and `getInvestorProfile` helpers for `/api/miners/:id` and `/api/investors/:id`; those route families are not currently implemented.
- Public logistics quote/tracking UI persists quote requests through `/api/logistics/quote-requests`; authenticated logistics management supports providers, shipments, milestones, proof links, and order/passport associations.

## Logistics

### POST /api/logistics/quote-requests

Access: public or authenticated.

Request:

```ts
{
  orderId?: string | null;
  origin: string;
  destination: string;
  commodity: string;
  weight: number;
  containerType: string;
  contactName: string;
  contactEmail: string;
}
```

Response: persisted quote request.

### GET /api/logistics/quote-requests

Access: authenticated. Admins see all requests; other users see their own authenticated requests.

Query:

```ts
{
  status?: "requested" | "quoted" | "accepted" | "declined";
  page?: number;
  limit?: number;
  rawOffset?: number;
}
```

Response: paginated quote requests.

### PATCH /api/logistics/quote-requests/:id

Access: admin.

Request:

```ts
{
  status?: "requested" | "quoted" | "accepted" | "declined";
  quotedAmount?: number | null;
  quoteNotes?: string | null;
}
```

Response: updated quote request.

### GET /api/logistics/providers

Response: `LogisticsProvider[]`.

### POST /api/logistics/providers

Access: admin.

Request:

```ts
{
  userId?: string | null;
  companyName: string;
  serviceAreas?: string[];
  capabilities?: string[];
  status?: "pending" | "active" | "suspended";
  contactEmail?: string | null;
  contactPhone?: string | null;
}
```

Response: created provider.

### POST /api/logistics/shipments

Access: authenticated order buyer, seller, or admin.

Request:

```ts
{
  orderId: string;
  providerId?: string | null;
  mineralPassportId?: string | null;
  quoteAmount?: number | null;
  pickupLocation: string;
  deliveryLocation: string;
}
```

Response: created shipment with tracking ID and initial milestone.

### GET /api/logistics/shipments

Access: authenticated. Admins see all shipments; users see shipments linked to their orders or provider profile.

Response: paginated shipments.

### GET /api/logistics/shipments/track/:trackingId

Access: public.

Response: shipment tracking detail.

### PATCH /api/logistics/shipments/:id/status

Access: linked order buyer, seller, provider user, or admin.

Request:

```ts
{
  status: "quote_requested" | "scheduled" | "picked_up" | "in_transit" | "at_checkpoint" | "delivered" | "disputed" | "cancelled";
  location?: string;
  notes?: string;
  handoffEvidence?: Record<string, unknown> | null;
}
```

Response: updated shipment with appended milestone.

## Export Readiness and Mineral Titles

### License Type Values

License records use configured Nigerian mineral-title and trade-permit categories:

```ts
type LicenseType =
  | "reconnaissance_permit"
  | "exploration_licence"
  | "small_scale_mining_lease"
  | "mining_lease"
  | "quarry_lease"
  | "water_use_permit"
  | "possess_and_purchase_licence"
  | "mineral_buying_center_licence"
  | "mineral_export_permit";
```

`POST /api/licenses` and `PATCH /api/licenses/:id` additionally accept:

```ts
{
  licenseType: LicenseType;
  annualServiceFee?: number | null;
  serviceFeePaidUntil?: string | null;
  applicationPriorityDate?: string | null;
  permitShipmentReference?: string | null;
  issuingOffice?: string | null;
  metadata?: Record<string, unknown> | null;
}
```

### POST /api/export-readiness

Access: authenticated. Admins/government users may create a checklist for any exporter; other users create for themselves.

Request:

```ts
{
  orderId?: string | null;
  mineralPassportId?: string | null;
  exporterUserId?: string;
  licenseId?: string | null;
  exportPermitDocumentId?: string | null;
  assayDocumentId?: string | null;
  invoiceDocumentId?: string | null;
  customsStatus?: "not_required" | "not_started" | "preparing" | "submitted" | "cleared" | "held" | "rejected";
  carrierReference?: string | null;
  blockingIssues?: string[];
  metadata?: Record<string, unknown> | null;
}
```

Response: created export-readiness checklist with linked exporter, license, order, mineral passport, and completeness flags.

### GET /api/export-readiness

Access: authenticated. Admins/government users see all records; other users see their own exporter records.

Query:

```ts
{
  readinessStatus?: "draft" | "under_review" | "blocked" | "ready" | "expired";
  customsStatus?: "not_required" | "not_started" | "preparing" | "submitted" | "cleared" | "held" | "rejected";
  orderId?: string;
  exporterUserId?: string; // reviewer only
  page?: number;
  limit?: number;
  rawOffset?: number;
}
```

Response: paginated export-readiness checklists.

### GET /api/export-readiness/:id

Access: authenticated reviewer or owning exporter.

Response: export-readiness checklist detail.

### PATCH /api/export-readiness/:id

Access: authenticated reviewer or owning exporter.

Request: partial export-readiness checklist payload. Non-reviewer updates return the checklist to `draft`.

Response: updated checklist.

### PATCH /api/export-readiness/:id/status

Access: admin or government user.

Request:

```ts
{
  readinessStatus: "draft" | "under_review" | "blocked" | "ready" | "expired";
  customsStatus?: "not_required" | "not_started" | "preparing" | "submitted" | "cleared" | "held" | "rejected";
  blockingIssues?: string[];
  reviewNotes?: string;
}
```

Response: reviewed checklist with reviewer metadata.

### POST /api/esg-obligations

Access: authenticated. Admins/government users may create an obligation for any responsible user; other users create obligations for themselves and linked records they can access.

Request:

```ts
{
  siteId?: string | null;
  licenseId?: string | null;
  responsibleUserId?: string;
  obligationType:
    | "community_development_agreement"
    | "environmental_impact_assessment"
    | "rehabilitation_program"
    | "reclamation_reserve"
    | "compensation_remediation"
    | "community_benefit"
    | "other";
  title: string;
  description?: string | null;
  status?: "missing" | "draft" | "submitted" | "approved" | "action_required" | "overdue" | "fulfilled" | "waived";
  documentIds?: string[];
  evidenceUrls?: string[];
  dueDate?: string | null;
  metadata?: Record<string, unknown> | null;
}
```

Response: created ESG obligation with linked site, license, responsible user, evidence, and review metadata.

### GET /api/esg-obligations

Access: authenticated. Admins/government users see all obligations; other users see obligations assigned to them.

Query:

```ts
{
  status?: "missing" | "draft" | "submitted" | "approved" | "action_required" | "overdue" | "fulfilled" | "waived";
  obligationType?: string;
  siteId?: string;
  licenseId?: string;
  responsibleUserId?: string; // reviewer only
  dueBefore?: string;
  page?: number;
  limit?: number;
  rawOffset?: number;
}
```

Response: paginated ESG obligations.

### GET /api/esg-obligations/:id

Access: authenticated reviewer or responsible user.

Response: ESG obligation detail.

### PATCH /api/esg-obligations/:id

Access: authenticated reviewer or responsible user.

Request: partial ESG obligation payload. Non-reviewer updates return the obligation to `submitted`.

Response: updated ESG obligation.

### PATCH /api/esg-obligations/:id/status

Access: admin or government user.

Request:

```ts
{
  status: "missing" | "draft" | "submitted" | "approved" | "action_required" | "overdue" | "fulfilled" | "waived";
  reviewNotes?: string;
}
```

Response: reviewed ESG obligation with reviewer metadata.

Investor opportunity responses include an `esgSummary` object when the opportunity is linked to a mine site:

```ts
{
  total: number;
  approved: number;
  fulfilled: number;
  actionRequired: number;
  overdue: number;
  dueSoonOrOverdue: number;
  types: string[];
}
```

### POST /api/aml-kyb-profiles

Access: authenticated. Admins/government users may create for any user; other users create for themselves.

Request:

```ts
{
  userId?: string;
  actorType: "buyer" | "exporter" | "buying_center" | "investor" | "miner" | "logistics_provider" | "laboratory" | "high_value_actor" | "other";
  businessName?: string | null;
  businessRegistrationNumber?: string | null;
  beneficialOwnerSummary?: string | null;
  beneficialOwnerDocumentIds?: string[];
  scumlRegistrationNumber?: string | null;
  scumlRegistrationStatus?: "not_required" | "not_provided" | "pending" | "registered" | "expired" | "rejected";
  scumlDocumentIds?: string[];
  sourceOfFundsNotes?: string | null;
  sourceOfMineralsNotes?: string | null;
  riskTier?: "low" | "medium" | "high" | "critical";
  riskReasons?: string[];
  riskIndicators?: string[];
  suspiciousActivityStatus?: "none" | "monitoring" | "escalated" | "reported" | "closed";
  reviewStatus?: "draft" | "submitted" | "under_review" | "cleared" | "action_required" | "suspicious" | "escalated" | "closed";
  metadata?: Record<string, unknown> | null;
}
```

Response: created AML/KYB profile with computed risk indicators for pending KYC, missing beneficial ownership, missing SCUML evidence, missing source notes, and missing approved mineral title/trade permit where applicable.

### GET /api/aml-kyb-profiles

Access: authenticated. Admins/government users see all profiles; other users see their own profiles.

Query: `userId`, `actorType`, `riskTier`, `reviewStatus`, `suspiciousActivityStatus`, pagination fields.

Response: paginated AML/KYB profiles.

### GET /api/aml-kyb-profiles/:id

Access: reviewer or profile owner.

Response: AML/KYB profile detail.

### PATCH /api/aml-kyb-profiles/:id

Access: reviewer or profile owner.

Request: partial AML/KYB profile payload. Non-reviewer updates resubmit the profile for review.

Response: updated AML/KYB profile with refreshed risk indicators.

### PATCH /api/aml-kyb-profiles/:id/status

Access: admin or government user.

Request:

```ts
{
  reviewStatus: "draft" | "submitted" | "under_review" | "cleared" | "action_required" | "suspicious" | "escalated" | "closed";
  riskTier?: "low" | "medium" | "high" | "critical";
  riskReasons?: string[];
  riskIndicators?: string[];
  suspiciousActivityStatus?: "none" | "monitoring" | "escalated" | "reported" | "closed";
  reviewNotes?: string | null;
}
```

Response: reviewed AML/KYB profile with reviewer metadata.
