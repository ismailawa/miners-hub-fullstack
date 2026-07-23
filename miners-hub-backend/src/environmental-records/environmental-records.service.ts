import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { paginate } from '../common/dto/pagination.dto';
import {
  EnvironmentalRecord,
  EnvironmentalRecordStatus,
} from '../entities/environmental-record.entity';
import { MineSite } from '../entities/mine-site.entity';
import { UserRole } from '../entities/user.entity';
import {
  CreateEnvironmentalRecordDto,
  EnvironmentalRecordFilterDto,
  UpdateEnvironmentalRecordDto,
} from './environmental-records.dto';

type Actor = {
  id: string;
  role: UserRole;
};

@Injectable()
export class EnvironmentalRecordsService {
  constructor(
    @InjectRepository(EnvironmentalRecord)
    private readonly recordRepository: Repository<EnvironmentalRecord>,
    @InjectRepository(MineSite)
    private readonly siteRepository: Repository<MineSite>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(actor: Actor, dto: CreateEnvironmentalRecordDto) {
    await this.assertCanUseSite(actor, dto.siteId);
    const record = this.recordRepository.create({
      siteId: dto.siteId,
      reportedBy: actor.id,
      recordType: dto.recordType,
      severity: dto.severity,
      description: dto.description,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      evidenceUrls: dto.evidenceUrls || [],
      assignedTo: this.isReviewer(actor) ? dto.assignedTo || null : null,
      remediationActions: dto.remediationActions || [],
      communityVisible: this.isReviewer(actor) ? Boolean(dto.communityVisible) : false,
      privateNotes: this.isReviewer(actor) ? dto.privateNotes || null : null,
    });
    const saved = await this.recordRepository.save(record);
    await this.patchSiteRecordIds(saved.siteId, saved.id);
    this.auditLogService.log({
      userId: actor.id,
      action: 'environmental_record.create',
      resource: 'environmental_record',
      resourceId: saved.id,
      metadata: { siteId: saved.siteId, severity: saved.severity, status: saved.status },
    });
    return this.findOne(actor, saved.id);
  }

  async findAll(actor: Actor, filters: EnvironmentalRecordFilterDto) {
    const query = this.recordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.site', 'site')
      .leftJoinAndSelect('site.operator', 'operator')
      .leftJoinAndSelect('record.reporter', 'reporter')
      .leftJoinAndSelect('record.assignee', 'assignee')
      .orderBy('record.createdAt', 'DESC');

    if (!this.isReviewer(actor)) {
      query.where('(record.reportedBy = :userId OR operator.userId = :userId OR record.assignedTo = :userId)', {
        userId: actor.id,
      });
    }
    if (filters.siteId) query.andWhere('record.siteId = :siteId', { siteId: filters.siteId });
    if (filters.recordType) query.andWhere('record.recordType = :recordType', { recordType: filters.recordType });
    if (filters.severity) query.andWhere('record.severity = :severity', { severity: filters.severity });
    if (filters.status) query.andWhere('record.status = :status', { status: filters.status });

    const [data, total] = await query.skip(filters.offset).take(filters.limit).getManyAndCount();
    return paginate(data, total, filters);
  }

  async findOne(actor: Actor, id: string) {
    const record = await this.recordRepository.findOne({
      where: { id },
      relations: ['site', 'site.operator', 'reporter', 'assignee'],
    });
    if (!record) throw new NotFoundException('Environmental record not found');
    if (!this.canAccess(actor, record)) {
      throw new ForbiddenException('You cannot access this environmental record');
    }
    return record;
  }

  async update(actor: Actor, id: string, dto: UpdateEnvironmentalRecordDto) {
    const record = await this.findOne(actor, id);
    const canReview = this.isReviewer(actor);
    const canRemediate = canReview || record.assignedTo === actor.id;
    if (!canRemediate && record.reportedBy !== actor.id) {
      throw new ForbiddenException('You cannot update this environmental record');
    }
    Object.assign(record, {
      description: dto.description ?? record.description,
      latitude: dto.latitude !== undefined ? dto.latitude : record.latitude,
      longitude: dto.longitude !== undefined ? dto.longitude : record.longitude,
      evidenceUrls: dto.evidenceUrls ?? record.evidenceUrls,
      remediationActions: dto.remediationActions ?? record.remediationActions,
      severity: canReview ? dto.severity ?? record.severity : record.severity,
      status: canRemediate ? dto.status ?? record.status : record.status,
      assignedTo: canReview && dto.assignedTo !== undefined ? dto.assignedTo : record.assignedTo,
      communityVisible: canReview && dto.communityVisible !== undefined ? dto.communityVisible : record.communityVisible,
      privateNotes: canReview && dto.privateNotes !== undefined ? dto.privateNotes : record.privateNotes,
    });
    if (
      (record.status === EnvironmentalRecordStatus.RESOLVED ||
        record.status === EnvironmentalRecordStatus.CLOSED) &&
      !record.resolvedAt
    ) {
      record.resolvedAt = new Date();
    }
    const saved = await this.recordRepository.save(record);
    this.auditLogService.log({
      userId: actor.id,
      action: 'environmental_record.update',
      resource: 'environmental_record',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto), status: saved.status },
    });
    return this.findOne(actor, saved.id);
  }

  async findCommunitySafe(filters: EnvironmentalRecordFilterDto) {
    const query = this.recordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.site', 'site')
      .where('record.communityVisible = true')
      .orderBy('record.createdAt', 'DESC');
    if (filters.siteId) query.andWhere('record.siteId = :siteId', { siteId: filters.siteId });
    if (filters.severity) query.andWhere('record.severity = :severity', { severity: filters.severity });
    if (filters.status) query.andWhere('record.status = :status', { status: filters.status });
    const [records, total] = await query.skip(filters.offset).take(filters.limit).getManyAndCount();
    return paginate(records.map((record) => ({
      id: record.id,
      siteId: record.siteId,
      site: record.site ? {
        id: record.site.id,
        name: record.site.name,
        state: record.site.state,
        lga: record.site.lga,
        community: record.site.community,
      } : null,
      recordType: record.recordType,
      severity: record.severity,
      description: record.description,
      latitude: record.latitude,
      longitude: record.longitude,
      evidenceUrls: record.evidenceUrls,
      status: record.status,
      resolvedAt: record.resolvedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })), total, filters);
  }

  private async assertCanUseSite(actor: Actor, siteId: string) {
    const site = await this.siteRepository.findOne({
      where: { id: siteId },
      relations: ['operator'],
    });
    if (!site) throw new NotFoundException('Mine site not found');
    if (!this.isReviewer(actor) && site.operator.userId !== actor.id) {
      throw new ForbiddenException('You can only report environmental records for your own sites');
    }
  }

  private async patchSiteRecordIds(siteId: string, recordId: string) {
    const site = await this.siteRepository.findOne({ where: { id: siteId } });
    if (!site) return;
    site.environmentalRecordIds = Array.from(new Set([...(site.environmentalRecordIds || []), recordId]));
    await this.siteRepository.save(site);
  }

  private canAccess(actor: Actor, record: EnvironmentalRecord) {
    return (
      this.isReviewer(actor) ||
      record.reportedBy === actor.id ||
      record.assignedTo === actor.id ||
      record.site?.operator?.userId === actor.id
    );
  }

  private isReviewer(actor: Actor) {
    return actor.role === UserRole.ADMIN || actor.role === UserRole.GOVERNMENT;
  }
}
