import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, VerificationStatus } from '../entities/user.entity';
import { Miner } from '../entities/miner.entity';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { Auction } from '../entities/auction.entity';
import { Event } from '../entities/event.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import {
  Document,
  DocumentReviewStatus,
  DocumentType,
} from '../entities/document.entity';
import { Investor } from '../entities/investor.entity';
import {
  LaboratoryPartner,
  LaboratoryPartnerStatus,
} from '../entities/laboratory-partner.entity';
import {
  LogisticsProvider,
  LogisticsProviderStatus,
} from '../entities/logistics-provider.entity';
import { ReviewDocumentDto } from '../documents/documents.dto';
import { CreateEventDto, UpdateEventDto } from '../events/events.dto';
import { AuditLogService } from '../common/audit-log/audit-log.service';

type RegistryRole = 'miner' | 'investor' | 'laboratory' | 'logistics';

interface RegistryFilters {
  role?: RegistryRole | 'all';
  status?: VerificationStatus | LaboratoryPartnerStatus | LogisticsProviderStatus;
  documentStatus?: DocumentReviewStatus;
  location?: string;
  mineralType?: string;
  limit?: number;
  rawOffset?: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Miner)
    private readonly minerRepository: Repository<Miner>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Investor)
    private readonly investorRepository: Repository<Investor>,
    @InjectRepository(LaboratoryPartner)
    private readonly laboratoryPartnerRepository: Repository<LaboratoryPartner>,
    @InjectRepository(LogisticsProvider)
    private readonly logisticsProviderRepository: Repository<LogisticsProvider>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getUsers(status?: VerificationStatus, limit = 100, rawOffset = 0) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.miner', 'miner')
      .leftJoinAndSelect('miner.listings', 'listings')
      .leftJoinAndSelect('user.investor', 'investor')
      .leftJoinAndSelect('user.documents', 'documents');

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

  async getMinerRegistry(filters: RegistryFilters) {
    const roles = this.resolveRegistryRoles(filters.role);
    const records = (
      await Promise.all([
        roles.includes('miner') ? this.getMinerRegistryRecords(filters) : [],
        roles.includes('investor')
          ? this.getInvestorRegistryRecords(filters)
          : [],
        roles.includes('laboratory')
          ? this.getLaboratoryRegistryRecords(filters)
          : [],
        roles.includes('logistics')
          ? this.getLogisticsRegistryRecords(filters)
          : [],
      ])
    )
      .flat()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const offset = filters.rawOffset || 0;
    const limit = Math.min(filters.limit || 100, 100);
    return records.slice(offset, offset + limit);
  }

  private async getMinerRegistryRecords(filters: RegistryFilters) {
    const query = this.minerRepository
      .createQueryBuilder('miner')
      .leftJoinAndSelect('miner.user', 'user')
      .leftJoinAndSelect('user.documents', 'documents')
      .leftJoinAndSelect('miner.listings', 'listings')
      .where('user.role = :role', { role: 'miner' })
      .orderBy('user.createdAt', 'DESC');

    if (this.isVerificationStatus(filters.status)) {
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

    const miners = await query.getMany();

    return miners
      .map((miner) => this.toMinerRegistryItem(miner))
      .filter((registryItem) => {
        if (!filters.documentStatus) return true;
        const key = filters.documentStatus;
        return registryItem.documentSummary[key] > 0;
      });
  }

  private async getInvestorRegistryRecords(filters: RegistryFilters) {
    if (filters.documentStatus) return [];
    if (filters.status && !this.isVerificationStatus(filters.status)) return [];

    const query = this.investorRepository
      .createQueryBuilder('investor')
      .leftJoinAndSelect('investor.user', 'user')
      .where('user.role = :role', { role: 'investor' })
      .orderBy('user.createdAt', 'DESC');

    if (this.isVerificationStatus(filters.status)) {
      query.andWhere('user.verificationStatus = :status', {
        status: filters.status,
      });
    }

    if (filters.location) {
      query.andWhere('investor.businessAddress ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    if (filters.mineralType) {
      query.andWhere(
        `EXISTS (
          SELECT 1 FROM unnest(investor.investment_focus) focus
          WHERE focus ILIKE :mineralType
        )`,
        { mineralType: `%${filters.mineralType}%` },
      );
    }

    const investors = await query.getMany();
    return investors.map((investor) => this.toInvestorRegistryItem(investor));
  }

  private async getLaboratoryRegistryRecords(filters: RegistryFilters) {
    if (filters.documentStatus || filters.mineralType) return [];
    if (filters.status && !this.isProviderStatus(filters.status)) return [];

    const query = this.laboratoryPartnerRepository
      .createQueryBuilder('laboratory')
      .leftJoinAndSelect('laboratory.user', 'user')
      .orderBy('laboratory.createdAt', 'DESC');

    if (this.isProviderStatus(filters.status)) {
      query.andWhere('laboratory.status = :status', {
        status: this.normalizeProviderStatus(filters.status),
      });
    }

    if (filters.location) {
      query.andWhere('laboratory.address ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    const laboratories = await query.getMany();
    return laboratories.map((laboratory) =>
      this.toLaboratoryRegistryItem(laboratory),
    );
  }

  private async getLogisticsRegistryRecords(filters: RegistryFilters) {
    if (filters.documentStatus) return [];
    if (filters.status && !this.isProviderStatus(filters.status)) return [];

    const query = this.logisticsProviderRepository
      .createQueryBuilder('logistics')
      .leftJoinAndSelect('logistics.user', 'user')
      .orderBy('logistics.createdAt', 'DESC');

    if (this.isProviderStatus(filters.status)) {
      query.andWhere('logistics.status = :status', {
        status: this.normalizeProviderStatus(filters.status),
      });
    }

    if (filters.location) {
      query.andWhere(
        `EXISTS (
          SELECT 1 FROM unnest(logistics.service_areas) area
          WHERE area ILIKE :location
        )`,
        { location: `%${filters.location}%` },
      );
    }

    if (filters.mineralType) {
      query.andWhere(
        `EXISTS (
          SELECT 1 FROM unnest(logistics.capabilities) capability
          WHERE capability ILIKE :mineralType
        )`,
        { mineralType: `%${filters.mineralType}%` },
      );
    }

    const logisticsProviders = await query.getMany();
    return logisticsProviders.map((provider) =>
      this.toLogisticsRegistryItem(provider),
    );
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
      registryType: 'miner',
      registryLabel: 'Miner',
      detailAvailable: true,
      status: miner.user?.verificationStatus || VerificationStatus.PENDING,
      primaryFocus: listingMinerals,
      contact: {
        name: miner.user?.name || null,
        email: miner.user?.email || null,
        phoneNumber: miner.user?.phoneNumber || null,
      },
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

  private toInvestorRegistryItem(investor: Investor) {
    return {
      id: investor.id,
      registryType: 'investor',
      registryLabel: 'Investor',
      detailAvailable: false,
      status: investor.user?.verificationStatus || VerificationStatus.PENDING,
      primaryFocus: investor.investmentFocus || [],
      contact: {
        name: investor.user?.name || null,
        email: investor.user?.email || null,
        phoneNumber: investor.user?.phoneNumber || null,
      },
      userId: investor.userId,
      companyName: investor.companyName,
      location: investor.businessAddress || '',
      miningLicence: null,
      companyRegNumber: investor.companyRegNumber || null,
      businessAddress: investor.businessAddress || null,
      businessWebsite: investor.businessWebsite || null,
      industry: investor.industry || null,
      yearsInOperation: investor.yearsInOperation || null,
      cooperativeName: null,
      cooperativeRegNumber: null,
      partnerType: null,
      partnerOrganization: null,
      miningEquipment: [],
      certifications: [],
      user: investor.user
        ? {
            id: investor.user.id,
            name: investor.user.name || null,
            email: investor.user.email,
            phoneNumber: investor.user.phoneNumber || null,
            verificationStatus: investor.user.verificationStatus,
            onboardingComplete: investor.user.onboardingComplete,
            kycSubmittedAt: investor.user.kycSubmittedAt || null,
            kycVerifiedAt: investor.user.kycVerifiedAt || null,
            kycRejectedAt: investor.user.kycRejectedAt || null,
            metamapVerificationId: investor.user.metamapVerificationId || null,
            createdAt: investor.user.createdAt,
          }
        : null,
      documentSummary: { total: 0, pending: 0, approved: 0, rejected: 0 },
      listingSummary: {
        total: 0,
        published: 0,
        submitted: 0,
        minerals: investor.investmentFocus || [],
      },
      licenseStatus: 'missing',
      latestDocumentAt: null,
      createdAt: investor.createdAt,
      updatedAt: investor.updatedAt,
    };
  }

  private toLaboratoryRegistryItem(laboratory: LaboratoryPartner) {
    return {
      id: laboratory.id,
      registryType: 'laboratory',
      registryLabel: 'Laboratory',
      detailAvailable: false,
      status: laboratory.status,
      primaryFocus: laboratory.accreditationNumber
        ? [laboratory.accreditationNumber]
        : [],
      contact: {
        name: laboratory.user?.name || null,
        email: laboratory.contactEmail || laboratory.user?.email || null,
        phoneNumber:
          laboratory.contactPhone || laboratory.user?.phoneNumber || null,
      },
      userId: laboratory.userId || null,
      companyName: laboratory.companyName,
      location: laboratory.address || '',
      miningLicence: null,
      companyRegNumber: laboratory.accreditationNumber || null,
      businessAddress: laboratory.address || null,
      businessWebsite: null,
      industry: 'Laboratory services',
      yearsInOperation: null,
      cooperativeName: null,
      cooperativeRegNumber: null,
      partnerType: 'laboratory',
      partnerOrganization: laboratory.companyName,
      miningEquipment: [],
      certifications: laboratory.accreditationNumber
        ? [laboratory.accreditationNumber]
        : [],
      user: laboratory.user
        ? {
            id: laboratory.user.id,
            name: laboratory.user.name || null,
            email: laboratory.user.email,
            phoneNumber: laboratory.user.phoneNumber || null,
            verificationStatus: laboratory.user.verificationStatus,
            onboardingComplete: laboratory.user.onboardingComplete,
            kycSubmittedAt: laboratory.user.kycSubmittedAt || null,
            kycVerifiedAt: laboratory.user.kycVerifiedAt || null,
            kycRejectedAt: laboratory.user.kycRejectedAt || null,
            metamapVerificationId:
              laboratory.user.metamapVerificationId || null,
            createdAt: laboratory.user.createdAt,
          }
        : null,
      documentSummary: { total: 0, pending: 0, approved: 0, rejected: 0 },
      listingSummary: {
        total: 0,
        published: 0,
        submitted: 0,
        minerals: [],
      },
      licenseStatus: laboratory.status,
      latestDocumentAt: null,
      createdAt: laboratory.createdAt,
      updatedAt: laboratory.updatedAt,
    };
  }

  private toLogisticsRegistryItem(provider: LogisticsProvider) {
    return {
      id: provider.id,
      registryType: 'logistics',
      registryLabel: 'Logistics',
      detailAvailable: false,
      status: provider.status,
      primaryFocus: provider.capabilities || [],
      contact: {
        name: provider.user?.name || null,
        email: provider.contactEmail || provider.user?.email || null,
        phoneNumber: provider.contactPhone || provider.user?.phoneNumber || null,
      },
      userId: provider.userId || null,
      companyName: provider.companyName,
      location: (provider.serviceAreas || []).join(', '),
      miningLicence: null,
      companyRegNumber: null,
      businessAddress: (provider.serviceAreas || []).join(', '),
      businessWebsite: null,
      industry: 'Logistics',
      yearsInOperation: null,
      cooperativeName: null,
      cooperativeRegNumber: null,
      partnerType: 'logistics',
      partnerOrganization: provider.companyName,
      miningEquipment: [],
      certifications: [],
      user: provider.user
        ? {
            id: provider.user.id,
            name: provider.user.name || null,
            email: provider.user.email,
            phoneNumber: provider.user.phoneNumber || null,
            verificationStatus: provider.user.verificationStatus,
            onboardingComplete: provider.user.onboardingComplete,
            kycSubmittedAt: provider.user.kycSubmittedAt || null,
            kycVerifiedAt: provider.user.kycVerifiedAt || null,
            kycRejectedAt: provider.user.kycRejectedAt || null,
            metamapVerificationId: provider.user.metamapVerificationId || null,
            createdAt: provider.user.createdAt,
          }
        : null,
      documentSummary: { total: 0, pending: 0, approved: 0, rejected: 0 },
      listingSummary: {
        total: 0,
        published: 0,
        submitted: 0,
        minerals: provider.capabilities || [],
      },
      licenseStatus: provider.status,
      latestDocumentAt: null,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }

  private resolveRegistryRoles(role?: RegistryFilters['role']): RegistryRole[] {
    const roles: RegistryRole[] = [
      'miner',
      'investor',
      'laboratory',
      'logistics',
    ];
    if (!role || role === 'all') return roles;
    return roles.includes(role) ? [role] : roles;
  }

  private isVerificationStatus(
    status?: RegistryFilters['status'],
  ): status is VerificationStatus {
    return (
      status === VerificationStatus.PENDING ||
      status === VerificationStatus.VERIFIED ||
      status === VerificationStatus.REJECTED
    );
  }

  private isProviderStatus(status?: RegistryFilters['status']) {
    return (
      status === LaboratoryPartnerStatus.PENDING ||
      status === LaboratoryPartnerStatus.ACTIVE ||
      status === LaboratoryPartnerStatus.SUSPENDED ||
      status === VerificationStatus.VERIFIED
    );
  }

  private normalizeProviderStatus(status: RegistryFilters['status']) {
    return status === VerificationStatus.VERIFIED
      ? LaboratoryPartnerStatus.ACTIVE
      : status;
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
    } else if (status === VerificationStatus.PENDING) {
      user.kycRejectedAt = null;
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

  async getListings(
    status?: ListingStatus,
    listingType?: 'buy_now' | 'auction',
    limit = 100,
    rawOffset = 0,
  ) {
    const query = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.miner', 'miner')
      .leftJoinAndSelect('miner.user', 'user');

    if (status) {
      query.where('listing.status = :status', { status });
    }

    if (listingType) {
      query.andWhere('listing.listingType = :listingType', { listingType });
    }

    query.orderBy('listing.createdAt', 'DESC');
    query.skip(rawOffset).take(Math.min(limit, 100));

    const [data, total] = await query.getManyAndCount();
    return { data, total, limit: Math.min(limit, 100), rawOffset };
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
    if (saved.status === ListingStatus.PUBLISHED && saved.listingType === 'auction') {
      await this.ensureAuctionForPublishedListing(saved);
    }
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

  private async ensureAuctionForPublishedListing(listing: Listing): Promise<void> {
    const existing = await this.auctionRepository.findOne({
      where: { listingId: listing.id },
    });
    if (existing) return;

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    const auction = this.auctionRepository.create({
      listingId: listing.id,
      startTime,
      endTime,
      startingBid: Number(listing.price),
      minimumIncrement: 0,
      currentBid: null,
      status: 'active',
    });
    await this.auctionRepository.save(auction);
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
