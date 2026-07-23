import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AmlKybActorType,
  AmlKybReviewStatus,
  AmlKybRiskProfile,
  AmlKybRiskTier,
  ScumlRegistrationStatus,
  SuspiciousActivityStatus,
} from '../entities/aml-kyb-risk-profile.entity';
import {
  ComplianceCase,
  ComplianceCaseStatus,
} from '../entities/compliance-case.entity';
import {
  EsgObligation,
  EsgObligationStatus,
} from '../entities/esg-obligation.entity';
import {
  License,
  LicenseType,
  LicenseRenewalStatus,
  LicenseStatus,
} from '../entities/license.entity';
import {
  ExportReadinessChecklist,
  ExportReadinessStatus,
} from '../entities/export-readiness-checklist.entity';
import { MineSite } from '../entities/mine-site.entity';
import { User, UserRole, VerificationStatus } from '../entities/user.entity';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { paginate } from '../common/dto/pagination.dto';
import {
  AmlKybRiskProfileFilterDto,
  ComplianceCaseFilterDto,
  CreateAmlKybRiskProfileDto,
  CreateComplianceCaseDto,
  CreateEsgObligationDto,
  CreateExportReadinessChecklistDto,
  CreateLicenseDto,
  EsgObligationFilterDto,
  ExportReadinessFilterDto,
  ReviewAmlKybRiskProfileDto,
  ReviewEsgObligationDto,
  LicenseFilterDto,
  ReviewExportReadinessChecklistDto,
  ReviewLicenseDto,
  UpdateAmlKybRiskProfileDto,
  UpdateComplianceCaseDto,
  UpdateEsgObligationDto,
  UpdateExportReadinessChecklistDto,
  UpdateLicenseDto,
} from './compliance.dto';

type Actor = {
  id: string;
  role: UserRole;
};

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    @InjectRepository(ComplianceCase)
    private readonly caseRepository: Repository<ComplianceCase>,
    @InjectRepository(AmlKybRiskProfile)
    private readonly amlKybRiskProfileRepository: Repository<AmlKybRiskProfile>,
    @InjectRepository(EsgObligation)
    private readonly esgObligationRepository: Repository<EsgObligation>,
    @InjectRepository(ExportReadinessChecklist)
    private readonly exportReadinessRepository: Repository<ExportReadinessChecklist>,
    @InjectRepository(MineSite)
    private readonly mineSiteRepository: Repository<MineSite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createLicense(actor: Actor, dto: CreateLicenseDto) {
    const holderUserId = this.isReviewer(actor)
      ? dto.holderUserId || actor.id
      : actor.id;

    await this.assertUserExists(holderUserId);
    if (dto.siteId) {
      await this.assertCanUseSite(actor, dto.siteId, holderUserId);
    }

    const license = this.licenseRepository.create({
      holderUserId,
      siteId: dto.siteId || null,
      licenseNumber: dto.licenseNumber,
      licenseType: dto.licenseType,
      issuingAuthority: dto.issuingAuthority,
      issueDate: dto.issueDate,
      expiryDate: dto.expiryDate,
      annualServiceFee: dto.annualServiceFee ?? null,
      serviceFeePaidUntil: dto.serviceFeePaidUntil || null,
      applicationPriorityDate: dto.applicationPriorityDate
        ? new Date(dto.applicationPriorityDate)
        : null,
      permitShipmentReference: dto.permitShipmentReference || null,
      issuingOffice: dto.issuingOffice || null,
      metadata: dto.metadata || null,
      documentIds: dto.documentIds || [],
      status: LicenseStatus.SUBMITTED,
      renewalStatus: this.resolveRenewalStatus(dto.expiryDate),
    });

    const saved = await this.licenseRepository.save(license);
    this.auditLogService.log({
      userId: actor.id,
      action: 'license.submit',
      resource: 'license',
      resourceId: saved.id,
      metadata: { holderUserId, siteId: saved.siteId },
    });

    return this.findLicense(actor, saved.id);
  }

  async findLicenses(actor: Actor, filters: LicenseFilterDto) {
    const query = this.licenseRepository
      .createQueryBuilder('license')
      .leftJoinAndSelect('license.holder', 'holder')
      .leftJoinAndSelect('license.site', 'site')
      .leftJoinAndSelect('site.operator', 'operator')
      .orderBy('license.expiryDate', 'ASC');

    if (!this.isReviewer(actor)) {
      query.where('license.holderUserId = :holderUserId', {
        holderUserId: actor.id,
      });
    }

    if (filters.status) {
      query.andWhere('license.status = :status', { status: filters.status });
    }

    if (filters.renewalStatus) {
      query.andWhere('license.renewalStatus = :renewalStatus', {
        renewalStatus: filters.renewalStatus,
      });
    }

    if (filters.siteId) {
      query.andWhere('license.siteId = :siteId', { siteId: filters.siteId });
    }

    if (filters.licenseType) {
      query.andWhere('license.licenseType = :licenseType', {
        licenseType: filters.licenseType,
      });
    }

    if (filters.search) {
      query.andWhere(
        '(license.licenseNumber ILIKE :search OR license.licenseType ILIKE :search OR license.issuingAuthority ILIKE :search OR holder.name ILIKE :search OR holder.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const [licenses, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();

    return paginate(
      licenses.map((license) => this.toLicenseResponse(license)),
      total,
      filters,
    );
  }

  async findLicense(actor: Actor, id: string) {
    const license = await this.licenseRepository.findOne({
      where: { id },
      relations: ['holder', 'site', 'site.operator'],
    });

    if (!license) {
      throw new NotFoundException('License not found');
    }

    this.assertCanAccessLicense(actor, license);
    return this.toLicenseResponse(license);
  }

  async updateLicense(actor: Actor, id: string, dto: UpdateLicenseDto) {
    const license = await this.licenseRepository.findOne({ where: { id } });
    if (!license) throw new NotFoundException('License not found');

    this.assertCanAccessLicense(actor, license);
    if (dto.siteId) {
      await this.assertCanUseSite(actor, dto.siteId, license.holderUserId);
    }

    Object.assign(license, {
      siteId: dto.siteId !== undefined ? dto.siteId : license.siteId,
      licenseNumber: dto.licenseNumber ?? license.licenseNumber,
      licenseType: dto.licenseType ?? license.licenseType,
      issuingAuthority: dto.issuingAuthority ?? license.issuingAuthority,
      issueDate: dto.issueDate ?? license.issueDate,
      expiryDate: dto.expiryDate ?? license.expiryDate,
      annualServiceFee:
        dto.annualServiceFee !== undefined
          ? dto.annualServiceFee
          : license.annualServiceFee,
      serviceFeePaidUntil:
        dto.serviceFeePaidUntil !== undefined
          ? dto.serviceFeePaidUntil
          : license.serviceFeePaidUntil,
      applicationPriorityDate:
        dto.applicationPriorityDate !== undefined
          ? dto.applicationPriorityDate
            ? new Date(dto.applicationPriorityDate)
            : null
          : license.applicationPriorityDate,
      permitShipmentReference:
        dto.permitShipmentReference !== undefined
          ? dto.permitShipmentReference
          : license.permitShipmentReference,
      issuingOffice:
        dto.issuingOffice !== undefined
          ? dto.issuingOffice
          : license.issuingOffice,
      metadata: dto.metadata !== undefined ? dto.metadata : license.metadata,
      renewalStatus:
        dto.renewalStatus ||
        (dto.expiryDate
          ? this.resolveRenewalStatus(dto.expiryDate)
          : license.renewalStatus),
      documentIds: dto.documentIds ?? license.documentIds,
      status: this.isReviewer(actor) ? license.status : LicenseStatus.SUBMITTED,
    });

    const saved = await this.licenseRepository.save(license);
    this.auditLogService.log({
      userId: actor.id,
      action: 'license.update',
      resource: 'license',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto) },
    });
    return this.findLicense(actor, saved.id);
  }

  async reviewLicense(actor: Actor, id: string, dto: ReviewLicenseDto) {
    if (!this.isReviewer(actor)) {
      throw new ForbiddenException(
        'Only admins or government users can review licenses',
      );
    }

    const license = await this.licenseRepository.findOne({ where: { id } });
    if (!license) throw new NotFoundException('License not found');

    license.status = dto.status;
    license.reviewNotes = dto.reviewNotes || null;
    license.reviewedBy = actor.id;
    license.reviewedAt = new Date();
    license.renewalStatus = this.resolveRenewalStatus(license.expiryDate);

    const saved = await this.licenseRepository.save(license);
    this.auditLogService.log({
      userId: actor.id,
      action: 'license.review',
      resource: 'license',
      resourceId: saved.id,
      metadata: { status: saved.status },
    });
    return this.findLicense(actor, saved.id);
  }

  async createCase(actor: Actor, dto: CreateComplianceCaseDto) {
    if (!this.isReviewer(actor)) {
      throw new ForbiddenException(
        'Only admins or government users can create compliance cases',
      );
    }

    await this.assertSiteExists(dto.siteId);
    if (dto.subjectUserId) await this.assertUserExists(dto.subjectUserId);

    const complianceCase = this.caseRepository.create({
      ...dto,
      subjectUserId: dto.subjectUserId || null,
      assignedTo: dto.assignedTo || null,
      requiredActions: dto.requiredActions || [],
      dueDate: dto.dueDate || null,
      inspectionScheduledAt: dto.inspectionScheduledAt
        ? new Date(dto.inspectionScheduledAt)
        : null,
      inspectorName: dto.inspectorName || null,
      inspectionNotes: dto.inspectionNotes || null,
      status: dto.inspectionScheduledAt
        ? ComplianceCaseStatus.INSPECTION_SCHEDULED
        : ComplianceCaseStatus.OPEN,
    });

    const saved = await this.caseRepository.save(complianceCase);
    this.auditLogService.log({
      userId: actor.id,
      action: 'compliance_case.create',
      resource: 'compliance_case',
      resourceId: saved.id,
      metadata: { siteId: saved.siteId, severity: saved.severity },
    });
    return this.findCase(actor, saved.id);
  }

  async createEsgObligation(actor: Actor, dto: CreateEsgObligationDto) {
    const responsibleUserId = this.isReviewer(actor)
      ? dto.responsibleUserId || actor.id
      : actor.id;

    await this.assertUserExists(responsibleUserId);
    if (dto.siteId) {
      await this.assertCanUseSite(actor, dto.siteId, responsibleUserId);
    }
    if (dto.licenseId) {
      await this.assertCanUseLicense(actor, dto.licenseId, responsibleUserId);
    }

    const obligation = this.esgObligationRepository.create({
      siteId: dto.siteId || null,
      licenseId: dto.licenseId || null,
      responsibleUserId,
      obligationType: dto.obligationType,
      title: dto.title,
      description: dto.description || null,
      status: this.isReviewer(actor)
        ? dto.status || EsgObligationStatus.SUBMITTED
        : EsgObligationStatus.SUBMITTED,
      documentIds: dto.documentIds || [],
      evidenceUrls: dto.evidenceUrls || [],
      dueDate: dto.dueDate || null,
      metadata: dto.metadata || null,
    });

    const saved = await this.esgObligationRepository.save(obligation);
    this.auditLogService.log({
      userId: actor.id,
      action: 'esg_obligation.create',
      resource: 'esg_obligation',
      resourceId: saved.id,
      metadata: {
        siteId: saved.siteId,
        licenseId: saved.licenseId,
        obligationType: saved.obligationType,
      },
    });
    return this.findEsgObligation(actor, saved.id);
  }

  async findEsgObligations(actor: Actor, filters: EsgObligationFilterDto) {
    const query = this.esgObligationRepository
      .createQueryBuilder('obligation')
      .leftJoinAndSelect('obligation.site', 'site')
      .leftJoinAndSelect('site.operator', 'operator')
      .leftJoinAndSelect('obligation.license', 'license')
      .leftJoinAndSelect('obligation.responsibleUser', 'responsibleUser')
      .orderBy('obligation.dueDate', 'ASC', 'NULLS LAST')
      .addOrderBy('obligation.createdAt', 'DESC');

    if (!this.isReviewer(actor)) {
      query.where('obligation.responsibleUserId = :responsibleUserId', {
        responsibleUserId: actor.id,
      });
    } else if (filters.responsibleUserId) {
      query.where('obligation.responsibleUserId = :responsibleUserId', {
        responsibleUserId: filters.responsibleUserId,
      });
    }

    if (filters.obligationType) {
      query.andWhere('obligation.obligationType = :obligationType', {
        obligationType: filters.obligationType,
      });
    }
    if (filters.status) {
      query.andWhere('obligation.status = :status', { status: filters.status });
    }
    if (filters.siteId) {
      query.andWhere('obligation.siteId = :siteId', { siteId: filters.siteId });
    }
    if (filters.licenseId) {
      query.andWhere('obligation.licenseId = :licenseId', {
        licenseId: filters.licenseId,
      });
    }
    if (filters.dueBefore) {
      query.andWhere('obligation.dueDate <= :dueBefore', {
        dueBefore: filters.dueBefore,
      });
    }

    const [obligations, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();

    return paginate(
      obligations.map((obligation) => this.toEsgObligationResponse(obligation)),
      total,
      filters,
    );
  }

  async findEsgObligation(actor: Actor, id: string) {
    const obligation = await this.esgObligationRepository.findOne({
      where: { id },
      relations: ['site', 'site.operator', 'license', 'responsibleUser'],
    });
    if (!obligation) throw new NotFoundException('ESG obligation not found');

    this.assertCanAccessEsgObligation(actor, obligation);
    return this.toEsgObligationResponse(obligation);
  }

  async updateEsgObligation(
    actor: Actor,
    id: string,
    dto: UpdateEsgObligationDto,
  ) {
    const obligation = await this.esgObligationRepository.findOne({
      where: { id },
    });
    if (!obligation) throw new NotFoundException('ESG obligation not found');

    this.assertCanAccessEsgObligation(actor, obligation);
    if (dto.siteId) {
      await this.assertCanUseSite(
        actor,
        dto.siteId,
        obligation.responsibleUserId,
      );
    }
    if (dto.licenseId) {
      await this.assertCanUseLicense(
        actor,
        dto.licenseId,
        obligation.responsibleUserId,
      );
    }

    Object.assign(obligation, {
      siteId: dto.siteId !== undefined ? dto.siteId : obligation.siteId,
      licenseId:
        dto.licenseId !== undefined ? dto.licenseId : obligation.licenseId,
      obligationType: dto.obligationType ?? obligation.obligationType,
      title: dto.title ?? obligation.title,
      description:
        dto.description !== undefined
          ? dto.description
          : obligation.description,
      documentIds: dto.documentIds ?? obligation.documentIds,
      evidenceUrls: dto.evidenceUrls ?? obligation.evidenceUrls,
      dueDate: dto.dueDate !== undefined ? dto.dueDate : obligation.dueDate,
      metadata: dto.metadata !== undefined ? dto.metadata : obligation.metadata,
      status: this.isReviewer(actor)
        ? obligation.status
        : EsgObligationStatus.SUBMITTED,
    });

    const saved = await this.esgObligationRepository.save(obligation);
    this.auditLogService.log({
      userId: actor.id,
      action: 'esg_obligation.update',
      resource: 'esg_obligation',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto) },
    });
    return this.findEsgObligation(actor, saved.id);
  }

  async reviewEsgObligation(
    actor: Actor,
    id: string,
    dto: ReviewEsgObligationDto,
  ) {
    if (!this.isReviewer(actor)) {
      throw new ForbiddenException(
        'Only admins or government users can review ESG obligations',
      );
    }

    const obligation = await this.esgObligationRepository.findOne({
      where: { id },
    });
    if (!obligation) throw new NotFoundException('ESG obligation not found');

    obligation.status = dto.status;
    obligation.reviewNotes = dto.reviewNotes || null;
    obligation.lastReviewedBy = actor.id;
    obligation.lastReviewedAt = new Date();

    const saved = await this.esgObligationRepository.save(obligation);
    this.auditLogService.log({
      userId: actor.id,
      action: 'esg_obligation.review',
      resource: 'esg_obligation',
      resourceId: saved.id,
      metadata: { status: saved.status },
    });
    return this.findEsgObligation(actor, saved.id);
  }

  async createAmlKybRiskProfile(actor: Actor, dto: CreateAmlKybRiskProfileDto) {
    const userId = this.isReviewer(actor) ? dto.userId || actor.id : actor.id;
    await this.assertUserExists(userId);

    const enriched = await this.enrichAmlKybRiskProfileInput(userId, dto);
    const profile = this.amlKybRiskProfileRepository.create({
      userId,
      actorType: dto.actorType,
      businessName: dto.businessName || null,
      businessRegistrationNumber: dto.businessRegistrationNumber || null,
      beneficialOwnerSummary: dto.beneficialOwnerSummary || null,
      beneficialOwnerDocumentIds: dto.beneficialOwnerDocumentIds || [],
      scumlRegistrationNumber: dto.scumlRegistrationNumber || null,
      scumlRegistrationStatus:
        dto.scumlRegistrationStatus ||
        enriched.scumlRegistrationStatus ||
        ScumlRegistrationStatus.NOT_PROVIDED,
      scumlDocumentIds: dto.scumlDocumentIds || [],
      sourceOfFundsNotes: dto.sourceOfFundsNotes || null,
      sourceOfMineralsNotes: dto.sourceOfMineralsNotes || null,
      riskTier: this.isReviewer(actor)
        ? dto.riskTier || enriched.riskTier
        : enriched.riskTier,
      riskReasons: enriched.riskReasons,
      riskIndicators: enriched.riskIndicators,
      suspiciousActivityStatus:
        this.isReviewer(actor) && dto.suspiciousActivityStatus
          ? dto.suspiciousActivityStatus
          : SuspiciousActivityStatus.NONE,
      reviewStatus: this.isReviewer(actor)
        ? dto.reviewStatus || AmlKybReviewStatus.SUBMITTED
        : AmlKybReviewStatus.SUBMITTED,
      metadata: dto.metadata || null,
    });

    const saved = await this.amlKybRiskProfileRepository.save(profile);
    this.auditLogService.log({
      userId: actor.id,
      action: 'aml_kyb_profile.create',
      resource: 'aml_kyb_profile',
      resourceId: saved.id,
      metadata: {
        subjectUserId: saved.userId,
        actorType: saved.actorType,
        riskTier: saved.riskTier,
      },
    });
    return this.findAmlKybRiskProfile(actor, saved.id);
  }

  async findAmlKybRiskProfiles(
    actor: Actor,
    filters: AmlKybRiskProfileFilterDto,
  ) {
    const query = this.amlKybRiskProfileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.reviewer', 'reviewer')
      .orderBy('profile.updatedAt', 'DESC');

    if (!this.isReviewer(actor)) {
      query.where('profile.userId = :userId', { userId: actor.id });
    } else if (filters.userId) {
      query.where('profile.userId = :userId', { userId: filters.userId });
    }
    if (filters.actorType) {
      query.andWhere('profile.actorType = :actorType', {
        actorType: filters.actorType,
      });
    }
    if (filters.riskTier) {
      query.andWhere('profile.riskTier = :riskTier', {
        riskTier: filters.riskTier,
      });
    }
    if (filters.reviewStatus) {
      query.andWhere('profile.reviewStatus = :reviewStatus', {
        reviewStatus: filters.reviewStatus,
      });
    }
    if (filters.suspiciousActivityStatus) {
      query.andWhere(
        'profile.suspiciousActivityStatus = :suspiciousActivityStatus',
        { suspiciousActivityStatus: filters.suspiciousActivityStatus },
      );
    }

    const [profiles, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();
    return paginate(
      profiles.map((profile) => this.toAmlKybRiskProfileResponse(profile)),
      total,
      filters,
    );
  }

  async findAmlKybRiskProfile(actor: Actor, id: string) {
    const profile = await this.amlKybRiskProfileRepository.findOne({
      where: { id },
      relations: ['user', 'reviewer'],
    });
    if (!profile) throw new NotFoundException('AML/KYB risk profile not found');
    this.assertCanAccessAmlKybRiskProfile(actor, profile);
    return this.toAmlKybRiskProfileResponse(profile);
  }

  async updateAmlKybRiskProfile(
    actor: Actor,
    id: string,
    dto: UpdateAmlKybRiskProfileDto,
  ) {
    const profile = await this.amlKybRiskProfileRepository.findOne({
      where: { id },
    });
    if (!profile) throw new NotFoundException('AML/KYB risk profile not found');
    this.assertCanAccessAmlKybRiskProfile(actor, profile);

    const next = {
      ...profile,
      ...dto,
      businessName:
        dto.businessName !== undefined
          ? dto.businessName
          : profile.businessName,
      businessRegistrationNumber:
        dto.businessRegistrationNumber !== undefined
          ? dto.businessRegistrationNumber
          : profile.businessRegistrationNumber,
      beneficialOwnerSummary:
        dto.beneficialOwnerSummary !== undefined
          ? dto.beneficialOwnerSummary
          : profile.beneficialOwnerSummary,
      scumlRegistrationNumber:
        dto.scumlRegistrationNumber !== undefined
          ? dto.scumlRegistrationNumber
          : profile.scumlRegistrationNumber,
      sourceOfFundsNotes:
        dto.sourceOfFundsNotes !== undefined
          ? dto.sourceOfFundsNotes
          : profile.sourceOfFundsNotes,
      sourceOfMineralsNotes:
        dto.sourceOfMineralsNotes !== undefined
          ? dto.sourceOfMineralsNotes
          : profile.sourceOfMineralsNotes,
      reviewStatus: this.isReviewer(actor)
        ? profile.reviewStatus
        : AmlKybReviewStatus.SUBMITTED,
    } as AmlKybRiskProfile;

    const enriched = await this.enrichAmlKybRiskProfileInput(profile.userId, {
      actorType: next.actorType,
      beneficialOwnerSummary: next.beneficialOwnerSummary,
      beneficialOwnerDocumentIds: next.beneficialOwnerDocumentIds,
      scumlRegistrationStatus: next.scumlRegistrationStatus,
      scumlDocumentIds: next.scumlDocumentIds,
      sourceOfFundsNotes: next.sourceOfFundsNotes,
      sourceOfMineralsNotes: next.sourceOfMineralsNotes,
      riskTier: this.isReviewer(actor) ? next.riskTier : undefined,
      riskReasons: next.riskReasons,
      riskIndicators: next.riskIndicators,
    });

    Object.assign(profile, next, {
      riskTier: this.isReviewer(actor) ? next.riskTier : enriched.riskTier,
      riskReasons: enriched.riskReasons,
      riskIndicators: enriched.riskIndicators,
    });

    const saved = await this.amlKybRiskProfileRepository.save(profile);
    this.auditLogService.log({
      userId: actor.id,
      action: 'aml_kyb_profile.update',
      resource: 'aml_kyb_profile',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto) },
    });
    return this.findAmlKybRiskProfile(actor, saved.id);
  }

  async reviewAmlKybRiskProfile(
    actor: Actor,
    id: string,
    dto: ReviewAmlKybRiskProfileDto,
  ) {
    if (!this.isReviewer(actor)) {
      throw new ForbiddenException(
        'Only admins or government users can review AML/KYB profiles',
      );
    }
    const profile = await this.amlKybRiskProfileRepository.findOne({
      where: { id },
    });
    if (!profile) throw new NotFoundException('AML/KYB risk profile not found');

    profile.reviewStatus = dto.reviewStatus;
    profile.riskTier = dto.riskTier || profile.riskTier;
    profile.riskReasons = dto.riskReasons || profile.riskReasons;
    profile.riskIndicators = dto.riskIndicators || profile.riskIndicators;
    profile.suspiciousActivityStatus =
      dto.suspiciousActivityStatus || profile.suspiciousActivityStatus;
    profile.reviewNotes = dto.reviewNotes || null;
    profile.lastReviewedBy = actor.id;
    profile.lastReviewedAt = new Date();

    const saved = await this.amlKybRiskProfileRepository.save(profile);
    this.auditLogService.log({
      userId: actor.id,
      action: 'aml_kyb_profile.review',
      resource: 'aml_kyb_profile',
      resourceId: saved.id,
      metadata: {
        reviewStatus: saved.reviewStatus,
        riskTier: saved.riskTier,
        suspiciousActivityStatus: saved.suspiciousActivityStatus,
      },
    });
    return this.findAmlKybRiskProfile(actor, saved.id);
  }

  async createExportReadiness(
    actor: Actor,
    dto: CreateExportReadinessChecklistDto,
  ) {
    const exporterUserId = this.isReviewer(actor)
      ? dto.exporterUserId || actor.id
      : actor.id;
    await this.assertUserExists(exporterUserId);
    if (dto.licenseId) {
      await this.assertCanUseLicense(actor, dto.licenseId, exporterUserId);
    }

    const checklist = this.exportReadinessRepository.create({
      orderId: dto.orderId || null,
      mineralPassportId: dto.mineralPassportId || null,
      exporterUserId,
      licenseId: dto.licenseId || null,
      exportPermitDocumentId: dto.exportPermitDocumentId || null,
      assayDocumentId: dto.assayDocumentId || null,
      invoiceDocumentId: dto.invoiceDocumentId || null,
      customsStatus: dto.customsStatus,
      carrierReference: dto.carrierReference || null,
      readinessStatus: ExportReadinessStatus.DRAFT,
      blockingIssues: dto.blockingIssues || [],
      metadata: dto.metadata || null,
    });

    const saved = await this.exportReadinessRepository.save(checklist);
    this.auditLogService.log({
      userId: actor.id,
      action: 'export_readiness.create',
      resource: 'export_readiness_checklist',
      resourceId: saved.id,
      metadata: { exporterUserId, orderId: saved.orderId },
    });
    return this.findExportReadiness(actor, saved.id);
  }

  async findExportReadinessList(
    actor: Actor,
    filters: ExportReadinessFilterDto,
  ) {
    const query = this.exportReadinessRepository
      .createQueryBuilder('checklist')
      .leftJoinAndSelect('checklist.exporter', 'exporter')
      .leftJoinAndSelect('checklist.license', 'license')
      .leftJoinAndSelect('checklist.order', 'order')
      .leftJoinAndSelect('checklist.mineralPassport', 'mineralPassport')
      .orderBy('checklist.createdAt', 'DESC');

    if (!this.isReviewer(actor)) {
      query.where('checklist.exporterUserId = :exporterUserId', {
        exporterUserId: actor.id,
      });
    } else if (filters.exporterUserId) {
      query.where('checklist.exporterUserId = :exporterUserId', {
        exporterUserId: filters.exporterUserId,
      });
    }

    if (filters.readinessStatus) {
      query.andWhere('checklist.readinessStatus = :readinessStatus', {
        readinessStatus: filters.readinessStatus,
      });
    }

    if (filters.customsStatus) {
      query.andWhere('checklist.customsStatus = :customsStatus', {
        customsStatus: filters.customsStatus,
      });
    }

    if (filters.orderId) {
      query.andWhere('checklist.orderId = :orderId', {
        orderId: filters.orderId,
      });
    }

    const [checklists, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();

    return paginate(
      checklists.map((checklist) => this.toExportReadinessResponse(checklist)),
      total,
      filters,
    );
  }

  async findExportReadiness(actor: Actor, id: string) {
    const checklist = await this.exportReadinessRepository.findOne({
      where: { id },
      relations: ['exporter', 'license', 'order', 'mineralPassport'],
    });

    if (!checklist) {
      throw new NotFoundException('Export readiness checklist not found');
    }

    this.assertCanAccessExportReadiness(actor, checklist);
    return this.toExportReadinessResponse(checklist);
  }

  async updateExportReadiness(
    actor: Actor,
    id: string,
    dto: UpdateExportReadinessChecklistDto,
  ) {
    const checklist = await this.exportReadinessRepository.findOne({
      where: { id },
    });
    if (!checklist) {
      throw new NotFoundException('Export readiness checklist not found');
    }

    this.assertCanAccessExportReadiness(actor, checklist);
    if (dto.licenseId) {
      await this.assertCanUseLicense(
        actor,
        dto.licenseId,
        checklist.exporterUserId,
      );
    }

    Object.assign(checklist, {
      orderId: dto.orderId !== undefined ? dto.orderId : checklist.orderId,
      mineralPassportId:
        dto.mineralPassportId !== undefined
          ? dto.mineralPassportId
          : checklist.mineralPassportId,
      licenseId:
        dto.licenseId !== undefined ? dto.licenseId : checklist.licenseId,
      exportPermitDocumentId:
        dto.exportPermitDocumentId !== undefined
          ? dto.exportPermitDocumentId
          : checklist.exportPermitDocumentId,
      assayDocumentId:
        dto.assayDocumentId !== undefined
          ? dto.assayDocumentId
          : checklist.assayDocumentId,
      invoiceDocumentId:
        dto.invoiceDocumentId !== undefined
          ? dto.invoiceDocumentId
          : checklist.invoiceDocumentId,
      customsStatus: dto.customsStatus ?? checklist.customsStatus,
      carrierReference:
        dto.carrierReference !== undefined
          ? dto.carrierReference
          : checklist.carrierReference,
      blockingIssues: dto.blockingIssues ?? checklist.blockingIssues,
      metadata: dto.metadata !== undefined ? dto.metadata : checklist.metadata,
      readinessStatus: this.isReviewer(actor)
        ? checklist.readinessStatus
        : ExportReadinessStatus.DRAFT,
    });

    const saved = await this.exportReadinessRepository.save(checklist);
    this.auditLogService.log({
      userId: actor.id,
      action: 'export_readiness.update',
      resource: 'export_readiness_checklist',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto) },
    });
    return this.findExportReadiness(actor, saved.id);
  }

  async reviewExportReadiness(
    actor: Actor,
    id: string,
    dto: ReviewExportReadinessChecklistDto,
  ) {
    if (!this.isReviewer(actor)) {
      throw new ForbiddenException(
        'Only admins or government users can review export readiness',
      );
    }

    const checklist = await this.exportReadinessRepository.findOne({
      where: { id },
    });
    if (!checklist) {
      throw new NotFoundException('Export readiness checklist not found');
    }

    checklist.readinessStatus = dto.readinessStatus;
    if (dto.customsStatus) checklist.customsStatus = dto.customsStatus;
    if (dto.blockingIssues) checklist.blockingIssues = dto.blockingIssues;
    checklist.reviewNotes = dto.reviewNotes || null;
    checklist.reviewedBy = actor.id;
    checklist.reviewedAt = new Date();

    const saved = await this.exportReadinessRepository.save(checklist);
    this.auditLogService.log({
      userId: actor.id,
      action: 'export_readiness.review',
      resource: 'export_readiness_checklist',
      resourceId: saved.id,
      metadata: {
        readinessStatus: saved.readinessStatus,
        customsStatus: saved.customsStatus,
      },
    });
    return this.findExportReadiness(actor, saved.id);
  }

  async findCases(actor: Actor, filters: ComplianceCaseFilterDto) {
    const query = this.caseRepository
      .createQueryBuilder('complianceCase')
      .leftJoinAndSelect('complianceCase.site', 'site')
      .leftJoinAndSelect('site.operator', 'operator')
      .leftJoinAndSelect('operator.user', 'operatorUser')
      .leftJoinAndSelect('complianceCase.subjectUser', 'subjectUser')
      .leftJoinAndSelect('complianceCase.assignee', 'assignee')
      .orderBy('complianceCase.createdAt', 'DESC');

    if (!this.isReviewer(actor)) {
      query.where(
        '(complianceCase.subjectUserId = :userId OR operator.userId = :userId)',
        { userId: actor.id },
      );
    }

    if (filters.status) {
      query.andWhere('complianceCase.status = :status', {
        status: filters.status,
      });
    }

    if (filters.severity) {
      query.andWhere('complianceCase.severity = :severity', {
        severity: filters.severity,
      });
    }

    if (filters.caseType) {
      query.andWhere('complianceCase.caseType ILIKE :caseType', {
        caseType: `%${filters.caseType}%`,
      });
    }

    if (filters.siteId) {
      query.andWhere('complianceCase.siteId = :siteId', {
        siteId: filters.siteId,
      });
    }

    const [cases, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();

    return paginate(
      cases.map((complianceCase) => this.toCaseResponse(complianceCase)),
      total,
      filters,
    );
  }

  async findCase(actor: Actor, id: string) {
    const complianceCase = await this.caseRepository.findOne({
      where: { id },
      relations: [
        'site',
        'site.operator',
        'site.operator.user',
        'subjectUser',
        'assignee',
      ],
    });

    if (!complianceCase) {
      throw new NotFoundException('Compliance case not found');
    }

    this.assertCanAccessCase(actor, complianceCase);
    return this.toCaseResponse(complianceCase);
  }

  async updateCase(actor: Actor, id: string, dto: UpdateComplianceCaseDto) {
    if (!this.isReviewer(actor)) {
      throw new ForbiddenException(
        'Only admins or government users can update compliance cases',
      );
    }

    const complianceCase = await this.caseRepository.findOne({ where: { id } });
    if (!complianceCase)
      throw new NotFoundException('Compliance case not found');

    Object.assign(complianceCase, {
      severity: dto.severity ?? complianceCase.severity,
      status: dto.status ?? complianceCase.status,
      assignedTo:
        dto.assignedTo !== undefined
          ? dto.assignedTo
          : complianceCase.assignedTo,
      findings: dto.findings ?? complianceCase.findings,
      requiredActions: dto.requiredActions ?? complianceCase.requiredActions,
      dueDate: dto.dueDate !== undefined ? dto.dueDate : complianceCase.dueDate,
      inspectionScheduledAt:
        dto.inspectionScheduledAt !== undefined
          ? dto.inspectionScheduledAt
            ? new Date(dto.inspectionScheduledAt)
            : null
          : complianceCase.inspectionScheduledAt,
      inspectorName:
        dto.inspectorName !== undefined
          ? dto.inspectorName
          : complianceCase.inspectorName,
      inspectionNotes:
        dto.inspectionNotes !== undefined
          ? dto.inspectionNotes
          : complianceCase.inspectionNotes,
    });

    if (
      dto.status === ComplianceCaseStatus.CLOSED ||
      dto.status === ComplianceCaseStatus.RESOLVED
    ) {
      complianceCase.closedAt = complianceCase.closedAt || new Date();
    }

    if (dto.inspectionScheduledAt && !dto.status) {
      complianceCase.status = ComplianceCaseStatus.INSPECTION_SCHEDULED;
    }

    const saved = await this.caseRepository.save(complianceCase);
    this.auditLogService.log({
      userId: actor.id,
      action: 'compliance_case.update',
      resource: 'compliance_case',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto), status: saved.status },
    });
    return this.findCase(actor, saved.id);
  }

  private isReviewer(actor: Actor) {
    return actor.role === UserRole.ADMIN || actor.role === UserRole.GOVERNMENT;
  }

  private async assertUserExists(userId: string) {
    const exists = await this.userRepository.exist({ where: { id: userId } });
    if (!exists) throw new NotFoundException('User not found');
  }

  private async assertSiteExists(siteId: string) {
    const exists = await this.mineSiteRepository.exist({
      where: { id: siteId },
    });
    if (!exists) throw new NotFoundException('Mine site not found');
  }

  private async assertCanUseSite(
    actor: Actor,
    siteId: string,
    holderUserId: string,
  ) {
    const site = await this.mineSiteRepository.findOne({
      where: { id: siteId },
      relations: ['operator'],
    });
    if (!site) throw new NotFoundException('Mine site not found');

    if (!this.isReviewer(actor) && site.operator?.userId !== holderUserId) {
      throw new ForbiddenException(
        'You can only link licenses to your own mine sites',
      );
    }
  }

  private async assertCanUseLicense(
    actor: Actor,
    licenseId: string,
    holderUserId: string,
  ) {
    const license = await this.licenseRepository.findOne({
      where: { id: licenseId },
    });
    if (!license) throw new NotFoundException('License not found');

    if (!this.isReviewer(actor) && license.holderUserId !== holderUserId) {
      throw new ForbiddenException('You can only link your own licenses');
    }
  }

  private assertCanAccessLicense(actor: Actor, license: License) {
    if (this.isReviewer(actor)) return;
    if (license.holderUserId !== actor.id) {
      throw new ForbiddenException('You can only access your own licenses');
    }
  }

  private assertCanAccessCase(actor: Actor, complianceCase: ComplianceCase) {
    if (this.isReviewer(actor)) return;
    const operatorUserId = complianceCase.site?.operator?.userId;
    if (
      complianceCase.subjectUserId !== actor.id &&
      operatorUserId !== actor.id
    ) {
      throw new ForbiddenException(
        'You can only access compliance cases linked to you',
      );
    }
  }

  private assertCanAccessExportReadiness(
    actor: Actor,
    checklist: ExportReadinessChecklist,
  ) {
    if (this.isReviewer(actor)) return;
    if (checklist.exporterUserId !== actor.id) {
      throw new ForbiddenException(
        'You can only access your own export readiness checklists',
      );
    }
  }

  private assertCanAccessEsgObligation(
    actor: Actor,
    obligation: EsgObligation,
  ) {
    if (this.isReviewer(actor)) return;
    if (obligation.responsibleUserId !== actor.id) {
      throw new ForbiddenException(
        'You can only access ESG obligations assigned to you',
      );
    }
  }

  private assertCanAccessAmlKybRiskProfile(
    actor: Actor,
    profile: AmlKybRiskProfile,
  ) {
    if (this.isReviewer(actor)) return;
    if (profile.userId !== actor.id) {
      throw new ForbiddenException(
        'You can only access AML/KYB profiles assigned to you',
      );
    }
  }

  private async enrichAmlKybRiskProfileInput(
    userId: string,
    input: {
      actorType: AmlKybActorType;
      beneficialOwnerSummary?: string | null;
      beneficialOwnerDocumentIds?: string[];
      scumlRegistrationStatus?: ScumlRegistrationStatus;
      scumlDocumentIds?: string[];
      sourceOfFundsNotes?: string | null;
      sourceOfMineralsNotes?: string | null;
      riskTier?: AmlKybRiskTier;
      riskReasons?: string[];
      riskIndicators?: string[];
    },
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const indicators = new Set(input.riskIndicators || []);
    const reasons = new Set(input.riskReasons || []);
    const requiresScuml = [
      AmlKybActorType.BUYER,
      AmlKybActorType.EXPORTER,
      AmlKybActorType.BUYING_CENTER,
      AmlKybActorType.HIGH_VALUE_ACTOR,
      AmlKybActorType.INVESTOR,
    ].includes(input.actorType);

    if (user.verificationStatus !== VerificationStatus.VERIFIED) {
      indicators.add('kyc_not_verified');
      reasons.add('Actor identity has not been fully verified.');
    }
    if (!input.beneficialOwnerSummary?.trim()) {
      indicators.add('missing_beneficial_owner_summary');
      reasons.add('Beneficial ownership summary is missing.');
    }
    if ((input.beneficialOwnerDocumentIds || []).length === 0) {
      indicators.add('missing_beneficial_owner_documents');
    }
    if (
      requiresScuml &&
      input.scumlRegistrationStatus !== ScumlRegistrationStatus.REGISTERED
    ) {
      indicators.add('scuml_registration_not_confirmed');
      reasons.add('SCUML-style registration evidence is not confirmed.');
    }
    if (!input.sourceOfFundsNotes?.trim()) {
      indicators.add('missing_source_of_funds');
    }
    if (
      [
        AmlKybActorType.EXPORTER,
        AmlKybActorType.BUYING_CENTER,
        AmlKybActorType.MINER,
        AmlKybActorType.HIGH_VALUE_ACTOR,
      ].includes(input.actorType) &&
      !input.sourceOfMineralsNotes?.trim()
    ) {
      indicators.add('missing_source_of_minerals');
    }

    const approvedLicenseCount = await this.licenseRepository.count({
      where: { holderUserId: userId, status: LicenseStatus.APPROVED },
    });
    if (
      [
        AmlKybActorType.EXPORTER,
        AmlKybActorType.BUYING_CENTER,
        AmlKybActorType.MINER,
        AmlKybActorType.HIGH_VALUE_ACTOR,
      ].includes(input.actorType) &&
      approvedLicenseCount === 0
    ) {
      indicators.add('missing_approved_license');
      reasons.add('No approved mineral title or trade permit is linked.');
    }

    const riskTier =
      input.riskTier || this.resolveAmlRiskTier(Array.from(indicators));

    return {
      scumlRegistrationStatus: input.scumlRegistrationStatus,
      riskTier,
      riskIndicators: Array.from(indicators),
      riskReasons: Array.from(reasons),
    };
  }

  private resolveAmlRiskTier(indicators: string[]) {
    if (
      indicators.includes('kyc_not_verified') ||
      indicators.includes('missing_approved_license')
    ) {
      return AmlKybRiskTier.HIGH;
    }
    if (
      indicators.includes('scuml_registration_not_confirmed') ||
      indicators.includes('missing_beneficial_owner_summary')
    ) {
      return AmlKybRiskTier.MEDIUM;
    }
    return AmlKybRiskTier.LOW;
  }

  private isExportPermit(licenseType: LicenseType) {
    return licenseType === LicenseType.MINERAL_EXPORT_PERMIT;
  }

  private resolveRenewalStatus(expiryDate: string) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry < 0) return LicenseRenewalStatus.IN_PROGRESS;
    if (daysUntilExpiry <= 60) return LicenseRenewalStatus.DUE_SOON;
    return LicenseRenewalStatus.NOT_DUE;
  }

  private toLicenseResponse(license: License) {
    const expiry = new Date(license.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      ...license,
      isExportPermit: this.isExportPermit(license.licenseType),
      holder: license.holder
        ? {
            id: license.holder.id,
            name: license.holder.name || null,
            email: license.holder.email,
            role: license.holder.role,
          }
        : null,
      site: license.site
        ? {
            id: license.site.id,
            name: license.site.name,
            state: license.site.state,
            lga: license.site.lga || null,
            operatorId: license.site.operatorId,
            operatorName: license.site.operator?.companyName || null,
          }
        : null,
      expiry: {
        daysUntilExpiry,
        isExpired: daysUntilExpiry < 0,
        isDueSoon: daysUntilExpiry >= 0 && daysUntilExpiry <= 60,
      },
    };
  }

  private toCaseResponse(complianceCase: ComplianceCase) {
    return {
      ...complianceCase,
      site: complianceCase.site
        ? {
            id: complianceCase.site.id,
            name: complianceCase.site.name,
            state: complianceCase.site.state,
            lga: complianceCase.site.lga || null,
            operatorId: complianceCase.site.operatorId,
            operatorName: complianceCase.site.operator?.companyName || null,
          }
        : null,
      subjectUser: complianceCase.subjectUser
        ? {
            id: complianceCase.subjectUser.id,
            name: complianceCase.subjectUser.name || null,
            email: complianceCase.subjectUser.email,
          }
        : null,
      assignee: complianceCase.assignee
        ? {
            id: complianceCase.assignee.id,
            name: complianceCase.assignee.name || null,
            email: complianceCase.assignee.email,
          }
        : null,
    };
  }

  private toExportReadinessResponse(checklist: ExportReadinessChecklist) {
    return {
      ...checklist,
      exporter: checklist.exporter
        ? {
            id: checklist.exporter.id,
            name: checklist.exporter.name || null,
            email: checklist.exporter.email,
            role: checklist.exporter.role,
          }
        : null,
      license: checklist.license
        ? {
            id: checklist.license.id,
            licenseNumber: checklist.license.licenseNumber,
            licenseType: checklist.license.licenseType,
            status: checklist.license.status,
            expiryDate: checklist.license.expiryDate,
          }
        : null,
      order: checklist.order
        ? {
            id: checklist.order.id,
            status: checklist.order.status,
            totalAmount: checklist.order.totalAmount,
          }
        : null,
      mineralPassport: checklist.mineralPassport
        ? {
            id: checklist.mineralPassport.id,
            passportNumber: checklist.mineralPassport.passportNumber,
            status: checklist.mineralPassport.status,
          }
        : null,
      completeness: {
        hasOrder: Boolean(checklist.orderId),
        hasPassport: Boolean(checklist.mineralPassportId),
        hasLicense: Boolean(checklist.licenseId),
        hasExportPermit: Boolean(checklist.exportPermitDocumentId),
        hasAssay: Boolean(checklist.assayDocumentId),
        hasInvoice: Boolean(checklist.invoiceDocumentId),
        hasCarrierReference: Boolean(checklist.carrierReference),
        hasNoBlockingIssues: checklist.blockingIssues.length === 0,
      },
    };
  }

  private toEsgObligationResponse(obligation: EsgObligation) {
    const dueDate = obligation.dueDate ? new Date(obligation.dueDate) : null;
    const daysUntilDue = dueDate
      ? Math.ceil(
          (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        )
      : null;

    return {
      ...obligation,
      responsibleUser: obligation.responsibleUser
        ? {
            id: obligation.responsibleUser.id,
            name: obligation.responsibleUser.name || null,
            email: obligation.responsibleUser.email,
            role: obligation.responsibleUser.role,
          }
        : null,
      site: obligation.site
        ? {
            id: obligation.site.id,
            name: obligation.site.name,
            state: obligation.site.state,
            lga: obligation.site.lga || null,
            operatorName: obligation.site.operator?.companyName || null,
          }
        : null,
      license: obligation.license
        ? {
            id: obligation.license.id,
            licenseNumber: obligation.license.licenseNumber,
            licenseType: obligation.license.licenseType,
            status: obligation.license.status,
          }
        : null,
      due: {
        daysUntilDue,
        isOverdue:
          daysUntilDue !== null &&
          daysUntilDue < 0 &&
          ![
            EsgObligationStatus.APPROVED,
            EsgObligationStatus.FULFILLED,
            EsgObligationStatus.WAIVED,
          ].includes(obligation.status),
      },
    };
  }

  private toAmlKybRiskProfileResponse(profile: AmlKybRiskProfile) {
    return {
      ...profile,
      user: profile.user
        ? {
            id: profile.user.id,
            name: profile.user.name || null,
            email: profile.user.email,
            role: profile.user.role,
            verificationStatus: profile.user.verificationStatus,
          }
        : null,
      reviewer: profile.reviewer
        ? {
            id: profile.reviewer.id,
            name: profile.reviewer.name || null,
            email: profile.reviewer.email,
            role: profile.reviewer.role,
          }
        : null,
    };
  }
}
