import {
  IsArray,
  IsDateString,
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
import { ProductionReportStatus } from '../entities/production-report.entity';

export class CreateProductionReportDto {
  @IsUUID()
  siteId!: string;

  @IsOptional()
  @IsUUID()
  minerId?: string;

  @IsNotEmpty()
  @IsString()
  mineralType!: string;

  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity!: number;

  @IsNotEmpty()
  @IsString()
  unit!: string;

  @IsOptional()
  @IsString()
  grade?: string | null;

  @IsOptional()
  @IsString()
  destination?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  estimatedValue?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  royaltyRate?: number;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  supportingDocumentIds?: string[];

  @IsOptional()
  @IsEnum(ProductionReportStatus)
  status?: ProductionReportStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;
}

export class UpdateProductionReportDto {
  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsString()
  mineralType?: string;

  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  grade?: string | null;

  @IsOptional()
  @IsString()
  destination?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  estimatedValue?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  royaltyRate?: number;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  supportingDocumentIds?: string[];

  @IsOptional()
  @IsEnum(ProductionReportStatus)
  status?: ProductionReportStatus;
}

export class ReviewProductionReportDto {
  @IsEnum(ProductionReportStatus)
  status!: ProductionReportStatus;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class ProductionReportFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductionReportStatus)
  status?: ProductionReportStatus;

  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsUUID()
  minerId?: string;

  @IsOptional()
  @IsString()
  mineralType?: string;

  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;
}
