# Story 1.4b: TypeORM Setup & Entity Models

Status: done

## Story

As a **developer**,
I want **TypeORM configured with entity models for all database tables**,
So that **I have type-safe database operations and migrations**.

## Acceptance Criteria

1. **AC1: TypeORM Configuration**
   - TypeORM module configured in NestJS app module
   - DataSource configured with Supabase connection
   - Migration system configured
   - Entity auto-loading configured

2. **AC2: Core User Entities**
   - User entity with email, passwordHash, role, verificationStatus
   - Miner entity with companyName, miningLicence, location
   - Investor entity with companyName, investmentFocus
   - Proper relationships (OneToOne, OneToMany) between User, Miner, Investor

3. **AC3: Marketplace Entities**
   - Listing entity with mineralType, quantity, price, status
   - Auction entity with startTime, endTime, currentBid
   - Bid entity with amount, timestamp
   - Proper relationships (ManyToOne, OneToMany) between Listing, Auction, Bid, Miner

4. **AC4: Transaction Entities**
   - Order entity with buyer, seller, listing, totalAmount, status
   - Contract entity with parties, terms, status, signatures
   - Proper relationships with User and Listing entities

5. **AC5: Communication Entities**
   - Chat entity with sender, receiver, message, threadId
   - Notification entity with userId, title, message, read status
   - Proper relationships with User entity

6. **AC6: Document & Audit Entities**
   - Document entity with userId, type, fileUrl, metadata
   - AuditLog entity with userId, action, metadata, timestamp
   - Proper relationships and indexes

7. **AC7: Migration System**
   - Migration configuration set up
   - Initial migration created for all tables
   - Indexes created for frequently queried fields
   - Relationships properly established in migration

## Tasks / Subtasks

- [x] Task 1: Verify TypeORM Configuration (AC: 1)
  - [x] Verify TypeORM module is configured in app.module.ts
  - [x] Verify DataSource configuration
  - [x] Verify entity auto-loading path
  - [x] Verify migration configuration

- [x] Task 2: Create User Entities (AC: 2)
  - [x] Create User entity with all required fields
  - [x] Create Miner entity with relationships
  - [x] Create Investor entity with relationships
  - [x] Add class-validator decorators for validation
  - [x] Add indexes for frequently queried fields

- [x] Task 3: Create Marketplace Entities (AC: 3)
  - [x] Create Listing entity
  - [x] Create Auction entity
  - [x] Create Bid entity
  - [x] Define relationships between entities
  - [x] Add validation decorators

- [x] Task 4: Create Transaction Entities (AC: 4)
  - [x] Create Order entity
  - [x] Create Contract entity
  - [x] Define relationships
  - [x] Add validation decorators

- [x] Task 5: Create Communication Entities (AC: 5)
  - [x] Create Chat entity
  - [x] Create Notification entity
  - [x] Define relationships
  - [x] Add validation decorators

- [x] Task 6: Create Document & Audit Entities (AC: 6)
  - [x] Create Document entity
  - [x] Create AuditLog entity
  - [x] Add indexes for performance
  - [x] Add validation decorators

- [x] Task 7: Set Up Migration System (AC: 7)
  - [x] Configure migration directory
  - [x] Create DataSource configuration for migrations
  - [x] Add migration scripts to package.json
  - [x] Create initial migration (requires database connection)
  - [x] Test migration runs successfully

## Dev Notes

### Architecture Alignment

This story implements the TypeORM entity models as specified in the architecture document:
- **Entity Pattern:** TypeORM entities with UUID primary keys (Architecture line 303-320)
- **Relationships:** Proper @ManyToOne, @OneToMany, @OneToOne decorators
- **Validation:** class-validator decorators for entity validation
- **Migrations:** TypeORM migration system for schema management

### Implementation Patterns

- **Primary Keys:** Use UUID (`@PrimaryGeneratedColumn('uuid')`)
- **Timestamps:** `@CreateDateColumn()` and `@UpdateDateColumn()` for createdAt/updatedAt
- **Relationships:** 
  - @OneToOne for User ↔ Miner, User ↔ Investor
  - @ManyToOne for Listing → Miner, Order → User, etc.
  - @OneToMany for reverse relationships
- **Indexes:** Add indexes for userId, listingId, and other frequently queried fields
- **Validation:** Use class-validator decorators (@IsEmail, @IsNotEmpty, etc.)

### Testing Standards

- Manual verification: Entities compile without errors
- Manual verification: Migration runs successfully
- Manual verification: Tables created in database
- Manual verification: Relationships work correctly
- No automated tests required for this story (will be covered in Story 1.11)

### Project Structure Notes

**Expected Directory Structure:**
```
miners-hub-backend/
├── src/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── miner.entity.ts
│   │   ├── investor.entity.ts
│   │   ├── listing.entity.ts
│   │   ├── auction.entity.ts
│   │   ├── bid.entity.ts
│   │   ├── order.entity.ts
│   │   ├── contract.entity.ts
│   │   ├── chat.entity.ts
│   │   ├── notification.entity.ts
│   │   ├── document.entity.ts
│   │   └── audit-log.entity.ts
│   └── migrations/
│       └── 1234567890-InitialSchema.ts
```

**Alignment:** Matches Architecture document structure

### References

- [Source: docs/epics.md#Story-1.4b] - Story acceptance criteria and technical notes
- [Source: docs/architecture.md#TypeORM-Entity-Pattern] - Entity pattern guidelines
- [Source: docs/tech-spec-epic-1.md#Data-Models] - Entity examples
- [Source: docs/PRD.md#Data-Persistence] - Database table requirements

### Learnings from Previous Stories

**From Story 1.2b:**
- NestJS backend is set up
- TypeORM packages are installed
- Database configuration exists

**From Story 1.3b:**
- Supabase connection is configured
- Database URL is available
- Connection tested and working

## Dev Agent Record

### Context Reference

- `docs/stories/1-4b-typeorm-setup-entity-models.context.xml` (to be generated)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

**Implementation Notes:**
(To be filled during implementation)

### Completion Notes List

(To be filled upon completion)

### File List

(To be filled upon completion)

---

## Senior Developer Review (AI)

(To be filled after code review)

