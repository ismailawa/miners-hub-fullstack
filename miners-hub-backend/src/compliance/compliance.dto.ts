import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  ComplianceCaseSeverity,
  ComplianceCaseStatus,
} from '../entities/compliance-case.entity';
import {
  LicenseRenewalStatus,
  LicenseStatus,
} from '../entities/license.entity';

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
  @IsString()
  licenseType!: string;

  @IsNotEmpty()
  @IsString()
  issuingAuthority!: string;

  @IsDateString()
  issueDate!: string;

  @IsDateString()
  expiryDate!: string;

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
  @IsString()
  licenseType?: string;

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
