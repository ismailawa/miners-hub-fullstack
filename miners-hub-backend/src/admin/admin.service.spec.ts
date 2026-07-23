import { AdminService } from './admin.service';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { User, UserRole, VerificationStatus } from '../entities/user.entity';

const repository = () => ({
  createQueryBuilder: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  getMany: jest.fn(),
  getManyAndCount: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

describe('AdminService moderation side effects', () => {
  let service: AdminService;
  let userRepository: ReturnType<typeof repository>;
  let minerRepository: ReturnType<typeof repository>;
  let listingRepository: ReturnType<typeof repository>;
  let auctionRepository: ReturnType<typeof repository>;
  let auditLogService: { log: jest.Mock };

  beforeEach(() => {
    userRepository = repository();
    minerRepository = repository();
    listingRepository = repository();
    auctionRepository = repository();
    auditLogService = { log: jest.fn() };

    service = new AdminService(
      userRepository as any,
      minerRepository as any,
      listingRepository as any,
      auctionRepository as any,
      repository() as any,
      repository() as any,
      repository() as any,
      repository() as any,
      repository() as any,
      repository() as any,
      auditLogService as any,
    );
  });

  it('creates an active auction record when an auction listing is published', async () => {
    const listing = {
      id: 'listing-1',
      listingType: 'auction',
      price: 250000,
      status: ListingStatus.SUBMITTED,
    } as Listing;
    const auction = {
      id: 'auction-1',
      listingId: listing.id,
      status: 'active',
    };

    listingRepository.findOne.mockResolvedValue(listing);
    listingRepository.save.mockImplementation(async (item) => item);
    auctionRepository.findOne.mockResolvedValue(null);
    auctionRepository.create.mockReturnValue(auction);
    auctionRepository.save.mockResolvedValue(auction);

    await service.updateListingStatus(
      listing.id,
      ListingStatus.PUBLISHED,
      'admin-1',
    );

    expect(auctionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        listingId: listing.id,
        startingBid: 250000,
        status: 'active',
      }),
    );
    expect(auditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.listing.status_update',
        metadata: { status: ListingStatus.PUBLISHED },
      }),
    );
  });

  it('cancels the active auction when an auction listing is unpublished', async () => {
    const listing = {
      id: 'listing-1',
      listingType: 'auction',
      status: ListingStatus.PUBLISHED,
    } as Listing;
    const activeAuction = {
      id: 'auction-1',
      listingId: listing.id,
      status: 'active',
    };

    listingRepository.findOne.mockResolvedValue(listing);
    listingRepository.save.mockImplementation(async (item) => item);
    auctionRepository.findOne.mockResolvedValue(activeAuction);
    auctionRepository.save.mockImplementation(async (item) => item);

    await service.updateListingStatus(
      listing.id,
      ListingStatus.UNDER_REVIEW,
      'admin-1',
    );

    expect(activeAuction.status).toBe('cancelled');
    expect(auctionRepository.save).toHaveBeenCalledWith(activeAuction);
  });

  it('moves active miner listings out of public circulation when a miner is unapproved', async () => {
    const user = {
      id: 'user-1',
      role: UserRole.MINER,
      verificationStatus: VerificationStatus.VERIFIED,
      onboardingComplete: true,
    } as User;
    const miner = { id: 'miner-1', userId: user.id };
    const auctionListing = {
      id: 'listing-1',
      minerId: miner.id,
      listingType: 'auction',
      status: ListingStatus.PUBLISHED,
    } as Listing;
    const buyNowListing = {
      id: 'listing-2',
      minerId: miner.id,
      listingType: 'buy_now',
      status: ListingStatus.SUBMITTED,
    } as Listing;
    const activeAuction = {
      id: 'auction-1',
      listingId: auctionListing.id,
      status: 'active',
    };

    userRepository.findOne.mockResolvedValue(user);
    userRepository.save.mockImplementation(async (item) => item);
    minerRepository.findOne.mockResolvedValue(miner);
    listingRepository.find.mockResolvedValue([auctionListing, buyNowListing]);
    listingRepository.save.mockImplementation(async (items) => items);
    auctionRepository.findOne.mockResolvedValue(activeAuction);
    auctionRepository.save.mockImplementation(async (item) => item);

    await service.verifyUser(user.id, VerificationStatus.PENDING, 'admin-1');

    expect(auctionListing.status).toBe(ListingStatus.UNDER_REVIEW);
    expect(buyNowListing.status).toBe(ListingStatus.UNDER_REVIEW);
    expect(activeAuction.status).toBe('cancelled');
    expect(auditLogService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.user.verify',
        metadata: {
          status: VerificationStatus.PENDING,
          moderation: { affectedListings: 2, cancelledAuctions: 1 },
        },
      }),
    );
  });
});
