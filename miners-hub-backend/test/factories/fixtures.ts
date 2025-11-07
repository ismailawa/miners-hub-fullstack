import {
  createUserFactory,
  createVerifiedMinerFactory,
  createVerifiedInvestorFactory,
  createAdminUserFactory,
} from './user.factory';
import { VerificationStatus } from '../../src/entities/user.entity';
import {
  createListingFactory,
  createPublishedBuyNowListingFactory,
  createPublishedAuctionListingFactory,
  createDraftListingFactory,
  createSoldListingFactory,
} from './listing.factory';
import {
  createAuctionFactory,
  createActiveAuctionFactory,
  createCompletedAuctionFactory,
  createUpcomingAuctionFactory,
} from './auction.factory';

/**
 * Test Fixtures
 * 
 * Pre-defined test scenarios combining multiple factories
 * for common use cases in integration and E2E tests
 */

/**
 * Fixture: Complete marketplace scenario
 * - Verified miner with published buy-now listing
 */
export function createMarketplaceFixture() {
  const miner = createVerifiedMinerFactory();
  const listing = createPublishedBuyNowListingFactory();

  return {
    miner,
    listing,
  };
}

/**
 * Fixture: Auction scenario
 * - Verified miner with published auction listing
 * - Active auction for the listing
 */
export function createAuctionFixture() {
  const miner = createVerifiedMinerFactory();
  const listing = createPublishedAuctionListingFactory();
  const auction = createActiveAuctionFactory();

  return {
    miner,
    listing,
    auction: {
      ...auction,
      listingId: listing.minerId, // Link auction to listing
    },
  };
}

/**
 * Fixture: Completed transaction scenario
 * - Verified miner with sold listing
 * - Verified investor (buyer)
 */
export function createCompletedTransactionFixture() {
  const miner = createVerifiedMinerFactory();
  const investor = createVerifiedInvestorFactory();
  const listing = createSoldListingFactory();

  return {
    miner,
    investor,
    listing,
  };
}

/**
 * Fixture: New user onboarding scenario
 * - Pending verification user
 * - Draft listing (not yet published)
 */
export function createOnboardingFixture() {
  const user = createUserFactory({
    verificationStatus: VerificationStatus.PENDING,
  });
  const draftListing = createDraftListingFactory();

  return {
    user,
    draftListing,
  };
}

/**
 * Fixture: Admin scenario
 * - Admin user
 * - Multiple listings in various states
 */
export function createAdminFixture() {
  const admin = createAdminUserFactory();
  const publishedListing = createPublishedBuyNowListingFactory();
  const draftListing = createDraftListingFactory();
  const soldListing = createSoldListingFactory();

  return {
    admin,
    listings: {
      published: publishedListing,
      draft: draftListing,
      sold: soldListing,
    },
  };
}

/**
 * Fixture: Multiple users and listings
 * - Several verified miners
 * - Several published listings
 * - Several investors
 */
export function createMultiUserFixture(count: number = 5) {
  const miners = Array.from({ length: count }, () =>
    createVerifiedMinerFactory(),
  );
  const investors = Array.from({ length: count }, () =>
    createVerifiedInvestorFactory(),
  );
  const listings = Array.from({ length: count }, () =>
    createPublishedBuyNowListingFactory(),
  );

  return {
    miners,
    investors,
    listings,
  };
}

/**
 * Fixture: Auction with bids scenario
 * - Active auction
 * - Multiple potential bidders (investors)
 */
export function createAuctionWithBiddersFixture(bidderCount: number = 3) {
  const miner = createVerifiedMinerFactory();
  const listing = createPublishedAuctionListingFactory();
  const auction = createActiveAuctionFactory();
  const bidders = Array.from({ length: bidderCount }, () =>
    createVerifiedInvestorFactory(),
  );

  return {
    miner,
    listing,
    auction: {
      ...auction,
      listingId: listing.minerId,
    },
    bidders,
  };
}

/**
 * Fixture: Upcoming auction scenario
 * - Auction that hasn't started yet
 * - Listing ready for auction
 */
export function createUpcomingAuctionFixture() {
  const miner = createVerifiedMinerFactory();
  const listing = createPublishedAuctionListingFactory();
  const auction = createUpcomingAuctionFactory();

  return {
    miner,
    listing,
    auction: {
      ...auction,
      listingId: listing.minerId,
    },
  };
}

