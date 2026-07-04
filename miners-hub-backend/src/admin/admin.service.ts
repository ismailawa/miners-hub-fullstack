import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, VerificationStatus } from '../entities/user.entity';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { Event } from '../entities/event.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import {
  Document,
  DocumentReviewStatus,
  DocumentType,
} from '../entities/document.entity';
import { ReviewDocumentDto } from '../documents/documents.dto';
import { CreateEventDto, UpdateEventDto } from '../events/events.dto';
import { AuditLogService } from '../common/audit-log/audit-log.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getUsers(status?: VerificationStatus, limit = 100, rawOffset = 0) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.miner', 'miner')
      .leftJoinAndSelect('user.investor', 'investor');

    if (status) {
      query.where('user.verificationStatus = :status', { status });
    }

    // Don't return admins to the list usually, but for now we return all miners/investors
    query.andWhere('user.role IN (:...roles)', {
      roles: ['miner', 'investor'],
    });
    query.orderBy('user.createdAt', 'DESC');
    query.skip(rawOffset).take(Math.min(limit, 100));

    return query.getMany();
  }

  async verifyUser(id: string, status: VerificationStatus, adminId?: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.verificationStatus = status;
    const saved = await this.userRepository.save(user);
    if (adminId) {
      this.auditLogService.log({
        userId: adminId,
        action: 'admin.user.verify',
        resource: 'user',
        resourceId: id,
        metadata: { status },
      });
    }
    return saved;
  }

  async getListings(status?: ListingStatus, limit = 100, rawOffset = 0) {
    const query = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.miner', 'miner')
      .leftJoinAndSelect('miner.user', 'user');

    if (status) {
      query.where('listing.status = :status', { status });
    }

    query.orderBy('listing.createdAt', 'DESC');
    query.skip(rawOffset).take(Math.min(limit, 100));

    return query.getMany();
  }

  async updateListingStatus(
    id: string,
    status: ListingStatus,
    adminId?: string,
  ) {
    const listing = await this.listingRepository.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    listing.status = status;
    const saved = await this.listingRepository.save(listing);
    if (adminId) {
      this.auditLogService.log({
        userId: adminId,
        action: 'admin.listing.status_update',
        resource: 'listing',
        resourceId: id,
        metadata: { status },
      });
    }
    return saved;
  }

  async getOrders(status?: OrderStatus, limit = 100, rawOffset = 0) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.listing', 'listing')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.escrowTransaction', 'escrowTransaction')
      .leftJoinAndSelect(
        'escrowTransaction.sellerPayoutAccount',
        'sellerPayoutAccount',
      );

    if (status) {
      query.where('order.status = :status', { status });
    }

    query.orderBy('order.createdAt', 'DESC');
    query.skip(rawOffset).take(Math.min(limit, 100));
    return query.getMany();
  }

  async getOrder(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'listing',
        'buyer',
        'seller',
        'escrowTransaction',
        'escrowTransaction.sellerPayoutAccount',
      ],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getDocuments(
    status?: DocumentReviewStatus,
    type?: DocumentType,
    limit = 100,
    rawOffset = 0,
  ) {
    const query = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.user', 'user')
      .leftJoinAndSelect('document.listing', 'listing');

    if (status) {
      query.andWhere('document.reviewStatus = :status', { status });
    }

    if (type) {
      query.andWhere('document.type = :type', { type });
    }

    query.andWhere("(document.metadata->>'deletedAt' IS NULL)");
    query.orderBy('document.createdAt', 'DESC');
    query.skip(rawOffset).take(Math.min(limit, 100));
    return query.getMany();
  }

  async reviewDocument(id: string, adminId: string, dto: ReviewDocumentDto) {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['user', 'listing'],
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.reviewStatus = dto.status;
    document.reviewNotes = dto.notes || null;
    document.reviewedBy = adminId;
    document.reviewedAt = new Date();

    const saved = await this.documentRepository.save(document);
    this.auditLogService.log({
      userId: adminId,
      action: 'admin.document.review',
      resource: 'document',
      resourceId: id,
      metadata: { status: dto.status },
    });
    return saved;
  }

  getEvents() {
    return this.eventRepository.find({
      order: { date: 'ASC', createdAt: 'DESC' },
    });
  }

  createEvent(dto: CreateEventDto) {
    const event = this.eventRepository.create(dto);
    return this.eventRepository.save(event);
  }

  async updateEvent(id: string, dto: UpdateEventDto) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    Object.assign(event, dto);
    return this.eventRepository.save(event);
  }

  async deleteEvent(id: string) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.eventRepository.remove(event);
    return { success: true };
  }
}
