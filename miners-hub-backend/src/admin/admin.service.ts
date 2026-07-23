import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, VerificationStatus } from '../entities/user.entity';
import { Miner } from '../entities/miner.entity';
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
    @InjectRepository(Miner)
    private readonly minerRepository: Repository<Miner>,
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

  async getMinerRegistry(filters: {
    status?: VerificationStatus;
    documentStatus?: DocumentReviewStatus;
    location?: string;
    mineralType?: string;
    limit?: number;
    rawOffset?: number;
  }) {
    const query = this.minerRepository
      .createQueryBuilder('miner')
      .leftJoinAndSelect('miner.user', 'user')
      .leftJoinAndSelect('user.documents', 'documents')
      .leftJoinAndSelect('miner.listings', 'listings')
      .where('user.role = :role', { role: 'miner' })
      .orderBy('user.createdAt', 'DESC');

    if (filters.status) {
      query.andWhere('user.verificationStatus = :status', {
        status: filters.status,
      });
    }

    if (filters.location) {
      query.andWhere('miner.location ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    if (filters.mineralType) {
      query.andWhere('listings.mineralType ILIKE :mineralType', {
        mineralType: `%${filters.mineralType}%`,
      });
    }

    const miners = await query
      .skip(filters.rawOffset || 0)
      .take(Math.min(filters.limit || 100, 100))
      .getMany();

    return miners
      .map((miner) => this.toMinerRegistryItem(miner))
      .filter((registryItem) => {
        if (!filters.documentStatus) return true;
        const key = filters.documentStatus;
        return registryItem.documentSummary[key] > 0;
      });
  }

  async getMinerRegistryDetail(id: string) {
    const miner = await this.minerRepository
      .createQueryBuilder('miner')
      .leftJoinAndSelect('miner.user', 'user')
      .leftJoinAndSelect('user.documents', 'documents')
      .leftJoinAndSelect('miner.listings', 'listings')
      .where('miner.id = :id', { id })
      .andWhere('user.role = :role', { role: 'miner' })
      .getOne();

    if (!miner) {
      throw new NotFoundException('Miner registry record not found');
    }

    const activeDocuments = this.getActiveDocuments(miner);

    return {
      ...this.toMinerRegistryItem(miner),
      verification: {
        status: miner.user?.verificationStatus || VerificationStatus.PENDING,
        onboardingComplete: miner.user?.onboardingComplete || false,
        kycSubmittedAt: miner.user?.kycSubmittedAt || null,
        kycVerifiedAt: miner.user?.kycVerifiedAt || null,
        kycRejectedAt: miner.user?.kycRejectedAt || null,
        metamapVerificationId: miner.user?.metamapVerificationId || null,
        licenseStatus: this.resolveLicenseStatus(
          activeDocuments.filter(
            (document) => document.type === DocumentType.MINING_LICENCE,
          ),
        ),
      },
      documents: activeDocuments
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map((document) => ({
          id: document.id,
          type: document.type,
          fileName: document.fileName,
          reviewStatus: document.reviewStatus,
          reviewNotes: document.reviewNotes || null,
          reviewedAt: document.reviewedAt || null,
          createdAt: document.createdAt,
        })),
      listings: (miner.listings || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map((listing) => ({
          id: listing.id,
          mineralType: listing.mineralType,
          status: listing.status,
          quantity: listing.quantity,
          price: listing.price,
          createdAt: listing.createdAt,
        })),
      timeline: this.buildMinerRegistryTimeline(miner),
    };
  }

  private toMinerRegistryItem(miner: Miner) {
    const activeDocuments = this.getActiveDocuments(miner);
    const listingMinerals = Array.from(
      new Set((miner.listings || []).map((listing) => listing.mineralType)),
    ).filter(Boolean);
    const licenseDocuments = activeDocuments.filter(
      (document) => document.type === DocumentType.MINING_LICENCE,
    );

    const documentSummary = {
      total: activeDocuments.length,
      pending: activeDocuments.filter(
        (document) => document.reviewStatus === DocumentReviewStatus.PENDING,
      ).length,
      approved: activeDocuments.filter(
        (document) => document.reviewStatus === DocumentReviewStatus.APPROVED,
      ).length,
      rejected: activeDocuments.filter(
        (document) => document.reviewStatus === DocumentReviewStatus.REJECTED,
      ).length,
    };

    const latestDocument = activeDocuments
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

    return {
      id: miner.id,
      userId: miner.userId,
      companyName: miner.companyName,
      location: miner.location,
      miningLicence: miner.miningLicence,
      companyRegNumber: miner.companyRegNumber || null,
      businessAddress: miner.businessAddress || null,
      businessWebsite: miner.businessWebsite || null,
      industry: miner.industry || null,
      yearsInOperation: miner.yearsInOperation || null,
      cooperativeName: miner.cooperativeName || null,
      cooperativeRegNumber: miner.cooperativeRegNumber || null,
      partnerType: miner.partnerType || null,
      partnerOrganization: miner.partnerOrganization || null,
      miningEquipment: miner.miningEquipment || [],
      certifications: miner.certifications || [],
      user: miner.user
        ? {
            id: miner.user.id,
            name: miner.user.name || null,
            email: miner.user.email,
            phoneNumber: miner.user.phoneNumber || null,
            verificationStatus: miner.user.verificationStatus,
            onboardingComplete: miner.user.onboardingComplete,
            kycSubmittedAt: miner.user.kycSubmittedAt || null,
            kycVerifiedAt: miner.user.kycVerifiedAt || null,
            kycRejectedAt: miner.user.kycRejectedAt || null,
            metamapVerificationId: miner.user.metamapVerificationId || null,
            createdAt: miner.user.createdAt,
          }
        : null,
      documentSummary,
      listingSummary: {
        total: miner.listings?.length || 0,
        published: (miner.listings || []).filter(
          (listing) => listing.status === ListingStatus.PUBLISHED,
        ).length,
        submitted: (miner.listings || []).filter(
          (listing) => listing.status === ListingStatus.SUBMITTED,
        ).length,
        minerals: listingMinerals,
      },
      licenseStatus: this.resolveLicenseStatus(licenseDocuments),
      latestDocumentAt: latestDocument?.createdAt || null,
      createdAt: miner.createdAt,
      updatedAt: miner.updatedAt,
    };
  }

  private getActiveDocuments(miner: Miner) {
    return (miner.user?.documents || []).filter(
      (document) => !document.metadata?.deletedAt,
    );
  }

  private buildMinerRegistryTimeline(miner: Miner) {
    const timeline: Array<{
      id: string;
      title: string;
      status: string;
      occurredAt: Date;
      description?: string;
    }> = [
      {
        id: `profile-${miner.id}`,
        title: 'Miner profile created',
        status: 'created',
        occurredAt: miner.createdAt,
        description: miner.companyName,
      },
    ];

    if (miner.user?.kycSubmittedAt) {
      timeline.push({
        id: `kyc-submitted-${miner.user.id}`,
        title: 'KYC submitted',
        status: VerificationStatus.PENDING,
        occurredAt: miner.user.kycSubmittedAt,
        description: miner.user.metamapVerificationId || undefined,
      });
    }

    if (miner.user?.kycVerifiedAt) {
      timeline.push({
        id: `kyc-verified-${miner.user.id}`,
        title: 'KYC verified',
        status: VerificationStatus.VERIFIED,
        occurredAt: miner.user.kycVerifiedAt,
      });
    }

    if (miner.user?.kycRejectedAt) {
      timeline.push({
        id: `kyc-rejected-${miner.user.id}`,
        title: 'KYC rejected',
        status: VerificationStatus.REJECTED,
        occurredAt: miner.user.kycRejectedAt,
      });
    }

    this.getActiveDocuments(miner).forEach((document) => {
      timeline.push({
        id: `document-${document.id}`,
        title: `${document.type.replace(/_/g, ' ')} uploaded`,
        status: document.reviewStatus,
        occurredAt: document.createdAt,
        description: document.fileName,
      });

      if (document.reviewedAt) {
        timeline.push({
          id: `document-reviewed-${document.id}`,
          title: `${document.type.replace(/_/g, ' ')} reviewed`,
          status: document.reviewStatus,
          occurredAt: document.reviewedAt,
          description: document.reviewNotes || undefined,
        });
      }
    });

    (miner.listings || []).forEach((listing) => {
      timeline.push({
        id: `listing-${listing.id}`,
        title: 'Marketplace listing created',
        status: listing.status,
        occurredAt: listing.createdAt,
        description: listing.mineralType,
      });
    });

    return timeline.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  }

  async verifyUser(id: string, status: VerificationStatus, adminId?: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.verificationStatus = status;
    if (status === VerificationStatus.VERIFIED) {
      user.kycVerifiedAt = user.kycVerifiedAt || new Date();
      user.kycRejectedAt = null;
      user.onboardingComplete = true;
    } else if (status === VerificationStatus.REJECTED) {
      user.kycRejectedAt = new Date();
      user.kycVerifiedAt = null;
      user.onboardingComplete = false;
    }
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

  private resolveLicenseStatus(documents: Document[]) {
    if (
      documents.some(
        (document) =>
          document.reviewStatus === DocumentReviewStatus.APPROVED,
      )
    ) {
      return DocumentReviewStatus.APPROVED;
    }

    if (
      documents.some(
        (document) => document.reviewStatus === DocumentReviewStatus.PENDING,
      )
    ) {
      return DocumentReviewStatus.PENDING;
    }

    if (
      documents.some(
        (document) => document.reviewStatus === DocumentReviewStatus.REJECTED,
      )
    ) {
      return DocumentReviewStatus.REJECTED;
    }

    return 'missing';
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
