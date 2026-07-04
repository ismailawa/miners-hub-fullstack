import { faker } from '@faker-js/faker';
import { Listing, ListingStatus } from '../../src/entities/listing.entity';

/**
 * Listing Factory
 *
 * Generates test data for Listing entities using Faker.js
 */

export interface ListingFactoryOptions {
  minerId?: string;
  mineralType?: string;
  quantity?: number;
  price?: number;
  gradePurity?: string | null;
  location?: string | null;
  moisturePercentage?: number | null;
  status?: ListingStatus;
  listingType?: 'buy_now' | 'auction';
}

/**
 * Common mineral types for Nigerian mining
 */
const MINERAL_TYPES = [
  'Gold',
  'Coal',
  'Iron Ore',
  'Limestone',
  'Lead',
  'Zinc',
  'Tin',
  'Baryte',
  'Gypsum',
  'Kaolin',
  'Marble',
  'Tantalite',
];

/**
 * Common Nigerian states/LGAs
 */
const LOCATIONS = [
  'Lagos, Ikeja',
  'Abuja, Garki',
  'Kano, Nasarawa',
  'Rivers, Port Harcourt',
  'Kaduna, Kaduna North',
  'Ogun, Abeokuta',
  'Oyo, Ibadan',
  'Enugu, Enugu North',
];

/**
 * Create a Listing entity with fake data
 *
 * @param options - Optional overrides for specific fields
 * @returns Partial Listing entity (without relationships)
 */
export function createListingFactory(
  options: ListingFactoryOptions = {},
): Partial<Listing> {
  const mineralType =
    options.mineralType || faker.helpers.arrayElement(MINERAL_TYPES);
  const quantity =
    options.quantity ||
    faker.number.float({ min: 1, max: 1000, fractionDigits: 2 });
  const pricePerTon =
    options.price ||
    faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 });

  return {
    minerId: options.minerId || faker.string.uuid(),
    mineralType,
    quantity,
    price: pricePerTon,
    gradePurity:
      options.gradePurity !== undefined
        ? options.gradePurity
        : faker.helpers.arrayElement([
            null,
            `${faker.number.int({ min: 70, max: 99 })}%`,
            `${faker.number.float({ min: 0.5, max: 0.99, fractionDigits: 2 })}`,
          ]),
    location:
      options.location !== undefined
        ? options.location
        : faker.helpers.arrayElement([null, ...LOCATIONS]),
    moisturePercentage:
      options.moisturePercentage !== undefined
        ? options.moisturePercentage
        : faker.helpers.arrayElement([
            null,
            faker.number.float({ min: 0, max: 15, fractionDigits: 2 }),
          ]),
    status:
      options.status ||
      faker.helpers.arrayElement(Object.values(ListingStatus)),
    listingType:
      options.listingType || faker.helpers.arrayElement(['buy_now', 'auction']),
  };
}

/**
 * Create multiple Listing entities
 *
 * @param count - Number of listings to create
 * @param options - Optional overrides for all listings
 * @returns Array of partial Listing entities
 */
export function createListingsFactory(
  count: number,
  options: ListingFactoryOptions = {},
): Partial<Listing>[] {
  return Array.from({ length: count }, () => createListingFactory(options));
}

/**
 * Create a published buy-now listing
 */
export function createPublishedBuyNowListingFactory(
  minerId?: string,
): Partial<Listing> {
  return createListingFactory({
    minerId,
    status: ListingStatus.PUBLISHED,
    listingType: 'buy_now',
  });
}

/**
 * Create a published auction listing
 */
export function createPublishedAuctionListingFactory(
  minerId?: string,
): Partial<Listing> {
  return createListingFactory({
    minerId,
    status: ListingStatus.PUBLISHED,
    listingType: 'auction',
  });
}

/**
 * Create a draft listing
 */
export function createDraftListingFactory(minerId?: string): Partial<Listing> {
  return createListingFactory({
    minerId,
    status: ListingStatus.DRAFT,
  });
}

/**
 * Create a sold listing
 */
export function createSoldListingFactory(minerId?: string): Partial<Listing> {
  return createListingFactory({
    minerId,
    status: ListingStatus.SOLD,
  });
}
