import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import {
  AmlKybReviewStatus,
  AmlKybRiskProfile,
  AmlKybRiskTier,
  InvestorOpportunity,
  InvestorOpportunityInquiry,
  InvestorOpportunityReviewStatus,
  InvestorOpportunityRiskRating,
  InvestorOpportunityStatus,
  MineSite,
  UserRole,
  EsgObligation,
  EsgObligationStatus,
  ExportReadinessChecklist,
  ExportReadinessStatus,
  LabResult,
  LabResultStatus,
  License,
  LicenseStatus,
  ProductionReport,
  ProductionReportStatus,
  Shipment,
  ShipmentStatus,
} from '../entities';
import { paginate } from '../common/dto/pagination.dto';
import {
  CreateInvestorOpportunityDto,
  CreateInvestorOpportunityInquiryDto,
  InvestorOpportunityFilterDto,
  ReviewInvestorOpportunityDto,
  UpdateInvestorOpportunityDto,
  UpdateInvestorOpportunityInquiryDto,
} from './investor-opportunities.dto';

interface Actor {
  id: string;
  role: UserRole;
}

export interface EsgOpportunitySummary {
  total: number;
  approved: number;
  fulfilled: number;
  actionRequired: number;
  overdue: number;
  dueSoonOrOverdue: number;
  types: string[];
}

@Injectable()
export class InvestorOpportunitiesService {
  constructor(
    @InjectRepository(InvestorOpportunity)
    private readonly opportunityRepository: Repository<InvestorOpportunity>,
    @InjectRepository(InvestorOpportunityInquiry)
    private readonly inquiryRepository: Repository<InvestorOpportunityInquiry>,
    @InjectRepository(MineSite)
    private readonly siteRepository: Repository<MineSite>,
    @InjectRepository(EsgObligation)
    private readonly esgObligationRepository: Repository<EsgObligation>,
    @InjectRepository(AmlKybRiskProfile)
    private readonly amlKybRiskProfileRepository: Repository<AmlKybRiskProfile>,
    @InjectRepository(ExportReadinessChecklist)
    private readonly exportReadinessRepository: Repository<ExportReadinessChecklist>,
    @InjectRepository(LabResult)
    private readonly labResultRepository: Repository<LabResult>,
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    @InjectRepository(ProductionReport)
    private readonly productionReportRepository: Repository<ProductionReport>,
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
  ) {}

  async create(actor: Actor, dto: CreateInvestorOpportunityDto) {
    this.assertCanPublish(actor);
    if (dto.siteId) await this.assertSiteAccess(actor, dto.siteId);

    const status = dto.status || InvestorOpportunityStatus.DRAFT;
    this.assertCanSetPublicationStatus(actor, status, null);
    const opportunity = this.opportunityRepository.create({
      ...dto,
      sponsorId: actor.id,
      status,
      dueDiligenceReviewStatus: this.isManager(actor)
        ? InvestorOpportunityReviewStatus.APPROVED
        : InvestorOpportunityReviewStatus.PENDING_REVIEW,
      publishedAt:
        status === InvestorOpportunityStatus.PUBLISHED ? new Date() : null,
    });
    const saved = await this.opportunityRepository.save(opportunity);
    await this.refreshOpportunityRiskSnapshot(saved.id);
    return this.findOne(actor, saved.id);
  }

  async findAll(actor: Actor, filters: InvestorOpportunityFilterDto) {
    const query = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.site', 'site')
      .leftJoinAndSelect('opportunity.sponsor', 'sponsor')
      .loadRelationCountAndMap(
        'opportunity.inquiryCount',
        'opportunity.inquiries',
      )
      .orderBy('opportunity.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('opportunity.createdAt', 'DESC');

    if (!this.isManager(actor)) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('opportunity.status = :published', {
            published: InvestorOpportunityStatus.PUBLISHED,
          }).orWhere('opportunity.sponsorId = :userId', { userId: actor.id });
        }),
      );
    } else if (filters.status) {
      query.andWhere('opportunity.status = :status', {
        status: filters.status,
      });
    }

    if (actor.role === UserRole.MINER) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('opportunity.status = :published', {
            published: InvestorOpportunityStatus.PUBLISHED,
          }).orWhere('opportunity.sponsorId = :userId', { userId: actor.id });
        }),
      );
    }

    this.applyFilters(query, filters);

    const [data, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();
    const summaries = await this.getEsgSummaries(data);
    return paginate(
      data.map((opportunity) =>
        this.toResponse(
          opportunity,
          false,
          summaries.get(opportunity.siteId || ''),
        ),
      ),
      total,
      filters,
    );
  }

  async findPublished(filters: InvestorOpportunityFilterDto) {
    const query = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.site', 'site')
      .leftJoinAndSelect('opportunity.sponsor', 'sponsor')
      .loadRelationCountAndMap(
        'opportunity.inquiryCount',
        'opportunity.inquiries',
      )
      .where('opportunity.status = :published', {
        published: InvestorOpportunityStatus.PUBLISHED,
      })
      .orderBy('opportunity.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('opportunity.createdAt', 'DESC');

    this.applyFilters(query, filters);

    const [data, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();
    const summaries = await this.getEsgSummaries(data);
    return paginate(
      data.map((opportunity) =>
        this.toResponse(
          opportunity,
          false,
          summaries.get(opportunity.siteId || ''),
        ),
      ),
      total,
      filters,
    );
  }

  async findOne(actor: Actor, id: string) {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
      relations: [
        'site',
        'sponsor',
        'dueDiligenceReviewer',
        'inquiries',
        'inquiries.investor',
      ],
    });
    if (!opportunity)
      throw new NotFoundException('Investor opportunity not found');
    this.assertCanRead(actor, opportunity);
    const summaries = await this.getEsgSummaries([opportunity]);
    return this.toResponse(
      opportunity,
      this.canSeeInquiries(actor, opportunity),
      summaries.get(opportunity.siteId || ''),
    );
  }

  async update(actor: Actor, id: string, dto: UpdateInvestorOpportunityDto) {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
      relations: ['site'],
    });
    if (!opportunity)
      throw new NotFoundException('Investor opportunity not found');
    this.assertCanManage(actor, opportunity);
    if (dto.siteId) await this.assertSiteAccess(actor, dto.siteId);
    if (dto.status) {
      this.assertCanSetPublicationStatus(actor, dto.status, opportunity);
    }

    const previousStatus = opportunity.status;
    Object.assign(opportunity, dto);
    if (
      previousStatus !== InvestorOpportunityStatus.PUBLISHED &&
      opportunity.status === InvestorOpportunityStatus.PUBLISHED
    ) {
      opportunity.publishedAt = new Date();
    }
    const saved = await this.opportunityRepository.save(opportunity);
    await this.refreshOpportunityRiskSnapshot(saved.id);
    return this.findOne(actor, saved.id);
  }

  async review(actor: Actor, id: string, dto: ReviewInvestorOpportunityDto) {
    if (!this.isManager(actor)) {
      throw new ForbiddenException(
        'Only admins or government users can review investor opportunities',
      );
    }
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
      relations: ['site', 'sponsor'],
    });
    if (!opportunity)
      throw new NotFoundException('Investor opportunity not found');

    const snapshot = await this.buildOpportunityRiskSnapshot(opportunity);
    opportunity.dueDiligenceReviewStatus = dto.reviewStatus;
    opportunity.dueDiligenceReviewNotes = dto.reviewNotes || null;
    opportunity.dueDiligenceReviewedBy = actor.id;
    opportunity.dueDiligenceReviewedAt = new Date();
    opportunity.riskScore = dto.riskScore ?? snapshot.riskScore;
    opportunity.riskScoreBreakdown = snapshot.riskScoreBreakdown;
    opportunity.riskIndicators = dto.riskIndicators || snapshot.riskIndicators;
    opportunity.dueDiligenceSummary =
      dto.dueDiligenceSummary || snapshot.dueDiligenceSummary;
    if (
      opportunity.status === InvestorOpportunityStatus.PUBLISHED &&
      dto.reviewStatus !== InvestorOpportunityReviewStatus.APPROVED
    ) {
      opportunity.status = InvestorOpportunityStatus.DRAFT;
      opportunity.publishedAt = null;
    }

    const saved = await this.opportunityRepository.save(opportunity);
    return this.findOne(actor, saved.id);
  }

  async createInquiry(
    actor: Actor,
    id: string,
    dto: CreateInvestorOpportunityInquiryDto,
  ) {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
    });
    if (!opportunity)
      throw new NotFoundException('Investor opportunity not found');
    if (
      opportunity.status !== InvestorOpportunityStatus.PUBLISHED &&
      !this.isManager(actor)
    ) {
      throw new ForbiddenException(
        'Inquiries can only be submitted on published opportunities',
      );
    }
    if (actor.role !== UserRole.INVESTOR && !this.isManager(actor)) {
      throw new ForbiddenException(
        'Only investors can submit opportunity inquiries',
      );
    }

    const inquiry = this.inquiryRepository.create({
      ...dto,
      opportunityId: id,
      investorId: actor.id,
    });
    return this.inquiryRepository.save(inquiry);
  }

  async updateInquiry(
    actor: Actor,
    id: string,
    dto: UpdateInvestorOpportunityInquiryDto,
  ) {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id },
      relations: ['opportunity'],
    });
    if (!inquiry) throw new NotFoundException('Investor inquiry not found');
    if (!this.isManager(actor) && inquiry.opportunity.sponsorId !== actor.id) {
      throw new ForbiddenException('You cannot update this investor inquiry');
    }
    Object.assign(inquiry, dto);
    return this.inquiryRepository.save(inquiry);
  }

  private async assertSiteAccess(actor: Actor, siteId: string) {
    const site = await this.siteRepository.findOne({
      where: { id: siteId },
      relations: ['operator'],
    });
    if (!site) throw new NotFoundException('Mine site not found');
    if (this.isManager(actor)) return site;
    if (actor.role !== UserRole.MINER || site.operator?.userId !== actor.id) {
      throw new ForbiddenException(
        'You can only publish opportunities for your own mine sites',
      );
    }
    return site;
  }

  private assertCanPublish(actor: Actor) {
    if (this.isManager(actor) || actor.role === UserRole.MINER) return;
    throw new ForbiddenException(
      'Only admins, regulators, and miners can publish opportunities',
    );
  }

  private assertCanRead(actor: Actor, opportunity: InvestorOpportunity) {
    if (opportunity.status === InvestorOpportunityStatus.PUBLISHED) return;
    this.assertCanManage(actor, opportunity);
  }

  private assertCanManage(actor: Actor, opportunity: InvestorOpportunity) {
    if (this.isManager(actor) || opportunity.sponsorId === actor.id) return;
    throw new ForbiddenException('You cannot manage this opportunity');
  }

  private canSeeInquiries(actor: Actor, opportunity: InvestorOpportunity) {
    return this.isManager(actor) || opportunity.sponsorId === actor.id;
  }

  private isManager(actor: Actor) {
    return actor.role === UserRole.ADMIN || actor.role === UserRole.GOVERNMENT;
  }

  private assertCanSetPublicationStatus(
    actor: Actor,
    status: InvestorOpportunityStatus,
    opportunity: InvestorOpportunity | null,
  ) {
    if (status !== InvestorOpportunityStatus.PUBLISHED) return;
    if (
      opportunity?.dueDiligenceReviewStatus ===
      InvestorOpportunityReviewStatus.APPROVED
    ) {
      return;
    }
    if (!opportunity && this.isManager(actor)) return;
    throw new ForbiddenException(
      'Investor opportunities require approved due diligence review before publication',
    );
  }

  private applyFilters(
    query: SelectQueryBuilder<InvestorOpportunity>,
    filters: InvestorOpportunityFilterDto,
  ) {
    if (filters.mineral) {
      query.andWhere(':mineral = ANY(opportunity.mineralFocus)', {
        mineral: filters.mineral,
      });
    }
    if (filters.location) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('site.state ILIKE :location', {
            location: `%${filters.location}%`,
          })
            .orWhere('site.lga ILIKE :location', {
              location: `%${filters.location}%`,
            })
            .orWhere('site.community ILIKE :location', {
              location: `%${filters.location}%`,
            });
        }),
      );
    }
    if (filters.riskRating)
      query.andWhere('opportunity.riskRating = :riskRating', {
        riskRating: filters.riskRating,
      });
    if (filters.stage)
      query.andWhere('opportunity.stage = :stage', { stage: filters.stage });
    if (filters.licenseStatus)
      query.andWhere('opportunity.licenseStatus ILIKE :licenseStatus', {
        licenseStatus: `%${filters.licenseStatus}%`,
      });
    if (filters.minCapital !== undefined)
      query.andWhere('opportunity.capitalRequired >= :minCapital', {
        minCapital: filters.minCapital,
      });
    if (filters.maxCapital !== undefined)
      query.andWhere('opportunity.capitalRequired <= :maxCapital', {
        maxCapital: filters.maxCapital,
      });
  }

  private async refreshOpportunityRiskSnapshot(id: string) {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
      relations: ['site', 'sponsor'],
    });
    if (!opportunity) return;
    const snapshot = await this.buildOpportunityRiskSnapshot(opportunity);
    opportunity.riskScore = snapshot.riskScore;
    opportunity.riskScoreBreakdown = snapshot.riskScoreBreakdown;
    opportunity.dueDiligenceSummary =
      opportunity.dueDiligenceSummary || snapshot.dueDiligenceSummary;
    opportunity.riskIndicators = Array.from(
      new Set([
        ...(opportunity.riskIndicators || []),
        ...snapshot.riskIndicators,
      ]),
    );
    await this.opportunityRepository.save(opportunity);
  }

  private async buildOpportunityRiskSnapshot(opportunity: InvestorOpportunity) {
    const deductions: Record<string, number> = {};
    const positives: string[] = [];
    const indicators = new Set(opportunity.riskIndicators || []);
    const siteId = opportunity.siteId || undefined;

    const approvedLicenseCount = await this.licenseRepository.count({
      where: siteId
        ? { siteId, status: LicenseStatus.APPROVED }
        : {
            holderUserId: opportunity.sponsorId,
            status: LicenseStatus.APPROVED,
          },
    });
    if (approvedLicenseCount === 0) {
      deductions.license = 20;
      indicators.add('missing_approved_license');
    } else {
      positives.push('approved_license');
    }

    if (!siteId) {
      deductions.site = 10;
      indicators.add('missing_site_link');
    } else if (
      opportunity.site?.riskLevel === 'high' ||
      opportunity.site?.riskLevel === 'critical'
    ) {
      deductions.site = 12;
      indicators.add('high_risk_site');
    } else {
      positives.push('site_linked');
    }

    const approvedProductionCount = siteId
      ? await this.productionReportRepository.count({
          where: { siteId, status: ProductionReportStatus.APPROVED },
        })
      : 0;
    if (approvedProductionCount === 0) {
      deductions.production = 12;
      indicators.add('missing_approved_production_history');
    } else {
      positives.push('approved_production_history');
    }

    const verifiedLabCount = siteId
      ? await this.labResultRepository
          .createQueryBuilder('lab')
          .innerJoin('lab.productionReport', 'productionReport')
          .where('productionReport.siteId = :siteId', { siteId })
          .andWhere('lab.status = :status', {
            status: LabResultStatus.VERIFIED,
          })
          .getCount()
      : 0;
    if (verifiedLabCount === 0) {
      deductions.labEvidence = 12;
      indicators.add('missing_verified_lab_evidence');
    } else {
      positives.push('verified_lab_evidence');
    }

    const esgSummary = await this.getEsgSummaries([opportunity]);
    const esg = esgSummary.get(siteId || '');
    if (!esg || esg.total === 0) {
      deductions.esg = 10;
      indicators.add('missing_esg_obligations');
    } else if (esg.actionRequired + esg.overdue > 0) {
      deductions.esg = 15;
      indicators.add('open_esg_obligations');
    } else {
      positives.push('esg_tracked');
    }

    const readyExportCount = await this.exportReadinessRepository.count({
      where: {
        exporterUserId: opportunity.sponsorId,
        readinessStatus: ExportReadinessStatus.READY,
      },
    });
    const deliveredShipmentCount = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .innerJoin('shipment.order', 'order')
      .where('order.sellerId = :sellerId', { sellerId: opportunity.sponsorId })
      .andWhere('shipment.status = :status', {
        status: ShipmentStatus.DELIVERED,
      })
      .getCount();
    if (readyExportCount === 0 && deliveredShipmentCount === 0) {
      deductions.logistics = 8;
      indicators.add('missing_logistics_or_export_readiness');
    } else {
      positives.push('logistics_or_export_ready');
    }

    const amlProfile = await this.amlKybRiskProfileRepository.findOne({
      where: { userId: opportunity.sponsorId },
      order: { updatedAt: 'DESC' },
    });
    if (!amlProfile) {
      deductions.amlKyb = 12;
      indicators.add('missing_aml_kyb_profile');
    } else if (
      [AmlKybRiskTier.HIGH, AmlKybRiskTier.CRITICAL].includes(
        amlProfile.riskTier,
      ) ||
      [
        AmlKybReviewStatus.ACTION_REQUIRED,
        AmlKybReviewStatus.SUSPICIOUS,
        AmlKybReviewStatus.ESCALATED,
      ].includes(amlProfile.reviewStatus)
    ) {
      deductions.amlKyb =
        amlProfile.riskTier === AmlKybRiskTier.CRITICAL ? 20 : 14;
      amlProfile.riskIndicators.forEach((indicator) =>
        indicators.add(indicator),
      );
    } else {
      positives.push('aml_kyb_reviewed');
    }

    if (
      opportunity.riskIndicators?.some((indicator) =>
        /security|conflict|unsafe|illegal/i.test(indicator),
      )
    ) {
      deductions.security = 10;
      indicators.add('security_risk_flag');
    }

    const totalDeduction = Object.values(deductions).reduce(
      (sum, deduction) => sum + deduction,
      0,
    );
    const riskScore = Math.max(0, Math.min(100, 100 - totalDeduction));

    return {
      riskScore,
      riskScoreBreakdown: {
        base: 100,
        deductions,
        positives,
        totalDeduction,
      },
      riskIndicators: Array.from(indicators),
      dueDiligenceSummary: {
        license: {
          approvedCount: approvedLicenseCount,
          status: approvedLicenseCount > 0 ? 'verified' : 'missing',
        },
        site: {
          linked: Boolean(siteId),
          riskLevel: opportunity.site?.riskLevel || null,
          siteStatus: opportunity.site?.siteStatus || null,
        },
        production: { approvedReports: approvedProductionCount },
        labEvidence: { verifiedResults: verifiedLabCount },
        esg: esg || {
          total: 0,
          approved: 0,
          fulfilled: 0,
          actionRequired: 0,
          overdue: 0,
          dueSoonOrOverdue: 0,
          types: [],
        },
        logistics: {
          readyExportChecklists: readyExportCount,
          deliveredShipments: deliveredShipmentCount,
        },
        amlKyb: amlProfile
          ? {
              riskTier: amlProfile.riskTier,
              reviewStatus: amlProfile.reviewStatus,
              suspiciousActivityStatus: amlProfile.suspiciousActivityStatus,
            }
          : null,
      },
    };
  }

  private async getEsgSummaries(
    opportunities: InvestorOpportunity[],
  ): Promise<Map<string, EsgOpportunitySummary>> {
    const siteIds = opportunities
      .map((opportunity) => opportunity.siteId)
      .filter((siteId): siteId is string => Boolean(siteId));
    if (siteIds.length === 0) return new Map<string, EsgOpportunitySummary>();

    const obligations = await this.esgObligationRepository
      .createQueryBuilder('obligation')
      .where('obligation.siteId IN (:...siteIds)', { siteIds })
      .getMany();

    const bySite = new Map<string, EsgObligation[]>();
    obligations.forEach((obligation) => {
      if (!obligation.siteId) return;
      bySite.set(obligation.siteId, [
        ...(bySite.get(obligation.siteId) || []),
        obligation,
      ]);
    });

    const summaries = new Map<string, EsgOpportunitySummary>();
    bySite.forEach((items, siteId) => {
      summaries.set(siteId, this.buildEsgSummary(items));
    });
    return summaries;
  }

  private buildEsgSummary(obligations: EsgObligation[]): EsgOpportunitySummary {
    const unresolvedStatuses = new Set([
      EsgObligationStatus.MISSING,
      EsgObligationStatus.DRAFT,
      EsgObligationStatus.SUBMITTED,
      EsgObligationStatus.ACTION_REQUIRED,
      EsgObligationStatus.OVERDUE,
    ]);
    const dueSoonOrOverdue = obligations.filter((obligation) => {
      if (!obligation.dueDate) return false;
      const days = Math.ceil(
        (new Date(obligation.dueDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return days <= 30 && unresolvedStatuses.has(obligation.status);
    });

    return {
      total: obligations.length,
      approved: obligations.filter(
        (obligation) => obligation.status === EsgObligationStatus.APPROVED,
      ).length,
      fulfilled: obligations.filter(
        (obligation) => obligation.status === EsgObligationStatus.FULFILLED,
      ).length,
      actionRequired: obligations.filter(
        (obligation) =>
          obligation.status === EsgObligationStatus.ACTION_REQUIRED,
      ).length,
      overdue: obligations.filter(
        (obligation) => obligation.status === EsgObligationStatus.OVERDUE,
      ).length,
      dueSoonOrOverdue: dueSoonOrOverdue.length,
      types: Array.from(
        new Set(obligations.map((obligation) => obligation.obligationType)),
      ),
    };
  }

  private toResponse(
    opportunity: InvestorOpportunity,
    includeInquiries = false,
    esgSummary?: EsgOpportunitySummary,
  ) {
    const inquiryCount = Number(
      (opportunity as any).inquiryCount || opportunity.inquiries?.length || 0,
    );
    return {
      ...opportunity,
      inquiryCount,
      sponsor: opportunity.sponsor
        ? {
            id: opportunity.sponsor.id,
            name: opportunity.sponsor.name,
            email: opportunity.sponsor.email,
          }
        : undefined,
      site: opportunity.site
        ? {
            id: opportunity.site.id,
            name: opportunity.site.name,
            state: opportunity.site.state,
            lga: opportunity.site.lga || null,
            community: opportunity.site.community || null,
            riskLevel: opportunity.site.riskLevel,
            siteStatus: opportunity.site.siteStatus,
          }
        : null,
      esgSummary: esgSummary || {
        total: 0,
        approved: 0,
        fulfilled: 0,
        actionRequired: 0,
        overdue: 0,
        dueSoonOrOverdue: 0,
        types: [],
      },
      inquiries: includeInquiries
        ? opportunity.inquiries?.map((inquiry) => ({
            id: inquiry.id,
            investorId: inquiry.investorId,
            investor: inquiry.investor
              ? {
                  id: inquiry.investor.id,
                  name: inquiry.investor.name,
                  email: inquiry.investor.email,
                }
              : null,
            message: inquiry.message,
            investmentRange: inquiry.investmentRange,
            contactPreference: inquiry.contactPreference,
            dueDiligenceConsent: inquiry.dueDiligenceConsent,
            analyticsSubscriptionInterest:
              inquiry.analyticsSubscriptionInterest,
            status: inquiry.status,
            notes: inquiry.notes,
            createdAt: inquiry.createdAt,
          }))
        : undefined,
    };
  }
}
