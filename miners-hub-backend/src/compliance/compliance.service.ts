import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ComplianceCase,
  ComplianceCaseStatus,
} from '../entities/compliance-case.entity';
import {
  License,
  LicenseRenewalStatus,
  LicenseStatus,
} from '../entities/license.entity';
import { MineSite } from '../entities/mine-site.entity';
import { User, UserRole } from '../entities/user.entity';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { paginate } from '../common/dto/pagination.dto';
import {
  ComplianceCaseFilterDto,
  CreateComplianceCaseDto,
  CreateLicenseDto,
  LicenseFilterDto,
  ReviewLicenseDto,
  UpdateComplianceCaseDto,
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
      throw new ForbiddenException('Only admins or government users can review licenses');
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
      throw new ForbiddenException('Only admins or government users can create compliance cases');
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
      throw new ForbiddenException('Only admins or government users can update compliance cases');
    }

    const complianceCase = await this.caseRepository.findOne({ where: { id } });
    if (!complianceCase) throw new NotFoundException('Compliance case not found');

    Object.assign(complianceCase, {
      severity: dto.severity ?? complianceCase.severity,
      status: dto.status ?? complianceCase.status,
      assignedTo:
        dto.assignedTo !== undefined ? dto.assignedTo : complianceCase.assignedTo,
      findings: dto.findings ?? complianceCase.findings,
      requiredActions:
        dto.requiredActions ?? complianceCase.requiredActions,
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
    const exists = await this.mineSiteRepository.exist({ where: { id: siteId } });
    if (!exists) throw new NotFoundException('Mine site not found');
  }

  private async assertCanUseSite(actor: Actor, siteId: string, holderUserId: string) {
    const site = await this.mineSiteRepository.findOne({
      where: { id: siteId },
      relations: ['operator'],
    });
    if (!site) throw new NotFoundException('Mine site not found');

    if (!this.isReviewer(actor) && site.operator?.userId !== holderUserId) {
      throw new ForbiddenException('You can only link licenses to your own mine sites');
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
      throw new ForbiddenException('You can only access compliance cases linked to you');
    }
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
}
