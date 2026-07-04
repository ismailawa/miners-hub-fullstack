import { faker } from '@faker-js/faker';
import { Auction } from '../../src/entities/auction.entity';

/**
 * Auction Factory
 *
 * Generates test data for Auction entities using Faker.js
 */

export interface AuctionFactoryOptions {
  listingId?: string;
  startTime?: Date;
  endTime?: Date;
  startingBid?: number;
  currentBid?: number | null;
  minimumIncrement?: number;
  status?: 'active' | 'completed' | 'cancelled';
}

/**
 * Create an Auction entity with fake data
 *
 * @param options - Optional overrides for specific fields
 * @returns Partial Auction entity (without relationships)
 */
export function createAuctionFactory(
  options: AuctionFactoryOptions = {},
): Partial<Auction> {
  const now = new Date();
  const startTime =
    options.startTime || faker.date.past({ years: 1, refDate: now });
  const endTime =
    options.endTime || faker.date.future({ years: 1, refDate: startTime });
  const startingBid =
    options.startingBid ||
    faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 });
  const minimumIncrement =
    options.minimumIncrement ||
    faker.number.float({ min: 100, max: 1000, fractionDigits: 2 });

  return {
    listingId: options.listingId || faker.string.uuid(),
    startTime,
    endTime,
    startingBid,
    currentBid:
      options.currentBid !== undefined
        ? options.currentBid
        : faker.helpers.arrayElement([
            null,
            startingBid + minimumIncrement,
            startingBid + minimumIncrement * 2,
          ]),
    minimumIncrement,
    status:
      options.status ||
      faker.helpers.arrayElement(['active', 'completed', 'cancelled']),
  };
}

/**
 * Create multiple Auction entities
 *
 * @param count - Number of auctions to create
 * @param options - Optional overrides for all auctions
 * @returns Array of partial Auction entities
 */
export function createAuctionsFactory(
  count: number,
  options: AuctionFactoryOptions = {},
): Partial<Auction>[] {
  return Array.from({ length: count }, () => createAuctionFactory(options));
}

/**
 * Create an active auction
 */
export function createActiveAuctionFactory(
  listingId?: string,
): Partial<Auction> {
  const now = new Date();
  const startTime = faker.date.past({ days: 7, refDate: now });
  const endTime = faker.date.future({ days: 7, refDate: now });

  return createAuctionFactory({
    listingId,
    startTime,
    endTime,
    status: 'active',
  });
}

/**
 * Create a completed auction
 */
export function createCompletedAuctionFactory(
  listingId?: string,
): Partial<Auction> {
  const now = new Date();
  const startTime = faker.date.past({ days: 30, refDate: now });
  const endTime = faker.date.past({ days: 1, refDate: now });
  const startingBid = faker.number.float({
    min: 1000,
    max: 50000,
    fractionDigits: 2,
  });
  const minimumIncrement = faker.number.float({
    min: 100,
    max: 1000,
    fractionDigits: 2,
  });

  return createAuctionFactory({
    listingId,
    startTime,
    endTime,
    startingBid,
    currentBid:
      startingBid + minimumIncrement * faker.number.int({ min: 1, max: 10 }),
    minimumIncrement,
    status: 'completed',
  });
}

/**
 * Create a cancelled auction
 */
export function createCancelledAuctionFactory(
  listingId?: string,
): Partial<Auction> {
  return createAuctionFactory({
    listingId,
    status: 'cancelled',
  });
}

/**
 * Create an auction that starts in the future
 */
export function createUpcomingAuctionFactory(
  listingId?: string,
): Partial<Auction> {
  const now = new Date();
  const startTime = faker.date.future({ days: 7, refDate: now });
  const endTime = faker.date.future({ days: 14, refDate: startTime });

  return createAuctionFactory({
    listingId,
    startTime,
    endTime,
    status: 'active',
  });
}
