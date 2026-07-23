import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import {
  InvestorOpportunity,
  InvestorOpportunityInquiry,
  InvestorOpportunityStatus,
  MineSite,
  UserRole,
} from '../entities';
import { paginate } from '../common/dto/pagination.dto';
import {
  CreateInvestorOpportunityDto,
  CreateInvestorOpportunityInquiryDto,
  InvestorOpportunityFilterDto,
  UpdateInvestorOpportunityDto,
  UpdateInvestorOpportunityInquiryDto,
} from './investor-opportunities.dto';

interface Actor {
  id: string;
  role: UserRole;
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
  ) {}

  async create(actor: Actor, dto: CreateInvestorOpportunityDto) {
    this.assertCanPublish(actor);
    if (dto.siteId) await this.assertSiteAccess(actor, dto.siteId);

    const status = dto.status || InvestorOpportunityStatus.DRAFT;
    const opportunity = this.opportunityRepository.create({
      ...dto,
      sponsorId: actor.id,
      status,
      publishedAt: status === InvestorOpportunityStatus.PUBLISHED ? new Date() : null,
    });
    const saved = await this.opportunityRepository.save(opportunity);
    return this.findOne(actor, saved.id);
  }

  async findAll(actor: Actor, filters: InvestorOpportunityFilterDto) {
    const query = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.site', 'site')
      .leftJoinAndSelect('opportunity.sponsor', 'sponsor')
      .loadRelationCountAndMap('opportunity.inquiryCount', 'opportunity.inquiries')
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
      query.andWhere('opportunity.status = :status', { status: filters.status });
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

    const [data, total] = await query.skip(filters.offset).take(filters.limit).getManyAndCount();
    return paginate(data.map((opportunity) => this.toResponse(opportunity)), total, filters);
  }

  async findPublished(filters: InvestorOpportunityFilterDto) {
    const query = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.site', 'site')
      .leftJoinAndSelect('opportunity.sponsor', 'sponsor')
      .loadRelationCountAndMap('opportunity.inquiryCount', 'opportunity.inquiries')
      .where('opportunity.status = :published', {
        published: InvestorOpportunityStatus.PUBLISHED,
      })
      .orderBy('opportunity.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('opportunity.createdAt', 'DESC');

    this.applyFilters(query, filters);

    const [data, total] = await query.skip(filters.offset).take(filters.limit).getManyAndCount();
    return paginate(data.map((opportunity) => this.toResponse(opportunity)), total, filters);
  }

  async findOne(actor: Actor, id: string) {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
      relations: ['site', 'sponsor', 'inquiries', 'inquiries.investor'],
    });
    if (!opportunity) throw new NotFoundException('Investor opportunity not found');
    this.assertCanRead(actor, opportunity);
    return this.toResponse(opportunity, this.canSeeInquiries(actor, opportunity));
  }

  async update(actor: Actor, id: string, dto: UpdateInvestorOpportunityDto) {
    const opportunity = await this.opportunityRepository.findOne({ where: { id }, relations: ['site'] });
    if (!opportunity) throw new NotFoundException('Investor opportunity not found');
    this.assertCanManage(actor, opportunity);
    if (dto.siteId) await this.assertSiteAccess(actor, dto.siteId);

    const previousStatus = opportunity.status;
    Object.assign(opportunity, dto);
    if (
      previousStatus !== InvestorOpportunityStatus.PUBLISHED &&
      opportunity.status === InvestorOpportunityStatus.PUBLISHED
    ) {
      opportunity.publishedAt = new Date();
    }
    const saved = await this.opportunityRepository.save(opportunity);
    return this.findOne(actor, saved.id);
  }

  async createInquiry(actor: Actor, id: string, dto: CreateInvestorOpportunityInquiryDto) {
    const opportunity = await this.opportunityRepository.findOne({ where: { id } });
    if (!opportunity) throw new NotFoundException('Investor opportunity not found');
    if (opportunity.status !== InvestorOpportunityStatus.PUBLISHED && !this.isManager(actor)) {
      throw new ForbiddenException('Inquiries can only be submitted on published opportunities');
    }
    if (actor.role !== UserRole.INVESTOR && !this.isManager(actor)) {
      throw new ForbiddenException('Only investors can submit opportunity inquiries');
    }

    const inquiry = this.inquiryRepository.create({
      ...dto,
      opportunityId: id,
      investorId: actor.id,
    });
    return this.inquiryRepository.save(inquiry);
  }

  async updateInquiry(actor: Actor, id: string, dto: UpdateInvestorOpportunityInquiryDto) {
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
      throw new ForbiddenException('You can only publish opportunities for your own mine sites');
    }
    return site;
  }

  private assertCanPublish(actor: Actor) {
    if (this.isManager(actor) || actor.role === UserRole.MINER) return;
    throw new ForbiddenException('Only admins, regulators, and miners can publish opportunities');
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

  private applyFilters(query: SelectQueryBuilder<InvestorOpportunity>, filters: InvestorOpportunityFilterDto) {
    if (filters.mineral) {
      query.andWhere(':mineral = ANY(opportunity.mineralFocus)', {
        mineral: filters.mineral,
      });
    }
    if (filters.location) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('site.state ILIKE :location', { location: `%${filters.location}%` })
            .orWhere('site.lga ILIKE :location', { location: `%${filters.location}%` })
            .orWhere('site.community ILIKE :location', { location: `%${filters.location}%` });
        }),
      );
    }
    if (filters.riskRating) query.andWhere('opportunity.riskRating = :riskRating', { riskRating: filters.riskRating });
    if (filters.stage) query.andWhere('opportunity.stage = :stage', { stage: filters.stage });
    if (filters.licenseStatus) query.andWhere('opportunity.licenseStatus ILIKE :licenseStatus', { licenseStatus: `%${filters.licenseStatus}%` });
    if (filters.minCapital !== undefined) query.andWhere('opportunity.capitalRequired >= :minCapital', { minCapital: filters.minCapital });
    if (filters.maxCapital !== undefined) query.andWhere('opportunity.capitalRequired <= :maxCapital', { maxCapital: filters.maxCapital });
  }

  private toResponse(opportunity: InvestorOpportunity, includeInquiries = false) {
    const inquiryCount = Number((opportunity as any).inquiryCount || opportunity.inquiries?.length || 0);
    return {
      ...opportunity,
      inquiryCount,
      sponsor: opportunity.sponsor
        ? { id: opportunity.sponsor.id, name: opportunity.sponsor.name, email: opportunity.sponsor.email }
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
      inquiries: includeInquiries
        ? opportunity.inquiries?.map((inquiry) => ({
            id: inquiry.id,
            investorId: inquiry.investorId,
            investor: inquiry.investor
              ? { id: inquiry.investor.id, name: inquiry.investor.name, email: inquiry.investor.email }
              : null,
            message: inquiry.message,
            investmentRange: inquiry.investmentRange,
            contactPreference: inquiry.contactPreference,
            dueDiligenceConsent: inquiry.dueDiligenceConsent,
            analyticsSubscriptionInterest: inquiry.analyticsSubscriptionInterest,
            status: inquiry.status,
            notes: inquiry.notes,
            createdAt: inquiry.createdAt,
          }))
        : undefined,
    };
  }
}
