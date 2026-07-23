import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractStatus } from '../entities/contract.entity';
import { ListingStatus } from '../entities/listing.entity';
import { UserRole } from '../entities/user.entity';

describe('ContractsService', () => {
  const investorId = 'investor-user-id';
  const minerUserId = 'miner-user-id';
  const listingId = 'listing-id';

  function createService() {
    const contractRepository = {
      create: jest.fn((contract: unknown) => contract),
      save: jest.fn((contract: unknown) =>
        Promise.resolve({
          id: 'contract-id',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          ...(contract as Record<string, unknown>),
        }),
      ),
    };
    const listingRepository = {
      findOne: jest.fn(),
    };
    const notificationsService = {
      create: jest.fn(),
    };
    const auditLogService = {
      log: jest.fn(),
    };
    const signNowService = {};
    const usersService = {
      findById: jest.fn(),
    };

    const service = new ContractsService(
      contractRepository as any,
      listingRepository as any,
      notificationsService as any,
      auditLogService as any,
      signNowService as any,
      usersService as any,
    );

    return {
      service,
      contractRepository,
      listingRepository,
      notificationsService,
      auditLogService,
      usersService,
    };
  }

  function publishedListing(overrides = {}) {
    return {
      id: listingId,
      status: ListingStatus.PUBLISHED,
      miner: {
        userId: minerUserId,
        user: { id: minerUserId, role: UserRole.MINER },
      },
      ...overrides,
    };
  }

  function createDto(overrides = {}) {
    return {
      listingId,
      title: 'Tin Ore Purchase',
      terms: 'Standard marketplace purchase terms.',
      value: 500000,
      ...overrides,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a published listing contract with investor as party1 and miner as party2', async () => {
    const {
      service,
      contractRepository,
      listingRepository,
      notificationsService,
      usersService,
    } = createService();
    usersService.findById.mockResolvedValue({
      id: investorId,
      role: UserRole.INVESTOR,
    });
    listingRepository.findOne.mockResolvedValue(publishedListing());

    const result = await service.create(investorId, createDto());

    expect(contractRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        party1Id: investorId,
        party2Id: minerUserId,
        listingId,
        status: ContractStatus.PROPOSED,
      }),
    );
    expect(notificationsService.create).toHaveBeenCalledWith(
      minerUserId,
      expect.objectContaining({ title: 'Contract Proposal' }),
    );
    expect(result.party1Id).toBe(investorId);
    expect(result.party2Id).toBe(minerUserId);
  });

  it('rejects contract creation by miners', async () => {
    const { service, usersService } = createService();
    usersService.findById.mockResolvedValue({
      id: minerUserId,
      role: UserRole.MINER,
    });

    await expect(
      service.create(minerUserId, createDto()),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it.each([UserRole.ADMIN, UserRole.GOVERNMENT, null])(
    'rejects contract creation by non-investor role %s',
    async (role) => {
      const { service, usersService } = createService();
      usersService.findById.mockResolvedValue({ id: 'user-id', role });

      await expect(
        service.create('user-id', createDto()),
      ).rejects.toBeInstanceOf(ForbiddenException);
    },
  );

  it('rejects unknown listings', async () => {
    const { service, listingRepository, usersService } = createService();
    usersService.findById.mockResolvedValue({
      id: investorId,
      role: UserRole.INVESTOR,
    });
    listingRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create(investorId, createDto()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([
    ListingStatus.DRAFT,
    ListingStatus.SUBMITTED,
    ListingStatus.UNDER_REVIEW,
    ListingStatus.SOLD,
    ListingStatus.ARCHIVED,
    ListingStatus.EXPIRED,
  ])('rejects %s listings', async (status) => {
    const { service, listingRepository, usersService } = createService();
    usersService.findById.mockResolvedValue({
      id: investorId,
      role: UserRole.INVESTOR,
    });
    listingRepository.findOne.mockResolvedValue(publishedListing({ status }));

    await expect(
      service.create(investorId, createDto()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects deprecated party2Id when it does not match the listing miner', async () => {
    const { service, listingRepository, usersService } = createService();
    usersService.findById.mockResolvedValue({
      id: investorId,
      role: UserRole.INVESTOR,
    });
    listingRepository.findOne.mockResolvedValue(publishedListing());

    await expect(
      service.create(investorId, createDto({ party2Id: 'other-user-id' })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts deprecated party2Id when it matches the listing miner', async () => {
    const { service, listingRepository, usersService } = createService();
    usersService.findById.mockResolvedValue({
      id: investorId,
      role: UserRole.INVESTOR,
    });
    listingRepository.findOne.mockResolvedValue(publishedListing());

    await expect(
      service.create(investorId, createDto({ party2Id: minerUserId })),
    ).resolves.toEqual(expect.objectContaining({ party2Id: minerUserId }));
  });
});
