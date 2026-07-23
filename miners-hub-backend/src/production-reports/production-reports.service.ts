import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { paginate } from '../common/dto/pagination.dto';
import { MineSite } from '../entities/mine-site.entity';
import { Miner } from '../entities/miner.entity';
import {
  ProductionReport,
  ProductionReportStatus,
} from '../entities/production-report.entity';
import { UserRole } from '../entities/user.entity';
import {
  CreateProductionReportDto,
  ProductionReportFilterDto,
  ReviewProductionReportDto,
  UpdateProductionReportDto,
} from './production-reports.dto';

type Actor = {
  id: string;
  role: UserRole;
};

@Injectable()
export class ProductionReportsService {
  constructor(
    @InjectRepository(ProductionReport)
    private readonly reportRepository: Repository<ProductionReport>,
    @InjectRepository(MineSite)
    private readonly siteRepository: Repository<MineSite>,
    @InjectRepository(Miner)
    private readonly minerRepository: Repository<Miner>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(actor: Actor, dto: CreateProductionReportDto) {
    const site = await this.resolveSiteForWrite(actor, dto.siteId);
    const minerId = this.isReviewer(actor) && dto.minerId ? dto.minerId : site.operatorId;
    await this.assertMinerExists(minerId);

    const status = dto.status || ProductionReportStatus.SUBMITTED;
    const report = this.reportRepository.create({
      siteId: site.id,
      minerId,
      mineralType: dto.mineralType,
      periodStart: dto.periodStart,
      periodEnd: dto.periodEnd,
      quantity: dto.quantity,
      unit: dto.unit,
      grade: dto.grade || null,
      destination: dto.destination || null,
      estimatedValue: dto.estimatedValue ?? null,
      royaltyRate: dto.royaltyRate ?? 3,
      royaltyDue: this.calculateRoyalty(dto.estimatedValue, dto.royaltyRate ?? 3),
      supportingDocumentIds: dto.supportingDocumentIds || [],
      status,
      submittedAt:
        status === ProductionReportStatus.DRAFT ? null : new Date(),
      metadata: dto.metadata || null,
    });

    const saved = await this.reportRepository.save(report);
    await this.linkReportToSite(site, saved.id);
    this.auditLogService.log({
      userId: actor.id,
      action: 'production_report.submit',
      resource: 'production_report',
      resourceId: saved.id,
      metadata: { siteId: saved.siteId, minerId: saved.minerId, status: saved.status },
    });
    return this.findOne(actor, saved.id);
  }

  async findAll(actor: Actor, filters: ProductionReportFilterDto) {
    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.site', 'site')
      .leftJoinAndSelect('site.operator', 'siteOperator')
      .leftJoinAndSelect('report.miner', 'miner')
      .leftJoinAndSelect('miner.user', 'minerUser')
      .leftJoinAndSelect('report.reviewer', 'reviewer')
      .orderBy('report.periodEnd', 'DESC');

    if (!this.isReviewer(actor)) {
      const miner = await this.getActorMiner(actor.id);
      query.where('report.minerId = :minerId', { minerId: miner.id });
    }

    if (filters.status) {
      query.andWhere('report.status = :status', { status: filters.status });
    }
    if (filters.siteId) {
      query.andWhere('report.siteId = :siteId', { siteId: filters.siteId });
    }
    if (filters.minerId && this.isReviewer(actor)) {
      query.andWhere('report.minerId = :minerIdFilter', {
        minerIdFilter: filters.minerId,
      });
    }
    if (filters.mineralType) {
      query.andWhere('report.mineralType ILIKE :mineralType', {
        mineralType: `%${filters.mineralType}%`,
      });
    }
    if (filters.periodStart) {
      query.andWhere('report.periodStart >= :periodStart', {
        periodStart: filters.periodStart,
      });
    }
    if (filters.periodEnd) {
      query.andWhere('report.periodEnd <= :periodEnd', {
        periodEnd: filters.periodEnd,
      });
    }

    const [reports, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();

    return paginate(
      reports.map((report) => this.toResponse(report)),
      total,
      filters,
    );
  }

  async findOne(actor: Actor, id: string) {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['site', 'site.operator', 'miner', 'miner.user', 'reviewer'],
    });
    if (!report) throw new NotFoundException('Production report not found');
    await this.assertCanAccess(actor, report);
    return this.toResponse(report);
  }

  async update(actor: Actor, id: string, dto: UpdateProductionReportDto) {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['site', 'site.operator', 'miner'],
    });
    if (!report) throw new NotFoundException('Production report not found');
    await this.assertCanAccess(actor, report);

    if (!this.isReviewer(actor) && report.status === ProductionReportStatus.APPROVED) {
      throw new ForbiddenException('Approved production reports cannot be edited by miners');
    }

    if (dto.siteId && dto.siteId !== report.siteId) {
      const site = await this.resolveSiteForWrite(actor, dto.siteId);
      report.siteId = site.id;
      report.minerId = site.operatorId;
    }

    Object.assign(report, {
      mineralType: dto.mineralType ?? report.mineralType,
      periodStart: dto.periodStart ?? report.periodStart,
      periodEnd: dto.periodEnd ?? report.periodEnd,
      quantity: dto.quantity ?? report.quantity,
      unit: dto.unit ?? report.unit,
      grade: dto.grade !== undefined ? dto.grade : report.grade,
      destination:
        dto.destination !== undefined ? dto.destination : report.destination,
      estimatedValue:
        dto.estimatedValue !== undefined
          ? dto.estimatedValue
          : report.estimatedValue,
      royaltyRate: dto.royaltyRate ?? report.royaltyRate,
      supportingDocumentIds:
        dto.supportingDocumentIds ?? report.supportingDocumentIds,
      status: dto.status ?? (this.isReviewer(actor) ? report.status : ProductionReportStatus.SUBMITTED),
    });
    report.royaltyDue = this.calculateRoyalty(
      report.estimatedValue,
      Number(report.royaltyRate),
    );
    if (report.status !== ProductionReportStatus.DRAFT && !report.submittedAt) {
      report.submittedAt = new Date();
    }

    const saved = await this.reportRepository.save(report);
    this.auditLogService.log({
      userId: actor.id,
      action: 'production_report.update',
      resource: 'production_report',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto), status: saved.status },
    });
    return this.findOne(actor, saved.id);
  }

  async review(actor: Actor, id: string, dto: ReviewProductionReportDto) {
    if (!this.isReviewer(actor)) {
      throw new ForbiddenException('Only admins or government users can review production reports');
    }

    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Production report not found');

    report.status = dto.status;
    report.reviewNotes = dto.reviewNotes || null;
    report.reviewedBy = actor.id;
    report.reviewedAt = new Date();
    if (!report.submittedAt) report.submittedAt = new Date();

    const saved = await this.reportRepository.save(report);
    this.auditLogService.log({
      userId: actor.id,
      action: 'production_report.review',
      resource: 'production_report',
      resourceId: saved.id,
      metadata: { status: saved.status },
    });
    return this.findOne(actor, saved.id);
  }

  async analytics(actor: Actor) {
    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.site', 'site')
      .leftJoinAndSelect('report.miner', 'miner');

    if (!this.isReviewer(actor)) {
      const miner = await this.getActorMiner(actor.id);
      query.where('report.minerId = :minerId', { minerId: miner.id });
    }

    const reports = await query.getMany();
    const approved = reports.filter(
      (report) => report.status === ProductionReportStatus.APPROVED,
    );
    const submitted = reports.filter(
      (report) =>
        report.status === ProductionReportStatus.SUBMITTED ||
        report.status === ProductionReportStatus.UNDER_REVIEW,
    );
    const byMineral = reports.reduce<Record<string, { quantity: number; value: number; royalty: number }>>(
      (acc, report) => {
        const key = report.mineralType;
        acc[key] = acc[key] || { quantity: 0, value: 0, royalty: 0 };
        acc[key].quantity += Number(report.quantity || 0);
        acc[key].value += Number(report.estimatedValue || 0);
        acc[key].royalty += Number(report.royaltyDue || 0);
        return acc;
      },
      {},
    );

    return {
      totalReports: reports.length,
      approvedReports: approved.length,
      pendingReview: submitted.length,
      totalQuantity: reports.reduce((sum, report) => sum + Number(report.quantity || 0), 0),
      estimatedValue: reports.reduce((sum, report) => sum + Number(report.estimatedValue || 0), 0),
      royaltyDue: reports.reduce((sum, report) => sum + Number(report.royaltyDue || 0), 0),
      byMineral,
    };
  }

  private isReviewer(actor: Actor) {
    return actor.role === UserRole.ADMIN || actor.role === UserRole.GOVERNMENT;
  }

  private async resolveSiteForWrite(actor: Actor, siteId: string) {
    const site = await this.siteRepository.findOne({
      where: { id: siteId },
      relations: ['operator'],
    });
    if (!site) throw new NotFoundException('Mine site not found');

    if (!this.isReviewer(actor) && site.operator?.userId !== actor.id) {
      throw new ForbiddenException('You can only report production for your own mine sites');
    }
    return site;
  }

  private async assertMinerExists(minerId: string) {
    const exists = await this.minerRepository.exist({ where: { id: minerId } });
    if (!exists) throw new NotFoundException('Miner profile not found');
  }

  private async getActorMiner(userId: string) {
    const miner = await this.minerRepository.findOne({ where: { userId } });
    if (!miner) throw new ForbiddenException('Miner profile not found');
    return miner;
  }

  private async assertCanAccess(actor: Actor, report: ProductionReport) {
    if (this.isReviewer(actor)) return;
    const miner = await this.getActorMiner(actor.id);
    if (report.minerId !== miner.id) {
      throw new ForbiddenException('You can only access your own production reports');
    }
  }

  private calculateRoyalty(estimatedValue?: number | null, royaltyRate = 3) {
    if (estimatedValue === undefined || estimatedValue === null) return null;
    return Number(((Number(estimatedValue) * Number(royaltyRate)) / 100).toFixed(2));
  }

  private async linkReportToSite(site: MineSite, reportId: string) {
    const reportIds = new Set([...(site.productionReportIds || []), reportId]);
    site.productionReportIds = Array.from(reportIds);
    await this.siteRepository.save(site);
  }

  private toResponse(report: ProductionReport) {
    return {
      ...report,
      site: report.site
        ? {
            id: report.site.id,
            name: report.site.name,
            state: report.site.state,
            lga: report.site.lga || null,
            operatorId: report.site.operatorId,
          }
        : null,
      miner: report.miner
        ? {
            id: report.miner.id,
            companyName: report.miner.companyName,
            user: report.miner.user
              ? {
                  id: report.miner.user.id,
                  name: report.miner.user.name || null,
                  email: report.miner.user.email,
                }
              : null,
          }
        : null,
      reviewer: report.reviewer
        ? {
            id: report.reviewer.id,
            name: report.reviewer.name || null,
            email: report.reviewer.email,
          }
        : null,
    };
  }
}
