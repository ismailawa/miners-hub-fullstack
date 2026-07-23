import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  LaboratoryPartnerStatus,
} from '../entities/laboratory-partner.entity';
import { LabResultStatus } from '../entities/lab-result.entity';

export class CreateLaboratoryPartnerDto {
  @IsOptional()
  @IsUUID()
  userId?: string | null;

  @IsNotEmpty()
  @IsString()
  companyName!: string;

  @IsOptional()
  @IsString()
  accreditationNumber?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsEnum(LaboratoryPartnerStatus)
  status?: LaboratoryPartnerStatus;

  @IsOptional()
  @IsEmail()
  contactEmail?: string | null;

  @IsOptional()
  @IsString()
  contactPhone?: string | null;
}

export class UpdateLaboratoryPartnerDto extends CreateLaboratoryPartnerDto {}

export class CreateLabResultDto {
  @IsUUID()
  labId!: string;

  @IsOptional()
  @IsUUID()
  listingId?: string | null;

  @IsOptional()
  @IsUUID()
  productionReportId?: string | null;

  @IsOptional()
  @IsUUID()
  mineralPassportId?: string | null;

  @IsNotEmpty()
  @IsString()
  sampleReference!: string;

  @IsNotEmpty()
  @IsString()
  mineralType!: string;

  @IsOptional()
  @IsString()
  grade?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  assayValue?: number | null;

  @IsOptional()
  @IsString()
  assayUnit?: string | null;

  @IsOptional()
  @IsObject()
  resultPayload?: Record<string, any>;

  @IsOptional()
  @IsString()
  certificateUrl?: string | null;
}

export class UpdateLabResultDto {
  @IsOptional()
  @IsUUID()
  labId?: string;

  @IsOptional()
  @IsUUID()
  listingId?: string | null;

  @IsOptional()
  @IsUUID()
  productionReportId?: string | null;

  @IsOptional()
  @IsUUID()
  mineralPassportId?: string | null;

  @IsOptional()
  @IsString()
  sampleReference?: string;

  @IsOptional()
  @IsString()
  mineralType?: string;

  @IsOptional()
  @IsString()
  grade?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  assayValue?: number | null;

  @IsOptional()
  @IsString()
  assayUnit?: string | null;

  @IsOptional()
  @IsObject()
  resultPayload?: Record<string, any>;

  @IsOptional()
  @IsString()
  certificateUrl?: string | null;
}

export class VerifyLabResultDto {
  @IsEnum(LabResultStatus)
  status!: LabResultStatus.VERIFIED | LabResultStatus.REJECTED;

  @IsOptional()
  @IsString()
  reviewNotes?: string | null;
}

export class LabResultFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LabResultStatus)
  status?: LabResultStatus;

  @IsOptional()
  @IsUUID()
  labId?: string;

  @IsOptional()
  @IsUUID()
  listingId?: string;

  @IsOptional()
  @IsUUID()
  productionReportId?: string;
}
