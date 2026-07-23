import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrustedPartnerStatus } from '../entities/trusted-partner.entity';

export class CreateTrustedPartnerDto {
  @IsString()
  name!: string;

  @IsUrl({ require_tld: false })
  logoUrl!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  websiteUrl?: string | null;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(TrustedPartnerStatus)
  status?: TrustedPartnerStatus;
}

export class UpdateTrustedPartnerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  logoUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  websiteUrl?: string | null;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(TrustedPartnerStatus)
  status?: TrustedPartnerStatus;
}
