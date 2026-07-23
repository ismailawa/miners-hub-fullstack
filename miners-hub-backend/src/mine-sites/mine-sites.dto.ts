import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MineSiteRiskLevel,
  MineSiteStatus,
} from '../entities/mine-site.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateMineSiteDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsUUID()
  operatorId?: string;

  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @IsArray()
  @IsString({ each: true })
  mineralTypes!: string[];

  @IsNotEmpty()
  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  lga?: string | null;

  @IsOptional()
  @IsString()
  community?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number | null;

  @IsOptional()
  @IsObject()
  boundaryPolygon?: Record<string, any> | null;

  @IsOptional()
  @IsEnum(MineSiteStatus)
  siteStatus?: MineSiteStatus;

  @IsOptional()
  @IsEnum(MineSiteRiskLevel)
  riskLevel?: MineSiteRiskLevel;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  documentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  productionReportIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  complianceCaseIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  environmentalRecordIds?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

export class UpdateMineSiteDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  operatorId?: string;

  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mineralTypes?: string[];

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  lga?: string | null;

  @IsOptional()
  @IsString()
  community?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number | null;

  @IsOptional()
  @IsObject()
  boundaryPolygon?: Record<string, any> | null;

  @IsOptional()
  @IsEnum(MineSiteStatus)
  siteStatus?: MineSiteStatus;

  @IsOptional()
  @IsEnum(MineSiteRiskLevel)
  riskLevel?: MineSiteRiskLevel;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  documentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  productionReportIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  complianceCaseIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  environmentalRecordIds?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

export class MineSiteFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  mineralType?: string;

  @IsOptional()
  @IsEnum(MineSiteStatus)
  siteStatus?: MineSiteStatus;

  @IsOptional()
  @IsEnum(MineSiteRiskLevel)
  riskLevel?: MineSiteRiskLevel;

  @IsOptional()
  @IsUUID()
  operatorId?: string;
}
