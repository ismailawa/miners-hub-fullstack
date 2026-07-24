import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import {
  Document,
  LabResult,
  License,
  Listing,
  ListingStatus,
  LogisticsProvider,
  MineSite,
  MineralPassport,
  Miner,
  Order,
  ProductionReport,
  Shipment,
  User,
  UserRole,
} from '../entities';

export type LookupResource =
  | 'users'
  | 'miners'
  | 'mine-sites'
  | 'licenses'
  | 'listings'
  | 'orders'
  | 'production-reports'
  | 'lab-results'
  | 'mineral-passports'
  | 'logistics-providers'
  | 'shipments'
  | 'documents';

type Actor = { id: string; role: UserRole };

type LookupFilters = {
  q: string;
  limit: number;
  siteId?: string;
  minerId?: string;
  listingId?: string;
  orderId?: string;
};

export type LookupOption = {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  metadata?: Record<string, any>;
};

@Injectable()
export class LookupsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Miner) private readonly minerRepository: Repository<Miner>,
    @InjectRepository(MineSite) private readonly siteRepository: Repository<MineSite>,
    @InjectRepository(License) private readonly licenseRepository: Repository<License>,
    @InjectRepository(Listing) private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(ProductionReport) private readonly reportRepository: Repository<ProductionReport>,
    @InjectRepository(LabResult) private readonly labResultRepository: Repository<LabResult>,
    @InjectRepository(MineralPassport) private readonly passportRepository: Repository<MineralPassport>,
    @InjectRepository(LogisticsProvider) private readonly providerRepository: Repository<LogisticsProvider>,
    @InjectRepository(Shipment) private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Document) private readonly documentRepository: Repository<Document>,
  ) {}

  async search(actor: Actor, resource: LookupResource, filters: LookupFilters): Promise<LookupOption[]> {
    const limit = Math.min(Math.max(filters.limit || 20, 1), 50);
    const normalized = { ...filters, q: (filters.q || '').trim(), limit };

    switch (resource) {
      case 'users':
        return this.searchUsers(actor, normalized);
      case 'miners':
        return this.searchMiners(actor, normalized);
      case 'mine-sites':
        return this.searchMineSites(actor, normalized);
      case 'licenses':
        return this.searchLicenses(actor, normalized);
      case 'listings':
        return this.searchListings(actor, normalized);
      case 'orders':
        return this.searchOrders(actor, normalized);
      case 'production-reports':
        return this.searchProductionReports(actor, normalized);
      case 'lab-results':
        return this.searchLabResults(actor, normalized);
      case 'mineral-passports':
        return this.searchMineralPassports(actor, normalized);
      case 'logistics-providers':
        return this.searchLogisticsProviders(normalized);
      case 'shipments':
        return this.searchShipments(actor, normalized);
      case 'documents':
        return this.searchDocuments(actor, normalized);
      default:
        throw new BadRequestException('Unsupported lookup resource.');
    }
  }

  private async searchUsers(actor: Actor, filters: LookupFilters) {
    const query = this.userRepository.createQueryBuilder('user').orderBy('user.createdAt', 'DESC');
    if (!this.isReviewer(actor)) query.where('user.id = :actorId', { actorId: actor.id });
    this.applySearch(query, filters.q, [
      ['user.name', 'name'],
      ['user.email', 'email'],
      ['user.phoneNumber', 'phone'],
      ['user.id', 'id'],
    ]);
    const users = await query.take(filters.limit).getMany();
    return users.map((user) => ({
      id: user.id,
      label: user.name || user.email,
      description: [user.email, user.role].filter(Boolean).join(' | '),
      badge: user.verificationStatus,
      metadata: {
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        onboardingComplete: user.onboardingComplete,
      },
    }));
  }

  private async searchMiners(actor: Actor, filters: LookupFilters) {
    const query = this.minerRepository
      .createQueryBuilder('miner')
      .leftJoinAndSelect('miner.user', 'user')
      .orderBy('miner.companyName', 'ASC');
    if (!this.isReviewer(actor)) query.where('miner.userId = :actorId', { actorId: actor.id });
    this.applySearch(query, filters.q, [
      ['miner.companyName', 'company'],
      ['miner.location', 'location'],
      ['miner.miningLicence', 'license'],
      ['user.email', 'email'],
      ['miner.id', 'id'],
    ]);
    const miners = await query.take(filters.limit).getMany();
    return miners.map((miner) => ({
      id: miner.id,
      label: miner.companyName,
      description: [miner.location, miner.user?.email].filter(Boolean).join(' | '),
      badge: miner.user?.verificationStatus,
      metadata: {
        userId: miner.userId,
        companyName: miner.companyName,
        location: miner.location,
        email: miner.user?.email,
        verificationStatus: miner.user?.verificationStatus,
      },
    }));
  }

  private async searchMineSites(actor: Actor, filters: LookupFilters) {
    const query = this.siteRepository
      .createQueryBuilder('site')
      .leftJoinAndSelect('site.operator', 'operator')
      .leftJoinAndSelect('operator.user', 'operatorUser')
      .orderBy('site.updatedAt', 'DESC');
    await this.applyMineSiteAccess(query, actor, 'site');
    if (filters.minerId) query.andWhere('site.operatorId = :minerId', { minerId: filters.minerId });
    this.applySearch(query, filters.q, [
      ['site.name', 'name'],
      ['site.state', 'state'],
      ['site.lga', 'lga'],
      ['site.community', 'community'],
      ['operator.companyName', 'operator'],
      ['site.id', 'id'],
    ]);
    const sites = await query.take(filters.limit).getMany();
    return sites.map((site) => ({
      id: site.id,
      label: site.name,
      description: [site.operator?.companyName, site.community, site.lga, site.state].filter(Boolean).join(' | '),
      badge: site.siteStatus,
      metadata: {
        operatorId: site.operatorId,
        operatorUserId: site.operator?.userId,
        operatorName: site.operator?.companyName,
        licenseId: site.licenseId,
        mineralTypes: site.mineralTypes,
        state: site.state,
        lga: site.lga,
        community: site.community,
        latitude: site.latitude,
        longitude: site.longitude,
        riskLevel: site.riskLevel,
      },
    }));
  }

  private async searchLicenses(actor: Actor, filters: LookupFilters) {
    const query = this.licenseRepository
      .createQueryBuilder('license')
      .leftJoinAndSelect('license.holder', 'holder')
      .leftJoinAndSelect('license.site', 'site')
      .orderBy('license.expiryDate', 'ASC');
    if (!this.isReviewer(actor)) query.where('license.holderUserId = :actorId', { actorId: actor.id });
    if (filters.siteId) query.andWhere('license.siteId = :siteId', { siteId: filters.siteId });
    this.applySearch(query, filters.q, [
      ['license.licenseNumber', 'number'],
      ['license.issuingAuthority', 'authority'],
      ['license.issuingOffice', 'office'],
      ['holder.email', 'holderEmail'],
      ['site.name', 'siteName'],
      ['license.id', 'id'],
    ]);
    const licenses = await query.take(filters.limit).getMany();
    return licenses.map((license) => ({
      id: license.id,
      label: license.licenseNumber,
      description: [license.licenseType, license.site?.name, license.holder?.email].filter(Boolean).join(' | '),
      badge: license.status,
      metadata: {
        holderUserId: license.holderUserId,
        siteId: license.siteId,
        licenseNumber: license.licenseNumber,
        licenseType: license.licenseType,
        expiryDate: license.expiryDate,
        status: license.status,
      },
    }));
  }

  private async searchListings(actor: Actor, filters: LookupFilters) {
    const query = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.miner', 'miner')
      .leftJoinAndSelect('miner.user', 'minerUser')
      .orderBy('listing.updatedAt', 'DESC');
    if (!this.isReviewer(actor)) {
      query.where(
        new Brackets((qb) => {
          qb.where('listing.status = :published', { published: ListingStatus.PUBLISHED })
            .orWhere('miner.userId = :actorId', { actorId: actor.id });
        }),
      );
    }
    if (filters.minerId) query.andWhere('listing.minerId = :minerId', { minerId: filters.minerId });
    this.applySearch(query, filters.q, [
      ['listing.mineralType', 'mineral'],
      ['listing.location', 'location'],
      ['listing.gradePurity', 'grade'],
      ['miner.companyName', 'miner'],
      ['listing.id', 'id'],
    ]);
    const listings = await query.take(filters.limit).getMany();
    return listings.map((listing) => ({
      id: listing.id,
      label: `${listing.mineralType} - ${Number(listing.quantity).toLocaleString()} tonnes`,
      description: [listing.miner?.companyName, listing.location, listing.gradePurity].filter(Boolean).join(' | '),
      badge: listing.status,
      metadata: {
        minerId: listing.minerId,
        minerName: listing.miner?.companyName,
        mineralType: listing.mineralType,
        quantity: Number(listing.quantity),
        price: Number(listing.price),
        grade: listing.gradePurity,
        location: listing.location,
        listingType: listing.listingType,
      },
    }));
  }

  private async searchOrders(actor: Actor, filters: LookupFilters) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.listing', 'listing')
      .leftJoinAndSelect('listing.miner', 'miner')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .orderBy('order.updatedAt', 'DESC');
    if (!this.isReviewer(actor)) {
      query.where('(order.buyerId = :actorId OR order.sellerId = :actorId)', { actorId: actor.id });
    }
    if (filters.listingId) query.andWhere('order.listingId = :listingId', { listingId: filters.listingId });
    this.applySearch(query, filters.q, [
      ['order.id', 'id'],
      ['listing.mineralType', 'mineral'],
      ['buyer.email', 'buyer'],
      ['seller.email', 'seller'],
      ['miner.companyName', 'miner'],
    ]);
    const orders = await query.take(filters.limit).getMany();
    return orders.map((order) => ({
      id: order.id,
      label: `${order.listing?.mineralType || 'Order'} - ${Number(order.quantity).toLocaleString()} tonnes`,
      description: [order.status, order.buyer?.email, order.seller?.email].filter(Boolean).join(' | '),
      badge: order.paymentStatus,
      metadata: {
        listingId: order.listingId,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        mineralType: order.listing?.mineralType,
        quantity: Number(order.quantity),
        totalAmount: Number(order.totalAmount),
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    }));
  }

  private async searchProductionReports(actor: Actor, filters: LookupFilters) {
    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.site', 'site')
      .leftJoinAndSelect('report.miner', 'miner')
      .orderBy('report.periodEnd', 'DESC');
    if (!this.isReviewer(actor)) {
      const miner = await this.getActorMiner(actor.id);
      query.where('report.minerId = :minerId', { minerId: miner?.id || '' });
    }
    if (filters.siteId) query.andWhere('report.siteId = :siteId', { siteId: filters.siteId });
    if (filters.minerId) query.andWhere('report.minerId = :minerIdFilter', { minerIdFilter: filters.minerId });
    this.applySearch(query, filters.q, [
      ['report.mineralType', 'mineral'],
      ['report.grade', 'grade'],
      ['site.name', 'site'],
      ['miner.companyName', 'miner'],
      ['report.id', 'id'],
    ]);
    const reports = await query.take(filters.limit).getMany();
    return reports.map((report) => ({
      id: report.id,
      label: `${report.mineralType} report (${report.periodStart} - ${report.periodEnd})`,
      description: [report.site?.name, report.miner?.companyName, `${Number(report.quantity).toLocaleString()} ${report.unit}`].filter(Boolean).join(' | '),
      badge: report.status,
      metadata: {
        siteId: report.siteId,
        siteName: report.site?.name,
        minerId: report.minerId,
        minerName: report.miner?.companyName,
        mineralType: report.mineralType,
        grade: report.grade,
        quantity: Number(report.quantity),
        unit: report.unit,
        estimatedValue: report.estimatedValue ? Number(report.estimatedValue) : null,
        supportingDocumentIds: report.supportingDocumentIds,
      },
    }));
  }

  private async searchLabResults(actor: Actor, filters: LookupFilters) {
    const query = this.labResultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.lab', 'lab')
      .leftJoinAndSelect('result.listing', 'listing')
      .leftJoinAndSelect('listing.miner', 'listingMiner')
      .leftJoinAndSelect('result.productionReport', 'report')
      .leftJoinAndSelect('report.miner', 'reportMiner')
      .orderBy('result.updatedAt', 'DESC');
    if (!this.isReviewer(actor)) {
      const miner = await this.getActorMiner(actor.id);
      query.where(
        new Brackets((qb) => {
          qb.where('result.requesterId = :actorId', { actorId: actor.id })
            .orWhere('listingMiner.userId = :actorId', { actorId: actor.id });
          if (miner) qb.orWhere('report.minerId = :minerId', { minerId: miner.id });
        }),
      );
    }
    if (filters.listingId) query.andWhere('result.listingId = :listingId', { listingId: filters.listingId });
    this.applySearch(query, filters.q, [
      ['result.sampleReference', 'sample'],
      ['result.mineralType', 'mineral'],
      ['result.grade', 'grade'],
      ['lab.companyName', 'lab'],
      ['result.id', 'id'],
    ]);
    const results = await query.take(filters.limit).getMany();
    return results.map((result) => ({
      id: result.id,
      label: `${result.sampleReference} - ${result.mineralType}`,
      description: [result.lab?.companyName, result.grade, result.status].filter(Boolean).join(' | '),
      badge: result.status,
      metadata: {
        labId: result.labId,
        labName: result.lab?.companyName,
        listingId: result.listingId,
        productionReportId: result.productionReportId,
        mineralPassportId: result.mineralPassportId,
        mineralType: result.mineralType,
        grade: result.grade,
        assayValue: result.assayValue ? Number(result.assayValue) : null,
        assayUnit: result.assayUnit,
        certificateUrl: result.certificateUrl,
      },
    }));
  }

  private async searchMineralPassports(actor: Actor, filters: LookupFilters) {
    const query = this.passportRepository
      .createQueryBuilder('passport')
      .leftJoinAndSelect('passport.miner', 'miner')
      .leftJoinAndSelect('passport.listing', 'listing')
      .leftJoinAndSelect('passport.shipment', 'shipment')
      .orderBy('passport.updatedAt', 'DESC');
    if (!this.isReviewer(actor)) {
      const miner = await this.getActorMiner(actor.id);
      query.where(
        new Brackets((qb) => {
          qb.where('passport.issuedBy = :actorId', { actorId: actor.id });
          if (miner) qb.orWhere('passport.minerId = :minerId', { minerId: miner.id });
        }),
      );
    }
    if (filters.minerId) query.andWhere('passport.minerId = :minerIdFilter', { minerIdFilter: filters.minerId });
    if (filters.listingId) query.andWhere('passport.listingId = :listingId', { listingId: filters.listingId });
    if (filters.orderId) query.andWhere('passport.orderId = :orderId', { orderId: filters.orderId });
    this.applySearch(query, filters.q, [
      ['passport.passportNumber', 'number'],
      ['miner.companyName', 'miner'],
      ['listing.mineralType', 'mineral'],
      ['shipment.trackingId', 'tracking'],
      ['passport.id', 'id'],
    ]);
    const passports = await query.take(filters.limit).getMany();
    return passports.map((passport) => ({
      id: passport.id,
      label: passport.passportNumber,
      description: [passport.miner?.companyName, passport.listing?.mineralType, passport.shipment?.trackingId].filter(Boolean).join(' | '),
      badge: passport.status,
      metadata: {
        minerId: passport.minerId,
        minerName: passport.miner?.companyName,
        siteId: passport.siteId,
        licenseId: passport.licenseId,
        productionReportId: passport.productionReportId,
        labResultId: passport.labResultId,
        listingId: passport.listingId,
        orderId: passport.orderId,
        shipmentId: passport.shipmentId,
        passportNumber: passport.passportNumber,
      },
    }));
  }

  private async searchLogisticsProviders(filters: LookupFilters) {
    const query = this.providerRepository.createQueryBuilder('provider').orderBy('provider.companyName', 'ASC');
    this.applySearch(query, filters.q, [
      ['provider.companyName', 'company'],
      ['provider.contactEmail', 'email'],
      ['provider.contactPhone', 'phone'],
      ['provider.id', 'id'],
    ]);
    const providers = await query.take(filters.limit).getMany();
    return providers.map((provider) => ({
      id: provider.id,
      label: provider.companyName,
      description: [provider.category, provider.serviceAreas?.join(', ')].filter(Boolean).join(' | '),
      badge: provider.status,
      metadata: {
        userId: provider.userId,
        category: provider.category,
        serviceAreas: provider.serviceAreas,
        capabilities: provider.capabilities,
        contactEmail: provider.contactEmail,
        contactPhone: provider.contactPhone,
      },
    }));
  }

  private async searchShipments(actor: Actor, filters: LookupFilters) {
    const query = this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.provider', 'provider')
      .leftJoinAndSelect('shipment.order', 'order')
      .leftJoinAndSelect('order.listing', 'listing')
      .orderBy('shipment.updatedAt', 'DESC');
    if (!this.isReviewer(actor)) {
      query.where('(order.buyerId = :actorId OR order.sellerId = :actorId OR provider.userId = :actorId)', { actorId: actor.id });
    }
    if (filters.orderId) query.andWhere('shipment.orderId = :orderId', { orderId: filters.orderId });
    this.applySearch(query, filters.q, [
      ['shipment.trackingId', 'tracking'],
      ['provider.companyName', 'provider'],
      ['listing.mineralType', 'mineral'],
      ['shipment.pickupLocation', 'pickup'],
      ['shipment.deliveryLocation', 'delivery'],
      ['shipment.id', 'id'],
    ]);
    const shipments = await query.take(filters.limit).getMany();
    return shipments.map((shipment) => ({
      id: shipment.id,
      label: shipment.trackingId,
      description: [shipment.provider?.companyName, shipment.pickupLocation, shipment.deliveryLocation].filter(Boolean).join(' | '),
      badge: shipment.status,
      metadata: {
        orderId: shipment.orderId,
        providerId: shipment.providerId,
        providerName: shipment.provider?.companyName,
        mineralPassportId: shipment.mineralPassportId,
        pickupLocation: shipment.pickupLocation,
        deliveryLocation: shipment.deliveryLocation,
        currency: shipment.currency,
        quoteAmount: shipment.quoteAmount ? Number(shipment.quoteAmount) : null,
        trackingId: shipment.trackingId,
      },
    }));
  }

  private async searchDocuments(actor: Actor, filters: LookupFilters) {
    const query = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.user', 'user')
      .leftJoinAndSelect('document.listing', 'listing')
      .orderBy('document.createdAt', 'DESC');
    if (!this.isReviewer(actor)) query.where('document.userId = :actorId', { actorId: actor.id });
    if (filters.listingId) query.andWhere('document.listingId = :listingId', { listingId: filters.listingId });
    this.applySearch(query, filters.q, [
      ['document.fileName', 'file'],
      ['document.type', 'type'],
      ['user.email', 'email'],
      ['listing.mineralType', 'mineral'],
      ['document.id', 'id'],
    ]);
    const documents = await query.take(filters.limit).getMany();
    return documents.map((document) => ({
      id: document.id,
      label: document.fileName,
      description: [document.type, document.user?.email, document.listing?.mineralType].filter(Boolean).join(' | '),
      badge: document.reviewStatus,
      metadata: {
        userId: document.userId,
        listingId: document.listingId,
        type: document.type,
        fileUrl: document.fileUrl,
        reviewStatus: document.reviewStatus,
      },
    }));
  }

  private isReviewer(actor: Actor) {
    return actor.role === UserRole.ADMIN || actor.role === UserRole.GOVERNMENT;
  }

  private async getActorMiner(userId: string) {
    return this.minerRepository.findOne({ where: { userId } });
  }

  private async applyMineSiteAccess(
    query: SelectQueryBuilder<MineSite>,
    actor: Actor,
    alias: string,
  ) {
    if (this.isReviewer(actor)) return;
    const miner = await this.getActorMiner(actor.id);
    query.where(`${alias}.operatorId = :actorMinerId`, { actorMinerId: miner?.id || '' });
  }

  private applySearch<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    q: string,
    fields: Array<[string, string]>,
  ) {
    if (!q) return;
    query.andWhere(
      new Brackets((qb) => {
        fields.forEach(([field, key], index) => {
          const clause = `${field}::text ILIKE :${key}LookupQ`;
          const params = { [`${key}LookupQ`]: `%${q}%` };
          if (index === 0) qb.where(clause, params);
          else qb.orWhere(clause, params);
        });
      }),
    );
  }
}
