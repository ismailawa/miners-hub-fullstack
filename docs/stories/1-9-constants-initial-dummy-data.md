# Story 1.9: Constants & Initial Dummy Data

Status: done

## Story

As a **developer**,
I want **a constants file with initial dummy data**,
So that **the application is fully populated and demonstrable on first load**.

## Acceptance Criteria

1. **AC1: Miner Data**
   - Realistic dummy data for miners (profiles, galleries)
   - Data properly typed using TypeScript interfaces
   - Data reflects Nigerian mining context

2. **AC2: Event Data**
   - Realistic dummy data for industry events
   - Properly typed and structured

3. **AC3: Mineral Price Data**
   - Live-updating simulation data for mineral prices
   - Properly typed and structured

4. **AC4: Map Location Data**
   - State mineral deposits data
   - Properly typed with coordinates

5. **AC5: Testimonial Data**
   - Realistic testimonials
   - Properly typed

6. **AC6: Marketplace Listings**
   - Buy Now listings
   - Auction listings
   - Properly typed using TypeScript interfaces

7. **AC7: News Articles**
   - Realistic news articles
   - Properly typed

8. **AC8: Additional Data Types**
   - All other data types from Story 1.8
   - Properly typed and structured

9. **AC9: Data Structure**
   - Data structured for easy database seeding
   - Can be used for initial data population via backend
   - Helper functions for data initialization

10. **AC10: Cultural Context**
    - Data is culturally and contextually appropriate for Nigerian mining industry

## Tasks / Subtasks

- [x] Task 1: Create Constants File Structure (AC: 9)
  - [x] Create `lib/constants/data.ts` file
  - [x] Import all types from `lib/types.ts`
  - [x] Create helper functions for data initialization

- [x] Task 2: Create Miner Data (AC: 1)
  - [x] Create realistic miner profiles
  - [x] Include company names, locations, mining licenses
  - [x] Use Nigerian states and LGAs
  - [x] Properly typed with Miner interface

- [x] Task 3: Create Event Data (AC: 2)
  - [x] Create industry events
  - [x] Include dates, locations, organizers
  - [x] Properly typed with Event interface

- [x] Task 4: Create Mineral Price Data (AC: 3)
  - [x] Create mineral price entries
  - [x] Include different mineral types
  - [x] Include location-based and national average prices
  - [x] Properly typed with MineralPrice interface

- [x] Task 5: Create Map Location Data (AC: 4)
  - [x] Create map location entries for mineral deposits
  - [x] Include coordinates, states, LGAs
  - [x] Include mineral types per location
  - [x] Properly typed with MapLocationData interface

- [x] Task 6: Create Testimonial Data (AC: 5)
  - [x] Create realistic testimonials
  - [x] Include author information, ratings
  - [x] Properly typed with Testimonial interface

- [x] Task 7: Create Marketplace Listings (AC: 6)
  - [x] Create Buy Now listings
  - [x] Create Auction listings
  - [x] Include various mineral types, quantities, prices
  - [x] Properly typed with Listing and Auction interfaces

- [x] Task 8: Create News Articles (AC: 7)
  - [x] Create news articles
  - [x] Include titles, content, categories, tags
  - [x] Properly typed with NewsArticle interface

- [x] Task 9: Create Additional Data Types (AC: 8)
  - [x] Create Webinar data
  - [x] Create KnowledgeBaseArticle data
  - [x] Create ForumPost data
  - [x] All properly typed

- [x] Task 10: Verify Data Quality (AC: 10)
  - [x] Ensure data is culturally appropriate
  - [x] Verify Nigerian context (states, LGAs, mineral types)
  - [x] Verify data variety and realism

- [x] Task 11: Create Helper Functions (AC: 9)
  - [x] Create functions for data initialization
  - [x] Create functions for database seeding
  - [x] Export all data and helper functions

## Dev Notes

### Architecture Alignment

This story implements initial dummy data as specified in the architecture document:
- **Data Structure:** All data properly typed using TypeScript interfaces from Story 1.8
- **Database Seeding:** Data structured for easy backend database population
- **Cultural Context:** Data reflects Nigerian mining industry context

### Implementation Patterns

- **Type Safety:** All data uses TypeScript interfaces from `lib/types.ts`
- **Nigerian Context:** Use Nigerian states, LGAs, and mineral types
- **Realism:** Create realistic, varied data that demonstrates application features
- **Structure:** Organize data by type, export as named constants
- **Helper Functions:** Create utilities for data access and initialization

### Data Organization

```
lib/constants/data.ts
├── Miner Data
├── Event Data
├── Mineral Price Data
├── Map Location Data
├── Testimonial Data
├── Marketplace Listings (Buy Now & Auctions)
├── News Articles
├── Additional Types (Webinar, KnowledgeBase, Forum, etc.)
└── Helper Functions
```

### Testing Standards

- Manual verification: All data types compile without errors
- Manual verification: Data matches TypeScript interfaces
- Manual verification: Data is culturally appropriate
- No automated tests required for this story (data file only)

### Project Structure Notes

**Expected Directory Structure:**
```
miners-hub-frontend/
├── lib/
│   ├── constants/
│   │   └── data.ts (all dummy data)
│   └── types.ts (imported for typing)
```

**Alignment:** Matches Story 1.8 types and PRD requirements

### References

- [Source: docs/epics.md#Story-1.9] - Story acceptance criteria and technical notes
- [Source: docs/architecture.md] - Architecture patterns
- [Source: miners-hub-frontend/lib/types.ts] - TypeScript type definitions

### Learnings from Previous Stories

**From Story 1.8:**
- All TypeScript types are available in `lib/types.ts`
- Types include enums, interfaces, and utility types
- Types match backend entity structure

**Data Strategy:**
- Use types from `lib/types.ts` for all data
- Create realistic Nigerian mining context data
- Structure for easy database seeding
- Export as named constants for easy import

## Dev Agent Record

### Context Reference

- `docs/stories/1-9-constants-initial-dummy-data.context.xml` (to be generated)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

**Implementation Notes:**
- Created comprehensive dummy data file with all required data types
- All data properly typed using TypeScript interfaces from `lib/types.ts`
- Data reflects Nigerian mining context (states, LGAs, mineral types)
- Created helper functions for data initialization and database seeding
- All data structured for easy import and use

### Completion Notes List

1. **Constants File Created**: `lib/constants/data.ts` contains all dummy data
   - Miner data: 6 realistic miner profiles with Nigerian company names and locations
   - Event data: 3 industry events with dates and locations
   - Mineral price data: 10 price entries for various minerals (Gold, Tin, Coal, Lead, Zinc, Iron Ore, Limestone)
   - Map location data: 6 verified mineral deposit locations with coordinates
   - Testimonial data: 4 testimonials with ratings
   - Marketplace listings: 6 Buy Now listings for various minerals
   - Auction data: 3 auction entries (2 active, 1 completed)
   - News articles: 3 news articles with categories and tags
   - Webinar data: 2 upcoming webinars
   - Knowledge base articles: 3 help articles
   - Forum posts: 3 discussion posts

2. **Helper Functions Created**:
   - `getAllDummyData()` - Get all data as single object
   - `getDummyDataByType()` - Get data by specific type
   - `initializeData()` - Initialize data for specific entity type
   - `getFeaturedTestimonials()` - Get featured testimonials only
   - `getActiveAuctions()` - Get active auctions only
   - `getPublishedListings()` - Get published listings only
   - `getLatestMineralPrices()` - Get latest mineral prices
   - `getVerifiedMapLocations()` - Get verified map locations only

3. **Data Quality**:
   - All data uses Nigerian states and LGAs (Kaduna, Plateau, Rivers, Kogi, Zamfara, Bauchi, etc.)
   - Realistic mineral types (Gold, Tin, Coal, Lead, Zinc, Iron Ore, Limestone)
   - Culturally appropriate company names and locations
   - Proper pricing in NGN (Nigerian Naira)
   - Realistic quantities and specifications

4. **Type Safety**: All data properly typed with TypeScript interfaces
5. **Build Verification**: TypeScript compilation successful, no errors

### File List

**Created:**
- `miners-hub-frontend/lib/constants/data.ts` - Comprehensive dummy data file with all data types and helper functions

---

## Senior Developer Review (AI)

**Review Date:** 2025-01-XX  
**Status:** ✅ **Approved with Recommendations**

**Summary:**
The implementation of dummy data is well-executed and follows best practices. The data file is comprehensive, properly typed, and reflects Nigerian mining context. Helper functions are well-designed. Minor improvements recommended for data integrity and ID generation.

**Code Review:** See `docs/code-review-1-9.md` for detailed review.

**Key Findings:**
- ✅ All data types implemented and properly typed
- ✅ Excellent Nigerian context and cultural appropriateness
- ✅ Well-organized structure with good helper functions
- ✅ All recommendations implemented

**Recommendations Implemented:**
1. ✅ Fixed auction listingId references - Created actual auction listings and properly referenced them
2. ✅ Improved ID generation strategy - Changed to sequential deterministic IDs with type prefixes (dummy-{type}-{number})
3. ✅ Removed unused type imports
4. ✅ Enhanced `initializeData` function - Now returns deep copy to prevent mutations
5. ✅ Created `allListings` export - Combines buy_now and auction listings for convenience

**Story Status:** ✅ **Complete and Production Ready** - All recommendations implemented

