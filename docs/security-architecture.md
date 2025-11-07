# Miners Hub - Security Architecture

**Author:** ismailawa  
**Date:** 2025-11-05  
**Version:** 1.0  
**Project:** Miners Hub - Mineral Trading & Resource Marketplace

---

## Executive Summary

Miners Hub operates in a regulated industry (mineral trading in Nigeria) requiring strict compliance with KYC/AML regulations, government oversight, and fraud prevention. This security architecture document defines the comprehensive security measures, threat model, authentication/authorization strategies, data protection mechanisms, compliance frameworks, and incident response procedures necessary to protect the platform and maintain regulatory compliance.

**Key Security Principles:**
- **Defense in Depth:** Multiple layers of security controls
- **Least Privilege:** Users only access what they need
- **Zero Trust:** Verify all requests, trust none by default
- **Compliance-First:** Built-in support for KYC/AML, audit trails, data retention
- **Privacy by Design:** GDPR-aligned data protection

---

## Threat Model

### Threat Actors

| Threat Actor | Motivation | Capabilities | Risk Level |
|-------------|------------|--------------|------------|
| **External Hackers** | Financial gain, data theft | High technical skills, automated tools | High |
| **Fraudulent Users** | Scam buyers/sellers, fake listings | Platform knowledge, social engineering | High |
| **Insider Threats** | Data access, privilege abuse | Authorized access, knowledge of systems | Medium |
| **Competitors** | Business disruption, data theft | Resource capability, technical skills | Medium |
| **Regulatory Bodies** | Compliance violations | Legal authority, audit access | Low (if compliant) |

### Threat Scenarios

1. **Authentication Bypass**
   - Risk: Unauthorized access to user accounts
   - Impact: Data theft, fraudulent transactions
   - Mitigation: Multi-factor authentication, strong password policies, session management

2. **Data Breach**
   - Risk: Exposure of sensitive user data (KYC documents, personal info)
   - Impact: Identity theft, regulatory fines, reputation damage
   - Mitigation: Encryption at rest/transit, RLS, access controls

3. **Fraudulent Transactions**
   - Risk: Fake listings, payment fraud, escrow scams
   - Impact: Financial loss, user trust erosion
   - Mitigation: KYC verification, fraud detection algorithms, content moderation

4. **SQL Injection / XSS**
   - Risk: Database compromise, client-side attacks
   - Impact: Data theft, session hijacking
   - Mitigation: Parameterized queries, input validation, output encoding

5. **Compliance Violations**
   - Risk: KYC/AML non-compliance, missing audit trails
   - Impact: Regulatory fines, platform shutdown
   - Mitigation: Automated compliance checks, immutable audit logs

6. **DDoS Attacks**
   - Risk: Service disruption
   - Impact: Platform unavailability, revenue loss
   - Mitigation: Rate limiting, CDN, DDoS protection services

---

## Authentication Architecture

### Authentication Flow

```
1. User Registration
   ├── Email + Password (min 8 chars, strength validation)
   ├── Email verification (optional in MVP)
   └── Account created in Supabase Auth

2. User Login
   ├── Credentials sent to /api/auth/login
   ├── Backend validates with Supabase Auth
   ├── JWT access token generated (15 min expiry)
   ├── JWT refresh token generated (7 day expiry)
   └── Tokens returned to frontend

3. Token Management
   ├── Access token: Stored in memory/localStorage
   ├── Refresh token: Stored in httpOnly cookie (recommended) or secure storage
   ├── Token included in Authorization header: "Bearer {token}"
   └── Auto-refresh on 401 response

4. Session Management
   ├── Session validated on each request
   ├── Invalid/expired tokens trigger logout
   └── Refresh token rotation on use
```

### Password Security

**Requirements:**
- Minimum 8 characters
- Strength validation (uppercase, lowercase, number, special char recommended)
- Password hashing: bcrypt (via Supabase Auth)
- Password reset: Secure token-based flow (future enhancement)

**Implementation:**
- Frontend: Real-time strength indicator
- Backend: Validation via class-validator
- Supabase Auth: Handles password hashing and storage

### JWT Token Strategy

**Access Token:**
- Lifetime: 15 minutes
- Storage: Memory or secure localStorage
- Claims: userId, email, role, iat, exp
- Algorithm: HS256

**Refresh Token:**
- Lifetime: 7 days
- Storage: httpOnly cookie (recommended) or secure storage
- Rotation: New refresh token on each use
- Revocation: Blacklist in database (future enhancement)

**Token Refresh Flow:**
```typescript
// Frontend interceptor
if (response.status === 401) {
  const newToken = await refreshAccessToken();
  // Retry original request with new token
}
```

### Multi-Factor Authentication (Future Enhancement)

**Planned:**
- TOTP-based 2FA (Google Authenticator, Authy)
- SMS-based OTP (for critical operations)
- Backup codes for recovery

**Implementation Priority:** Growth phase

---

## Authorization Architecture

### Role-Based Access Control (RBAC)

**Roles:**
1. **Miner** - Can create listings, manage contracts, upload documents
2. **Investor** - Can browse listings, place bids, create orders, propose contracts
3. **Government** - Can verify users/listings, monitor transactions, generate reports
4. **Admin** - Full CRUD access, content moderation, dispute resolution

### Permission Matrix

| Resource | Miner | Investor | Government | Admin |
|----------|-------|---------|------------|-------|
| Create Listing | ✅ | ❌ | ❌ | ✅ |
| Edit Own Listing | ✅ | ❌ | ❌ | ✅ |
| Delete Own Listing | ✅ | ❌ | ❌ | ✅ |
| Browse Listings | ✅ | ✅ | ✅ | ✅ |
| Place Bid | ❌ | ✅ | ❌ | ✅ |
| Buy Now | ❌ | ✅ | ❌ | ✅ |
| Create Contract | ❌ | ✅ | ❌ | ✅ |
| Verify User | ❌ | ❌ | ✅ | ✅ |
| Verify Listing | ❌ | ❌ | ✅ | ✅ |
| View Audit Logs | ❌ | ❌ | ✅ | ✅ |
| Content Moderation | ❌ | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |

### Implementation

**NestJS Guards:**
```typescript
@Roles('Miner', 'Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Post('listings')
async createListing(@Body() dto: CreateListingDto) {
  // Only Miners and Admins can access
}
```

**Frontend Route Protection:**
```typescript
// Middleware/component-level
if (!user || !hasRole(user, 'Miner')) {
  redirect('/unauthorized');
}
```

### Row Level Security (RLS)

**Supabase RLS Policies:**
- Users can only read their own data
- Users can only update their own listings
- Government can read all data (for verification)
- Admins have full access

**Example Policy:**
```sql
-- Users can only see their own listings
CREATE POLICY "Users can view own listings"
ON listings FOR SELECT
USING (auth.uid() = miner_id);

-- Government can view all listings
CREATE POLICY "Government can view all listings"
ON listings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'Government'
  )
);
```

---

## Data Protection

### Encryption

**Data in Transit:**
- HTTPS/TLS 1.2+ enforced for all API calls
- Supabase connections use SSL
- Certificate pinning (optional, future enhancement)

**Data at Rest:**
- Supabase database: AES-256 encryption
- Supabase Storage: Encrypted file storage
- Environment variables: Encrypted in deployment platform

**Sensitive Data Fields:**
- Passwords: Hashed (bcrypt) - never stored plaintext
- Payment information: Simulated in MVP, encrypted in production
- KYC documents: Encrypted in Supabase Storage
- Personal information: Encrypted at rest in database

### Input Validation

**Frontend:**
- Client-side validation for UX
- Sanitize user inputs
- React's built-in XSS protections

**Backend:**
- class-validator for DTO validation
- TypeORM parameterized queries (prevents SQL injection)
- Input sanitization library (DOMPurify for HTML content)
- File type validation (whitelist approach)

**Validation Rules:**
```typescript
@IsEmail()
@IsNotEmpty()
email: string;

@MinLength(8)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
password: string;

@IsEnum(MineralType)
mineralType: MineralType;
```

### Output Encoding

- HTML: Escape special characters
- JSON: Proper serialization
- URLs: Encode parameters
- SQL: Parameterized queries only

### CSRF Protection

**Strategy:** Token-based CSRF protection

**Implementation:**
- CSRF token in httpOnly cookie
- Token included in request headers
- NestJS CSRF guard validates tokens
- SameSite cookie attribute

---

## Compliance & Regulatory

### KYC/AML Compliance

**Requirements:**
- Mandatory verification for all Miners and Investors
- Document upload: Government ID, mining licence, business registration
- Government role verifies submissions
- Verification status visible on profiles

**Implementation:**
1. **Document Upload:**
   - Secure upload to Supabase Storage
   - File type validation (PDF, images)
   - Size limits (5MB per file)
   - Virus scanning (future enhancement)

2. **Verification Workflow:**
   ```
   User uploads documents → Status: "pending"
   Government reviews → Status: "approved" or "rejected"
   User notified → Verification badge displayed
   ```

3. **Data Storage:**
   - Documents in Supabase Storage (encrypted)
   - Metadata in `documents` table
   - Access controlled via RLS policies

**Compliance Metrics:**
- Target: ≥ 90% verified user coverage
- Tracking: Dashboard for government role

### Audit Trails

**Requirements:**
- All major actions logged (auth, CRUD operations, payments, contracts)
- Immutable, append-only logs
- 5-year retention period
- Exportable for regulatory review

**Implementation:**
```typescript
// Audit log entity
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  actionType: string; // 'CREATE_LISTING', 'PLACE_BID', etc.

  @Column('jsonb')
  details: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  entityId: string; // Related entity (listing, order, etc.)
}
```

**Logging Strategy:**
- Interceptor logs all HTTP requests
- Service methods log business actions
- Database triggers log data changes (optional)
- Immutable via database constraints (no UPDATE/DELETE)

**Export Format:**
- CSV export for regulatory review
- JSON export for programmatic access
- Filtering by user, date range, action type

### Data Retention

**Requirements:**
- Transaction logs: 5 years
- Chat logs: 5 years
- Audit logs: 5 years
- User data: Until account deletion + 30 days (GDPR grace period)

**Implementation:**
- Automated cleanup job (future enhancement)
- Archive old data before deletion
- Compliance reporting before deletion

### GDPR Compliance

**Requirements:**
- User consent for data collection
- Right to access (data export)
- Right to deletion (data removal)
- Privacy policy clearly states data usage

**Implementation:**
1. **Consent Management:**
   - Consent checkbox on registration
   - Consent tracking in database
   - Consent withdrawal capability

2. **Data Export:**
   - Endpoint: `GET /api/users/data-export`
   - Returns: All user data in JSON format
   - Includes: Profile, listings, orders, contracts, chats

3. **Data Deletion:**
   - Endpoint: `DELETE /api/users/account`
   - Cascade deletion: User data, listings, orders (with business rules)
   - Anonymization: Keep audit logs but anonymize user reference
   - 30-day grace period before permanent deletion

4. **Privacy Policy:**
   - Clear statement of data usage
   - Cookie policy
   - Third-party data sharing disclosure

---

## Fraud Detection & Prevention

### Fraud Detection Algorithms

**Duplicate Listing Detection:**
```typescript
// Algorithm: Compare listing attributes
- Mineral type, grade, quantity, location
- Similarity threshold: 90%
- Flag for review if match found
```

**Suspicious Bid Patterns:**
```typescript
// Detect patterns:
- Rapid bid increases (possible shill bidding)
- Bid withdrawal patterns
- Unusually high bid amounts
- Bid timing patterns (coordinated bidding)
```

**Message Pattern Analysis:**
```typescript
// Detect:
- Repetitive messaging (spam)
- Suspicious links (phishing)
- Payment requests outside platform
- Keyword filtering (scam indicators)
```

**Implementation:**
- Background jobs analyze data periodically
- Real-time checks for critical actions
- Flag suspicious activity for admin review
- Automated blocking for severe cases

### Content Moderation

**Moderation Strategy:**
- Manual review in MVP
- Automated detection in growth phase
- Flagging system for users to report

**Content Types:**
- Listings: Description, images, documents
- Chat messages: Text content
- User profiles: Profile information

**Moderation Actions:**
- Flag for review
- Hide content (pending review)
- Remove content (if violation)
- Warn user
- Ban user (extreme cases)

---

## Security Controls

### API Security

**Rate Limiting:**
```typescript
// NestJS rate limiting
@Throttle(10, 60) // 10 requests per 60 seconds
@Post('login')
async login() { ... }
```

**Implementation:**
- Authentication endpoints: 5 requests/minute
- General API: 100 requests/minute
- File upload: 10 requests/minute
- AI endpoints: 20 requests/minute (cost control)

**API Key Management:**
- Gemini API key: Backend environment variable only
- Supabase keys: Backend service key, frontend anon key
- No secrets in frontend code
- Secret rotation policy (quarterly)

### File Upload Security

**Validation:**
- File type whitelist: PDF, JPG, PNG
- File size limits: 5MB per file
- Virus scanning: Future enhancement
- Content validation: File signature verification

**Storage:**
- Supabase Storage with RLS policies
- Access control: Only owner and admins can access
- Secure URLs with expiration (future enhancement)

### Real-Time Security

**Supabase Real-Time Subscriptions:**
- Authentication required for subscriptions
- RLS policies apply to real-time data
- Channel-based access control
- Connection limits per user

**Implementation:**
```typescript
// Secure subscription
const channel = supabase
  .channel('user-chats')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'chats',
    filter: `user_id=eq.${userId}`, // Only user's chats
  }, callback)
  .subscribe();
```

---

## Incident Response

### Security Incident Types

1. **Data Breach**
2. **Authentication Compromise**
3. **Fraudulent Activity**
4. **DDoS Attack**
5. **Compliance Violation**

### Response Procedures

**1. Detection:**
- Automated alerts for suspicious activity
- User reports via flagging system
- Monitoring and logging

**2. Assessment:**
- Severity classification (Low, Medium, High, Critical)
- Impact analysis
- Containment strategy

**3. Containment:**
- Immediate actions (block user, revoke access)
- System isolation if needed
- Evidence preservation

**4. Eradication:**
- Remove threat
- Patch vulnerabilities
- Update security controls

**5. Recovery:**
- Restore services
- Verify system integrity
- Monitor for recurrence

**6. Post-Incident:**
- Incident report
- Lessons learned
- Security improvements

### Incident Response Team

**Roles:**
- Security Lead: Coordinate response
- Backend Developer: Technical investigation
- Frontend Developer: User impact assessment
- Admin: User account management
- Compliance Officer: Regulatory reporting (future)

---

## Security Monitoring & Logging

### Security Event Logging

**Events Logged:**
- Authentication attempts (success/failure)
- Authorization failures (403 responses)
- Sensitive data access
- Admin actions
- Security policy violations
- API rate limit hits

**Log Format:**
```json
{
  "timestamp": "2025-11-05T20:29:19Z",
  "eventType": "AUTH_FAILURE",
  "userId": "user-123",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "details": {
    "reason": "Invalid password",
    "attemptCount": 3
  }
}
```

### Monitoring

**Metrics:**
- Failed login attempts
- Unusual API usage patterns
- File upload anomalies
- Real-time subscription abuse
- Database query performance

**Alerts:**
- Multiple failed logins (potential brute force)
- Unusual access patterns
- High error rates
- System resource exhaustion

**Tools:**
- Supabase dashboard for database monitoring
- Application logs for API monitoring
- Error tracking service (Sentry, LogRocket - future)

---

## Security Testing

### Testing Strategy

**1. Static Analysis:**
- Code scanning for vulnerabilities
- Dependency vulnerability scanning (npm audit)
- Secrets scanning (prevent commit of secrets)

**2. Dynamic Testing:**
- Penetration testing (quarterly)
- Vulnerability scanning
- API security testing

**3. Security Audits:**
- Third-party security audit (annually)
- Compliance audits (regulatory requirements)
- Code reviews with security focus

### Security Checklist

**Pre-Deployment:**
- [ ] All dependencies updated
- [ ] No secrets in code
- [ ] Environment variables configured
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error messages don't leak sensitive info
- [ ] Security headers configured
- [ ] RLS policies tested

---

## Security Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication Layer                                │   │
│  │  - JWT Token Storage                                 │   │
│  │  - Token Refresh Logic                              │   │
│  │  - Route Protection                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Client                                          │   │
│  │  - HTTPS Only                                        │   │
│  │  - Request Interceptors                              │   │
│  │  - Error Handling                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Real-Time Subscriptions (Supabase)                  │   │
│  │  - Authenticated Channels                            │   │
│  │  - RLS-Protected                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/TLS
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    Backend (NestJS)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Security Layer                                       │   │
│  │  - JWT Validation                                     │   │
│  │  - RBAC Guards                                        │   │
│  │  - Rate Limiting                                      │   │
│  │  - Input Validation                                   │   │
│  │  - CSRF Protection                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Business Logic                                       │   │
│  │  - Fraud Detection                                    │   │
│  │  - Content Moderation                                 │   │
│  │  - Audit Logging                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SSL Connection
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    Supabase (PostgreSQL)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Data Protection                                     │   │
│  │  - Encryption at Rest                               │   │
│  │  - Row Level Security (RLS)                         │   │
│  │  - Audit Logs (Immutable)                           │   │
│  │  - Backup & Recovery                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Best Practices

### Development

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Client and server side
3. **Use parameterized queries** - Prevent SQL injection
4. **Sanitize outputs** - Prevent XSS
5. **Follow principle of least privilege** - Minimal permissions
6. **Keep dependencies updated** - Regular security patches
7. **Code review with security focus** - Before merging
8. **Document security decisions** - ADRs for security

### Deployment

1. **HTTPS only** - No HTTP in production
2. **Security headers** - CSP, HSTS, X-Frame-Options
3. **Environment separation** - Dev, staging, production
4. **Secret management** - Secure storage, rotation
5. **Monitoring** - Security event logging
6. **Backup strategy** - Encrypted backups
7. **Disaster recovery** - Recovery procedures

### Operations

1. **Regular security audits** - Quarterly reviews
2. **Vulnerability scanning** - Automated tools
3. **Penetration testing** - Annual testing
4. **Incident response plan** - Documented procedures
5. **Security training** - Team awareness
6. **Compliance monitoring** - Regulatory adherence

---

## Compliance Frameworks

### KYC/AML Compliance

**Requirements:**
- Identity verification
- Document verification
- Risk assessment
- Ongoing monitoring

**Implementation:**
- Document upload and verification workflow
- Government role for approval
- Verification status tracking
- Compliance reporting

### GDPR Compliance

**Requirements:**
- Lawful basis for processing
- Data minimization
- Purpose limitation
- Storage limitation
- Data subject rights

**Implementation:**
- Consent management
- Data export functionality
- Right to deletion
- Privacy policy
- Data retention policies

### Industry-Specific Compliance

**Nigerian Mineral Trading Regulations:**
- Mining licence verification
- Business registration verification
- Transaction reporting
- Export documentation

---

## Future Security Enhancements

### Phase 2 (Growth)

1. **Multi-Factor Authentication (MFA)**
   - TOTP-based 2FA
   - SMS OTP for critical operations

2. **Advanced Fraud Detection**
   - Machine learning models
   - Behavioral analysis
   - Real-time risk scoring

3. **Virus Scanning**
   - File upload scanning
   - Automated threat detection

4. **Certificate Pinning**
   - Mobile app security
   - API certificate validation

5. **Security Information and Event Management (SIEM)**
   - Centralized logging
   - Advanced threat detection

### Phase 3 (Vision)

1. **Blockchain Integration**
   - Immutable transaction records
   - Provenance tracking

2. **Zero Trust Architecture**
   - Continuous verification
   - Device attestation

3. **Advanced Monitoring**
   - AI-powered threat detection
   - Predictive security analytics

---

## Security Checklist for Implementation

### Epic 1: Foundation
- [ ] HTTPS configuration
- [ ] Environment variables setup
- [ ] API client security (interceptors)
- [ ] Error handling (no sensitive data leaks)

### Epic 2: Authentication
- [ ] Password strength validation
- [ ] JWT token implementation
- [ ] Session management
- [ ] RBAC implementation

### Epic 4: Listings
- [ ] Input validation
- [ ] File upload security
- [ ] Content moderation hooks

### Epic 5: Transactions
- [ ] Payment security (simulated)
- [ ] Transaction logging
- [ ] Fraud detection integration

### Epic 10: Compliance
- [ ] Audit logging
- [ ] KYC workflow
- [ ] Content moderation
- [ ] Fraud detection algorithms

---

## Security Contacts

**Security Lead:** [To be assigned]  
**Incident Response:** [To be assigned]  
**Compliance Officer:** [To be assigned] (Future)

---

## References

- [PRD Security Requirements](./PRD.md#security)
- [Architecture Document](./architecture.md#security-architecture)
- [Supabase Security Documentation](https://supabase.com/docs/guides/auth/security)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

_Security Architecture document generated: 2025-11-05_  
_This document defines the security posture and controls for Miners Hub platform._

