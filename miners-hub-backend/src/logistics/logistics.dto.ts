import {
  IsArray,
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
  LogisticsProviderStatus,
} from '../entities/logistics-provider.entity';
import { LogisticsQuoteStatus } from '../entities/logistics-quote-request.entity';
import { ShipmentStatus } from '../entities/shipment.entity';

export class CreateLogisticsProviderDto {
  @IsOptional()
  @IsUUID()
  userId?: string | null;

  @IsNotEmpty()
  @IsString()
  companyName!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[];

  @IsOptional()
  @IsEnum(LogisticsProviderStatus)
  status?: LogisticsProviderStatus;

  @IsOptional()
  @IsEmail()
  contactEmail?: string | null;

  @IsOptional()
  @IsString()
  contactPhone?: string | null;
}

export class UpdateLogisticsProviderDto extends CreateLogisticsProviderDto {}

export class CreateQuoteRequestDto {
  @IsOptional()
  @IsUUID()
  orderId?: string | null;

  @IsNotEmpty()
  @IsString()
  origin!: string;

  @IsNotEmpty()
  @IsString()
  destination!: string;

  @IsNotEmpty()
  @IsString()
  commodity!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weight!: number;

  @IsString()
  containerType!: string;

  @IsString()
  contactName!: string;

  @IsEmail()
  contactEmail!: string;
}

export class UpdateQuoteRequestDto {
  @IsOptional()
  @IsEnum(LogisticsQuoteStatus)
  status?: LogisticsQuoteStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quotedAmount?: number | null;

  @IsOptional()
  @IsString()
  quoteNotes?: string | null;
}

export class CreateShipmentDto {
  @IsUUID()
  orderId!: string;

  @IsOptional()
  @IsUUID()
  providerId?: string | null;

  @IsOptional()
  @IsUUID()
  mineralPassportId?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quoteAmount?: number | null;

  @IsString()
  pickupLocation!: string;

  @IsString()
  deliveryLocation!: string;
}

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status!: ShipmentStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  handoffEvidence?: Record<string, any> | null;
}

export class ShipmentFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  providerId?: string;
}

export class QuoteRequestFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LogisticsQuoteStatus)
  status?: LogisticsQuoteStatus;
}
