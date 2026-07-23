import { IsDateString, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class RevenueAnalyticsFilterDto {
  @IsOptional()
  @IsIn(['30d', '90d', 'ytd', '12m', 'custom'])
  period?: '30d' | '90d' | 'ytd' | '12m' | 'custom';

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  mineral?: string;

  @IsOptional()
  @IsString()
  lga?: string;

  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
