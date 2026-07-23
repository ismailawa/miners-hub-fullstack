import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MineralPassportStatus } from '../entities/mineral-passport.entity';

export class CreateMineralPassportDto {
  @IsOptional()
  @IsUUID()
  minerId?: string;

  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @IsOptional()
  @IsUUID()
  productionReportId?: string | null;

  @IsOptional()
  @IsUUID()
  labResultId?: string | null;

  @IsOptional()
  @IsUUID()
  listingId?: string | null;

  @IsOptional()
  @IsUUID()
  orderId?: string | null;

  @IsOptional()
  @IsUUID()
  shipmentId?: string | null;

  @IsOptional()
  @IsUUID()
  contractId?: string | null;

  @IsOptional()
  @IsUUID()
  escrowTransactionId?: string | null;

  @IsOptional()
  @IsObject()
  snapshot?: Record<string, any>;
}

export class UpdateMineralPassportStatusDto {
  @IsEnum(MineralPassportStatus)
  status!: MineralPassportStatus;

  @IsOptional()
  @IsString()
  reason?: string | null;
}

export class MineralPassportFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(MineralPassportStatus)
  status?: MineralPassportStatus;

  @IsOptional()
  @IsUUID()
  minerId?: string;

  @IsOptional()
  @IsUUID()
  listingId?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;
}
