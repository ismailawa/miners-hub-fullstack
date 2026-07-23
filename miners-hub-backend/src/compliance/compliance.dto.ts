import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  AmlKybActorType,
  AmlKybReviewStatus,
  AmlKybRiskTier,
  ScumlRegistrationStatus,
  SuspiciousActivityStatus,
} from '../entities/aml-kyb-risk-profile.entity';
import {
  ComplianceCaseSeverity,
  ComplianceCaseStatus,
} from '../entities/compliance-case.entity';
import {
  EsgObligationStatus,
  EsgObligationType,
} from '../entities/esg-obligation.entity';
import {
  LicenseType,
  LicenseRenewalStatus,
  LicenseStatus,
} from '../entities/license.entity';
import {
  ExportCustomsStatus,
  ExportReadinessStatus,
} from '../entities/export-readiness-checklist.entity';

export class CreateLicenseDto {
  @IsOptional()
  @IsUUID()
  holderUserId?: string;

  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @IsNotEmpty()
  @IsString()
  licenseNumber!: string;

  @IsNotEmpty()
  @IsEnum(LicenseType)
  licenseType!: LicenseType;

  @IsNotEmpty()
  @IsString()
  issuingAuthority!: string;

  @IsDateString()
  issueDate!: string;

  @IsDateString()
  expiryDate!: string;

  @IsOptional()
  @IsNumber()
  annualServiceFee?: number | null;

  @IsOptional()
  @IsDateString()
  serviceFeePaidUntil?: string | null;

  @IsOptional()
  @IsDateString()
  applicationPriorityDate?: string | null;

  @IsOptional()
  @IsString()
  permitShipmentReference?: string | null;

  @IsOptional()
  @IsString()
  issuingOffice?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  documentIds?: string[];
}

export class UpdateLicenseDto {
  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;

  @IsOptional()
  @IsString()
  issuingAuthority?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsNumber()
  annualServiceFee?: number | null;

  @IsOptional()
  @IsDateString()
  serviceFeePaidUntil?: string | null;

  @IsOptional()
  @IsDateString()
  applicationPriorityDate?: string | null;

  @IsOptional()
  @IsString()
  permitShipmentReference?: string | null;

  @IsOptional()
  @IsString()
  issuingOffice?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;

  @IsOptional()
  @IsEnum(LicenseRenewalStatus)
  renewalStatus?: LicenseRenewalStatus;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  documentIds?: string[];
}

export class ReviewLicenseDto {
  @IsEnum(LicenseStatus)
  status!: LicenseStatus;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class LicenseFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LicenseStatus)
  status?: LicenseStatus;

  @IsOptional()
  @IsEnum(LicenseRenewalStatus)
  renewalStatus?: LicenseRenewalStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;
}

export class CreateExportReadinessChecklistDto {
  @IsOptional()
  @IsUUID()
  orderId?: string | null;

  @IsOptional()
  @IsUUID()
  mineralPassportId?: string | null;

  @IsOptional()
  @IsUUID()
  exporterUserId?: string;

  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @IsOptional()
  @IsUUID()
  exportPermitDocumentId?: string | null;

  @IsOptional()
  @IsUUID()
  assayDocumentId?: string | null;

  @IsOptional()
  @IsUUID()
  invoiceDocumentId?: string | null;

  @IsOptional()
  @IsEnum(ExportCustomsStatus)
  customsStatus?: ExportCustomsStatus;

  @IsOptional()
  @IsString()
  carrierReference?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockingIssues?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

export class UpdateExportReadinessChecklistDto {
  @IsOptional()
  @IsUUID()
  orderId?: string | null;

  @IsOptional()
  @IsUUID()
  mineralPassportId?: string | null;

  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @IsOptional()
  @IsUUID()
  exportPermitDocumentId?: string | null;

  @IsOptional()
  @IsUUID()
  assayDocumentId?: string | null;

  @IsOptional()
  @IsUUID()
  invoiceDocumentId?: string | null;

  @IsOptional()
  @IsEnum(ExportCustomsStatus)
  customsStatus?: ExportCustomsStatus;

  @IsOptional()
  @IsString()
  carrierReference?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockingIssues?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

export class ReviewExportReadinessChecklistDto {
  @IsEnum(ExportReadinessStatus)
  readinessStatus!: ExportReadinessStatus;

  @IsOptional()
  @IsEnum(ExportCustomsStatus)
  customsStatus?: ExportCustomsStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockingIssues?: string[];

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class ExportReadinessFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ExportReadinessStatus)
  readinessStatus?: ExportReadinessStatus;

  @IsOptional()
  @IsEnum(ExportCustomsStatus)
  customsStatus?: ExportCustomsStatus;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  exporterUserId?: string;
}

export class CreateEsgObligationDto {
  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @IsOptional()
  @IsUUID()
  responsibleUserId?: string;

  @IsEnum(EsgObligationType)
  obligationType!: EsgObligationType;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(EsgObligationStatus)
  status?: EsgObligationStatus;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  documentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

export class UpdateEsgObligationDto {
  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @IsOptional()
  @IsEnum(EsgObligationType)
  obligationType?: EsgObligationType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  documentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

export class ReviewEsgObligationDto {
  @IsEnum(EsgObligationStatus)
  status!: EsgObligationStatus;

  @IsOptional()
  @IsString()
  reviewNotes?: string | null;
}

export class EsgObligationFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(EsgObligationType)
  obligationType?: EsgObligationType;

  @IsOptional()
  @IsEnum(EsgObligationStatus)
  status?: EsgObligationStatus;

  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsUUID()
  licenseId?: string;

  @IsOptional()
  @IsUUID()
  responsibleUserId?: string;

  @IsOptional()
  @IsDateString()
  dueBefore?: string;
}

export class CreateAmlKybRiskProfileDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsEnum(AmlKybActorType)
  actorType!: AmlKybActorType;

  @IsOptional()
  @IsString()
  businessName?: string | null;

  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string | null;

  @IsOptional()
  @IsString()
  beneficialOwnerSummary?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  beneficialOwnerDocumentIds?: string[];

  @IsOptional()
  @IsString()
  scumlRegistrationNumber?: string | null;

  @IsOptional()
  @IsEnum(ScumlRegistrationStatus)
  scumlRegistrationStatus?: ScumlRegistrationStatus;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  scumlDocumentIds?: string[];

  @IsOptional()
  @IsString()
  sourceOfFundsNotes?: string | null;

  @IsOptional()
  @IsString()
  sourceOfMineralsNotes?: string | null;

  @IsOptional()
  @IsEnum(AmlKybRiskTier)
  riskTier?: AmlKybRiskTier;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskReasons?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskIndicators?: string[];

  @IsOptional()
  @IsEnum(SuspiciousActivityStatus)
  suspiciousActivityStatus?: SuspiciousActivityStatus;

  @IsOptional()
  @IsEnum(AmlKybReviewStatus)
  reviewStatus?: AmlKybReviewStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

export class UpdateAmlKybRiskProfileDto {
  @IsOptional()
  @IsEnum(AmlKybActorType)
  actorType?: AmlKybActorType;

  @IsOptional()
  @IsString()
  businessName?: string | null;

  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string | null;

  @IsOptional()
  @IsString()
  beneficialOwnerSummary?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  beneficialOwnerDocumentIds?: string[];

  @IsOptional()
  @IsString()
  scumlRegistrationNumber?: string | null;

  @IsOptional()
  @IsEnum(ScumlRegistrationStatus)
  scumlRegistrationStatus?: ScumlRegistrationStatus;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  scumlDocumentIds?: string[];

  @IsOptional()
  @IsString()
  sourceOfFundsNotes?: string | null;

  @IsOptional()
  @IsString()
  sourceOfMineralsNotes?: string | null;

  @IsOptional()
  @IsEnum(AmlKybRiskTier)
  riskTier?: AmlKybRiskTier;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskReasons?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskIndicators?: string[];

  @IsOptional()
  @IsEnum(SuspiciousActivityStatus)
  suspiciousActivityStatus?: SuspiciousActivityStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

export class ReviewAmlKybRiskProfileDto {
  @IsEnum(AmlKybReviewStatus)
  reviewStatus!: AmlKybReviewStatus;

  @IsOptional()
  @IsEnum(AmlKybRiskTier)
  riskTier?: AmlKybRiskTier;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskReasons?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskIndicators?: string[];

  @IsOptional()
  @IsEnum(SuspiciousActivityStatus)
  suspiciousActivityStatus?: SuspiciousActivityStatus;

  @IsOptional()
  @IsString()
  reviewNotes?: string | null;
}

export class AmlKybRiskProfileFilterDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(AmlKybActorType)
  actorType?: AmlKybActorType;

  @IsOptional()
  @IsEnum(AmlKybRiskTier)
  riskTier?: AmlKybRiskTier;

  @IsOptional()
  @IsEnum(AmlKybReviewStatus)
  reviewStatus?: AmlKybReviewStatus;

  @IsOptional()
  @IsEnum(SuspiciousActivityStatus)
  suspiciousActivityStatus?: SuspiciousActivityStatus;
}

export class CreateComplianceCaseDto {
  @IsUUID()
  siteId!: string;

  @IsOptional()
  @IsUUID()
  subjectUserId?: string | null;

  @IsNotEmpty()
  @IsString()
  caseType!: string;

  @IsOptional()
  @IsEnum(ComplianceCaseSeverity)
  severity?: ComplianceCaseSeverity;

  @IsOptional()
  @IsUUID()
  assignedTo?: string | null;

  @IsNotEmpty()
  @IsString()
  findings!: string;

  @IsOptional()
  @IsArray()
  requiredActions?: Array<Record<string, any>>;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsDateString()
  inspectionScheduledAt?: string | null;

  @IsOptional()
  @IsString()
  inspectorName?: string | null;

  @IsOptional()
  @IsString()
  inspectionNotes?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateComplianceCaseDto {
  @IsOptional()
  @IsEnum(ComplianceCaseSeverity)
  severity?: ComplianceCaseSeverity;

  @IsOptional()
  @IsEnum(ComplianceCaseStatus)
  status?: ComplianceCaseStatus;

  @IsOptional()
  @IsUUID()
  assignedTo?: string | null;

  @IsOptional()
  @IsString()
  findings?: string;

  @IsOptional()
  @IsArray()
  requiredActions?: Array<Record<string, any>>;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsDateString()
  inspectionScheduledAt?: string | null;

  @IsOptional()
  @IsString()
  inspectorName?: string | null;

  @IsOptional()
  @IsString()
  inspectionNotes?: string | null;
}

export class ComplianceCaseFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ComplianceCaseStatus)
  status?: ComplianceCaseStatus;

  @IsOptional()
  @IsEnum(ComplianceCaseSeverity)
  severity?: ComplianceCaseSeverity;

  @IsOptional()
  @IsString()
  caseType?: string;

  @IsOptional()
  @IsUUID()
  siteId?: string;
}
