import {
  IsArray,
  IsBoolean,
  IsEnum,
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
  EnvironmentalRecordStatus,
  EnvironmentalRecordType,
  EnvironmentalSeverity,
} from '../entities/environmental-record.entity';

export class CreateEnvironmentalRecordDto {
  @IsUUID()
  siteId!: string;

  @IsEnum(EnvironmentalRecordType)
  recordType!: EnvironmentalRecordType;

  @IsOptional()
  @IsEnum(EnvironmentalSeverity)
  severity?: EnvironmentalSeverity;

  @IsString()
  description!: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Type(() => Number)
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Type(() => Number)
  longitude?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];

  @IsOptional()
  @IsUUID()
  assignedTo?: string | null;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  remediationActions?: Array<Record<string, any>>;

  @IsOptional()
  @IsBoolean()
  communityVisible?: boolean;

  @IsOptional()
  @IsString()
  privateNotes?: string | null;
}

export class UpdateEnvironmentalRecordDto {
  @IsOptional()
  @IsEnum(EnvironmentalRecordStatus)
  status?: EnvironmentalRecordStatus;

  @IsOptional()
  @IsEnum(EnvironmentalSeverity)
  severity?: EnvironmentalSeverity;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];

  @IsOptional()
  @IsUUID()
  assignedTo?: string | null;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  remediationActions?: Array<Record<string, any>>;

  @IsOptional()
  @IsBoolean()
  communityVisible?: boolean;

  @IsOptional()
  @IsString()
  privateNotes?: string | null;
}

export class EnvironmentalRecordFilterDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsEnum(EnvironmentalRecordType)
  recordType?: EnvironmentalRecordType;

  @IsOptional()
  @IsEnum(EnvironmentalSeverity)
  severity?: EnvironmentalSeverity;

  @IsOptional()
  @IsEnum(EnvironmentalRecordStatus)
  status?: EnvironmentalRecordStatus;
}
