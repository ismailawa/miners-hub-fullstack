import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { Miner } from '../entities/miner.entity';
import { VerificationStatus } from '../entities/user.entity';
import { CreateListingDto, ListingFilterDto } from './listings.dto';
import { paginate } from '../common/dto/pagination.dto';
import { AuditLogService } from '../common/audit-log/audit-log.service';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Miner)
    private readonly minerRepository: Repository<Miner>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(userId: string, dto: CreateListingDto): Promise<Listing> {
    const miner = await this.minerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!miner) {
      throw new ForbiddenException(
        'Only registered miners can create listings. Please complete your miner profile first.',
      );
    }
    if (
      miner.user?.verificationStatus !== VerificationStatus.VERIFIED ||
      !miner.user?.onboardingComplete
    ) {
      throw new ForbiddenException(
        'Complete onboarding and verification before creating listings.',
      );
    }

    const listing = this.listingRepository.create({
      minerId: miner.id,
      mineralType: dto.mineralType,
      quantity: dto.quantity,
      price: dto.price,
      gradePurity: dto.gradePurity || null,
      location: dto.location || null,
      listingType: dto.listingType || 'buy_now',
      moisturePercentage: dto.moisturePercentage || null,
      images: dto.images || [],
      status: ListingStatus.SUBMITTED, // Needs admin approval
    });

    const saved = await this.listingRepository.save(listing);
    this.auditLogService.log({
      userId,
      action: 'listing.create',
      resource: 'listing',
      resourceId: saved.id,
      metadata: {
        mineralType: saved.mineralType,
        listingType: saved.listingType,
        status: saved.status,
      },
    });
    return saved;
  }

  async findMyListings(userId: string): Promise<Listing[]> {
    const miner = await this.minerRepository.findOne({ where: { userId } });
    if (!miner) return [];

    return this.listingRepository.find({
      where: { minerId: miner.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findPublished(filterDto: ListingFilterDto) {
    const qb = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.miner', 'miner')
      .leftJoinAndSelect('miner.user', 'user')
      .leftJoinAndSelect('listing.documents', 'documents')
      .where('listing.status = :status', { status: ListingStatus.PUBLISHED });

    if (filterDto.mineralType) {
      qb.andWhere('listing.mineralType ILIKE :mineralType', {
        mineralType: `%${filterDto.mineralType}%`,
      });
    }

    if (filterDto.location) {
      qb.andWhere('listing.location ILIKE :location', {
        location: `%${filterDto.location}%`,
      });
    }

    if (filterDto.minPrice !== undefined) {
      qb.andWhere('listing.price >= :minPrice', {
        minPrice: filterDto.minPrice,
      });
    }

    if (filterDto.maxPrice !== undefined) {
      qb.andWhere('listing.price <= :maxPrice', {
        maxPrice: filterDto.maxPrice,
      });
    }

    if (filterDto.listingType) {
      qb.andWhere('listing.listingType = :listingType', {
        listingType: filterDto.listingType,
      });
    }

    if (filterDto.gradePurity) {
      qb.andWhere('listing.gradePurity ILIKE :gradePurity', {
        gradePurity: `%${filterDto.gradePurity}%`,
      });
    }

    if (filterDto.minQuantity !== undefined) {
      qb.andWhere('listing.quantity >= :minQuantity', {
        minQuantity: filterDto.minQuantity,
      });
    }

    if (filterDto.maxQuantity !== undefined) {
      qb.andWhere('listing.quantity <= :maxQuantity', {
        maxQuantity: filterDto.maxQuantity,
      });
    }

    if (filterDto.sellerVerificationStatus) {
      qb.andWhere('user.verificationStatus = :sellerVerificationStatus', {
        sellerVerificationStatus: filterDto.sellerVerificationStatus,
      });
    }

    qb.orderBy('listing.createdAt', 'DESC');

    const [data, total] = await qb
      .skip(filterDto.offset)
      .take(filterDto.limit)
      .getManyAndCount();

    return paginate(data, total, filterDto);
  }

  async findOne(id: string): Promise<Listing> {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['miner', 'miner.user'],
    });

    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }

    // Usually, public APIs should only show published listings.
    // If it's a miner checking their own, they might use a different endpoint or we can handle it via role checks.
    // For simplicity of public access:
    if (listing.status !== ListingStatus.PUBLISHED) {
      // Allow if accessed by admin/owner, but since this is public, we restrict it.
      // A more robust way is handling roles in controller, but for MVP:
      throw new ForbiddenException('This listing is not currently published.');
    }

    return listing;
  }

  async delete(userId: string, listingId: string): Promise<void> {
    const miner = await this.minerRepository.findOne({ where: { userId } });
    if (!miner) throw new ForbiddenException('Miner profile not found.');

    const listing = await this.listingRepository.findOne({
      where: { id: listingId, minerId: miner.id },
    });
    if (!listing) throw new NotFoundException('Listing not found.');

    await this.listingRepository.remove(listing);
    this.auditLogService.log({
      userId,
      action: 'listing.delete',
      resource: 'listing',
      resourceId: listingId,
      metadata: {
        mineralType: listing.mineralType,
        previousStatus: listing.status,
      },
    });
  }

  async update(
    userId: string,
    listingId: string,
    dto: Partial<CreateListingDto>,
  ): Promise<Listing> {
    const miner = await this.minerRepository.findOne({ where: { userId } });
    if (!miner) throw new ForbiddenException('Miner profile not found.');

    const listing = await this.listingRepository.findOne({
      where: { id: listingId, minerId: miner.id },
    });
    if (!listing) throw new NotFoundException('Listing not found.');

    // Reset to SUBMITTED so admin re-approves after edit
    const previousStatus = listing.status;
    Object.assign(listing, { ...dto, status: ListingStatus.SUBMITTED });

    const saved = await this.listingRepository.save(listing);
    this.auditLogService.log({
      userId,
      action: 'listing.update',
      resource: 'listing',
      resourceId: saved.id,
      metadata: {
        previousStatus,
        status: saved.status,
        updatedFields: Object.keys(dto),
      },
    });
    return saved;
  }
}
