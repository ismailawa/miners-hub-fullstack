import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { Miner } from '../entities/miner.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { User, VerificationStatus } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { CreateAuctionDto, PlaceBidDto } from './auctions.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

const ANTI_SNIPING_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
const ANTI_SNIPING_EXTENSION_MS = 5 * 60 * 1000; // 5-minute extension

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Miner)
    private readonly minerRepository: Repository<Miner>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(userId: string, dto: CreateAuctionDto): Promise<Auction> {
    // Verify caller is a miner who owns the listing
    const miner = await this.minerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!miner)
      throw new ForbiddenException('Only miners can create auctions.');
    if (
      miner.user?.verificationStatus !== VerificationStatus.VERIFIED ||
      !miner.user?.onboardingComplete
    ) {
      throw new ForbiddenException(
        'Complete onboarding and verification before creating auctions.',
      );
    }

    const listing = await this.listingRepository.findOne({
      where: { id: dto.listingId, minerId: miner.id },
    });
    if (!listing)
      throw new NotFoundException('Listing not found or not yours.');

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time.');
    }
    if (startTime < new Date()) {
      throw new BadRequestException('Start time must be in the future.');
    }

    // Update listing to auction type and submit for review
    listing.listingType = 'auction';
    listing.status = ListingStatus.SUBMITTED;
    await this.listingRepository.save(listing);

    const auction = this.auctionRepository.create({
      listingId: listing.id,
      startTime,
      endTime,
      startingBid: dto.startingBid,
      minimumIncrement: dto.minimumIncrement ?? 0,
      currentBid: null,
      status: 'active',
    });

    const saved = await this.auctionRepository.save(auction);

    this.auditLogService.log({
      userId,
      action: 'auction.create',
      resource: 'auction',
      resourceId: saved.id,
      metadata: { listingId: listing.id },
    });

    return saved;
  }

  async findAll(pagination: PaginationDto = new PaginationDto()) {
    await this.finalizeExpiredAuctions();

    const [data, total] = await this.auctionRepository
      .createQueryBuilder('auction')
      .leftJoinAndSelect('auction.listing', 'listing')
      .leftJoinAndSelect('listing.miner', 'miner')
      .leftJoinAndSelect('miner.user', 'user')
      .leftJoinAndSelect('auction.bids', 'bids')
      .leftJoinAndSelect('bids.bidder', 'bidder')
      .where('auction.status = :status', { status: 'active' })
      .andWhere('listing.status = :listingStatus', {
        listingStatus: ListingStatus.PUBLISHED,
      })
      .andWhere('auction.endTime > :now', { now: new Date() })
      .orderBy('auction.endTime', 'ASC')
      .addOrderBy('bids.amount', 'DESC')
      .skip(pagination.offset)
      .take(pagination.limit)
      .getManyAndCount();

    return paginate(data, total, pagination);
  }

  async findOne(id: string): Promise<Auction & { bids: Bid[] }> {
    await this.finalizeExpiredAuctions();

    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: [
        'listing',
        'listing.miner',
        'listing.miner.user',
        'bids',
        'bids.bidder',
      ],
      order: { bids: { amount: 'DESC' } },
    });
    if (!auction) throw new NotFoundException('Auction not found.');
    return auction as Auction & { bids: Bid[] };
  }

  async placeBid(
    auctionId: string,
    bidderId: string,
    dto: PlaceBidDto,
  ): Promise<Bid> {
    const bidder = await this.userRepository.findOne({
      where: { id: bidderId },
    });
    if (
      bidder?.verificationStatus !== VerificationStatus.VERIFIED ||
      !bidder?.onboardingComplete
    ) {
      throw new ForbiddenException(
        'Complete onboarding and verification before bidding.',
      );
    }

    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
      relations: ['listing', 'listing.miner'],
    });
    if (!auction) throw new NotFoundException('Auction not found.');

    // Check auction is active and not expired
    if (auction.status !== 'active') {
      throw new BadRequestException(
        `Auction is ${auction.status}. Bidding closed.`,
      );
    }
    const now = new Date();
    if (now > auction.endTime) {
      throw new BadRequestException('Auction has ended. Bidding is closed.');
    }
    if (now < auction.startTime) {
      throw new BadRequestException('Auction has not started yet.');
    }

    // Bidder cannot be the listing's miner
    if (auction.listing.miner.userId === bidderId) {
      throw new ForbiddenException('Miners cannot bid on their own auctions.');
    }

    // Validate bid amount
    const minimumBid = auction.currentBid
      ? Number(auction.currentBid) + Number(auction.minimumIncrement)
      : Number(auction.startingBid);

    if (dto.amount < minimumBid) {
      throw new BadRequestException(
        `Bid must be at least ₦${minimumBid.toLocaleString()}.`,
      );
    }

    // Anti-sniping: extend endTime if bid placed in last 2 minutes
    const timeLeft = auction.endTime.getTime() - now.getTime();
    if (timeLeft <= ANTI_SNIPING_WINDOW_MS) {
      auction.endTime = new Date(
        auction.endTime.getTime() + ANTI_SNIPING_EXTENSION_MS,
      );
    }

    // Update currentBid
    auction.currentBid = dto.amount;
    await this.auctionRepository.save(auction);

    // Save bid record
    const bid = this.bidRepository.create({
      auctionId,
      bidderId,
      amount: dto.amount,
    });
    const savedBid = await this.bidRepository.save(bid);

    // Notify miner of new bid
    await this.notificationsService.create(auction.listing.miner.userId, {
      title: 'New Bid Received',
      message: `A new bid of ₦${dto.amount.toLocaleString()} was placed on your auction.`,
      notificationType: 'info',
    });

    this.auditLogService.log({
      userId: bidderId,
      action: 'auction.bid_placed',
      resource: 'auction',
      resourceId: auctionId,
      metadata: { amount: dto.amount },
    });

    return savedBid;
  }

  async getBids(
    auctionId: string,
    pagination: PaginationDto = new PaginationDto(),
  ) {
    const [data, total] = await this.bidRepository
      .createQueryBuilder('bid')
      .leftJoinAndSelect('bid.bidder', 'bidder')
      .where('bid.auctionId = :auctionId', { auctionId })
      .orderBy('bid.amount', 'DESC')
      .skip(pagination.offset)
      .take(pagination.limit)
      .getManyAndCount();

    return paginate(data, total, pagination);
  }

  async finalizeExpiredAuctions(): Promise<Auction[]> {
    const expired = await this.auctionRepository.find({
      where: { status: 'active' },
      relations: ['listing', 'listing.miner'],
    });
    const now = new Date();
    const finalized: Auction[] = [];

    for (const auction of expired.filter((item) => item.endTime <= now)) {
      const highestBid = await this.bidRepository.findOne({
        where: { auctionId: auction.id },
        order: { amount: 'DESC', createdAt: 'ASC' },
      });

      auction.status = 'completed';
      if (highestBid) {
        auction.currentBid = highestBid.amount;
        auction.listing.status = ListingStatus.SOLD;
        await this.listingRepository.save(auction.listing);

        const existingOrder = await this.orderRepository.findOne({
          where: { listingId: auction.listingId, buyerId: highestBid.bidderId },
        });
        if (!existingOrder) {
          const order = this.orderRepository.create({
            buyerId: highestBid.bidderId,
            sellerId: auction.listing.miner.userId,
            listingId: auction.listingId,
            quantity: auction.listing.quantity,
            totalAmount: highestBid.amount,
            status: OrderStatus.PENDING,
            paymentStatus: 'pending',
            statusHistory: [
              {
                status: OrderStatus.PENDING,
                date: now.toISOString(),
                location: auction.listing.location || undefined,
                notes: 'Order created from winning auction bid.',
              },
            ],
          });
          const savedOrder = await this.orderRepository.save(order);

          await this.notificationsService.create(highestBid.bidderId, {
            title: 'Auction Won',
            message: `You won the auction for ${auction.listing.mineralType}. Please complete escrow payment.`,
            notificationType: 'success',
          });
          await this.notificationsService.create(auction.listing.miner.userId, {
            title: 'Auction Completed',
            message: `Your auction for ${auction.listing.mineralType} has a winning bid.`,
            notificationType: 'info',
          });

          this.auditLogService.log({
            userId: highestBid.bidderId,
            action: 'auction.finalized',
            resource: 'auction',
            resourceId: auction.id,
            metadata: { orderId: savedOrder.id, winningBidId: highestBid.id },
          });
        }
      }

      finalized.push(await this.auctionRepository.save(auction));
    }

    return finalized;
  }
}
