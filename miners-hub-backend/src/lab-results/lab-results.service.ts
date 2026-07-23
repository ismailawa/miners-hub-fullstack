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
  LaboratoryPartner,
  LaboratoryPartnerStatus,
} from '../entities/laboratory-partner.entity';
import { LabResult, LabResultStatus } from '../entities/lab-result.entity';
import { Listing } from '../entities/listing.entity';
import { ProductionReport } from '../entities/production-report.entity';
import { UserRole } from '../entities/user.entity';
import {
  CreateLaboratoryPartnerDto,
  CreateLabResultDto,
  LabResultFilterDto,
  UpdateLaboratoryPartnerDto,
  UpdateLabResultDto,
  VerifyLabResultDto,
} from './lab-results.dto';

type Actor = {
  id: string;
  role: UserRole;
};

@Injectable()
export class LabResultsService {
  constructor(
    @InjectRepository(LaboratoryPartner)
    private readonly labRepository: Repository<LaboratoryPartner>,
    @InjectRepository(LabResult)
    private readonly resultRepository: Repository<LabResult>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(ProductionReport)
    private readonly productionReportRepository: Repository<ProductionReport>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createPartner(actor: Actor, dto: CreateLaboratoryPartnerDto) {
    this.assertAdmin(actor, 'Only admins can create laboratory partners');
    const partner = this.labRepository.create({
      ...dto,
      userId: dto.userId || null,
      accreditationNumber: dto.accreditationNumber || null,
      address: dto.address || null,
      status: dto.status || LaboratoryPartnerStatus.PENDING,
      contactEmail: dto.contactEmail || null,
      contactPhone: dto.contactPhone || null,
    });
    const saved = await this.labRepository.save(partner);
    this.auditLogService.log({
      userId: actor.id,
      action: 'laboratory_partner.create',
      resource: 'laboratory_partner',
      resourceId: saved.id,
      metadata: { status: saved.status },
    });
    return saved;
  }

  async getPartners() {
    return this.labRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updatePartner(actor: Actor, id: string, dto: UpdateLaboratoryPartnerDto) {
    this.assertAdmin(actor, 'Only admins can update laboratory partners');
    const partner = await this.labRepository.findOne({ where: { id } });
    if (!partner) throw new NotFoundException('Laboratory partner not found');
    Object.assign(partner, {
      userId: dto.userId !== undefined ? dto.userId : partner.userId,
      companyName: dto.companyName ?? partner.companyName,
      accreditationNumber:
        dto.accreditationNumber !== undefined
          ? dto.accreditationNumber
          : partner.accreditationNumber,
      address: dto.address !== undefined ? dto.address : partner.address,
      status: dto.status ?? partner.status,
      contactEmail:
        dto.contactEmail !== undefined ? dto.contactEmail : partner.contactEmail,
      contactPhone:
        dto.contactPhone !== undefined ? dto.contactPhone : partner.contactPhone,
    });
    const saved = await this.labRepository.save(partner);
    this.auditLogService.log({
      userId: actor.id,
      action: 'laboratory_partner.update',
      resource: 'laboratory_partner',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto) },
    });
    return saved;
  }

  async createResult(actor: Actor, dto: CreateLabResultDto) {
    const lab = await this.labRepository.findOne({ where: { id: dto.labId } });
    if (!lab || lab.status !== LaboratoryPartnerStatus.ACTIVE) {
      throw new NotFoundException('Active laboratory partner not found');
    }
    await this.assertCanLinkResult(actor, dto.listingId, dto.productionReportId);
    const result = this.resultRepository.create({
      labId: dto.labId,
      requesterId: actor.id,
      listingId: dto.listingId || null,
      productionReportId: dto.productionReportId || null,
      mineralPassportId: dto.mineralPassportId || null,
      sampleReference: dto.sampleReference,
      mineralType: dto.mineralType,
      grade: dto.grade || null,
      assayValue: dto.assayValue ?? null,
      assayUnit: dto.assayUnit || null,
      resultPayload: dto.resultPayload || {},
      certificateUrl: dto.certificateUrl || null,
      status: dto.certificateUrl || dto.resultPayload
        ? LabResultStatus.SUBMITTED
        : LabResultStatus.REQUESTED,
    });
    const saved = await this.resultRepository.save(result);
    this.auditLogService.log({
      userId: actor.id,
      action: 'lab_result.create',
      resource: 'lab_result',
      resourceId: saved.id,
      metadata: {
        labId: saved.labId,
        listingId: saved.listingId,
        productionReportId: saved.productionReportId,
        status: saved.status,
      },
    });
    return this.getResult(actor, saved.id);
  }

  async getResults(actor: Actor, filters: LabResultFilterDto) {
    const query = this.resultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.lab', 'lab')
      .leftJoinAndSelect('result.listing', 'listing')
      .leftJoinAndSelect('listing.miner', 'listingMiner')
      .leftJoinAndSelect('result.productionReport', 'productionReport')
      .leftJoinAndSelect('productionReport.miner', 'productionMiner')
      .orderBy('result.createdAt', 'DESC');

    if (!this.isAdmin(actor)) {
      query.where(
        '(result.requesterId = :userId OR lab.userId = :userId OR listingMiner.userId = :userId OR productionMiner.userId = :userId)',
        { userId: actor.id },
      );
    }
    if (filters.status) {
      query.andWhere('result.status = :status', { status: filters.status });
    }
    if (filters.labId) {
      query.andWhere('result.labId = :labId', { labId: filters.labId });
    }
    if (filters.listingId) {
      query.andWhere('result.listingId = :listingId', {
        listingId: filters.listingId,
      });
    }
    if (filters.productionReportId) {
      query.andWhere('result.productionReportId = :productionReportId', {
        productionReportId: filters.productionReportId,
      });
    }

    const [data, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();
    return paginate(data, total, filters);
  }

  async getResult(actor: Actor, id: string) {
    const result = await this.resultRepository.findOne({
      where: { id },
      relations: ['lab', 'listing', 'listing.miner', 'productionReport', 'productionReport.miner'],
    });
    if (!result) throw new NotFoundException('Lab result not found');
    if (!this.canAccessResult(actor, result)) {
      throw new ForbiddenException('You cannot access this lab result');
    }
    return result;
  }

  async updateResult(actor: Actor, id: string, dto: UpdateLabResultDto) {
    const result = await this.getResult(actor, id);
    if (result.status === LabResultStatus.VERIFIED && !this.isAdmin(actor)) {
      throw new ForbiddenException('Verified lab results can only be updated by admins');
    }
    if (dto.labId) {
      const lab = await this.labRepository.findOne({ where: { id: dto.labId } });
      if (!lab || lab.status !== LaboratoryPartnerStatus.ACTIVE) {
        throw new NotFoundException('Active laboratory partner not found');
      }
    }
    await this.assertCanLinkResult(actor, dto.listingId, dto.productionReportId);
    Object.assign(result, {
      labId: dto.labId ?? result.labId,
      listingId: dto.listingId !== undefined ? dto.listingId : result.listingId,
      productionReportId:
        dto.productionReportId !== undefined
          ? dto.productionReportId
          : result.productionReportId,
      mineralPassportId:
        dto.mineralPassportId !== undefined
          ? dto.mineralPassportId
          : result.mineralPassportId,
      sampleReference: dto.sampleReference ?? result.sampleReference,
      mineralType: dto.mineralType ?? result.mineralType,
      grade: dto.grade !== undefined ? dto.grade : result.grade,
      assayValue: dto.assayValue !== undefined ? dto.assayValue : result.assayValue,
      assayUnit: dto.assayUnit !== undefined ? dto.assayUnit : result.assayUnit,
      resultPayload:
        dto.resultPayload !== undefined ? dto.resultPayload : result.resultPayload,
      certificateUrl:
        dto.certificateUrl !== undefined ? dto.certificateUrl : result.certificateUrl,
    });
    if (result.status === LabResultStatus.REQUESTED && (result.certificateUrl || Object.keys(result.resultPayload || {}).length > 0)) {
      result.status = LabResultStatus.SUBMITTED;
    }
    const saved = await this.resultRepository.save(result);
    this.auditLogService.log({
      userId: actor.id,
      action: 'lab_result.update',
      resource: 'lab_result',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto), status: saved.status },
    });
    return this.getResult(actor, saved.id);
  }

  async verifyResult(actor: Actor, id: string, dto: VerifyLabResultDto) {
    this.assertAdmin(actor, 'Only admins can verify lab results');
    const result = await this.resultRepository.findOne({ where: { id } });
    if (!result) throw new NotFoundException('Lab result not found');
    result.status = dto.status;
    result.reviewNotes =
      dto.reviewNotes !== undefined ? dto.reviewNotes : result.reviewNotes;
    result.verifiedBy = actor.id;
    result.verifiedAt = new Date();
    const saved = await this.resultRepository.save(result);
    this.auditLogService.log({
      userId: actor.id,
      action: 'lab_result.verify',
      resource: 'lab_result',
      resourceId: saved.id,
      metadata: { status: saved.status },
    });
    return this.getResult(actor, saved.id);
  }

  private async assertCanLinkResult(
    actor: Actor,
    listingId?: string | null,
    productionReportId?: string | null,
  ) {
    if (this.isAdmin(actor)) return;
    if (listingId) {
      const listing = await this.listingRepository.findOne({
        where: { id: listingId },
        relations: ['miner'],
      });
      if (!listing || listing.miner.userId !== actor.id) {
        throw new ForbiddenException('You can only link lab results to your own listings');
      }
    }
    if (productionReportId) {
      const report = await this.productionReportRepository.findOne({
        where: { id: productionReportId },
        relations: ['miner'],
      });
      if (!report || report.miner.userId !== actor.id) {
        throw new ForbiddenException('You can only link lab results to your own production reports');
      }
    }
  }

  private canAccessResult(actor: Actor, result: LabResult) {
    return (
      this.isAdmin(actor) ||
      result.requesterId === actor.id ||
      result.lab?.userId === actor.id ||
      result.listing?.miner?.userId === actor.id ||
      result.productionReport?.miner?.userId === actor.id
    );
  }

  private assertAdmin(actor: Actor, message: string) {
    if (!this.isAdmin(actor)) throw new ForbiddenException(message);
  }

  private isAdmin(actor: Actor) {
    return actor.role === UserRole.ADMIN;
  }
}
