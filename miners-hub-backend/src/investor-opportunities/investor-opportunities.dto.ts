import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  InvestorOpportunityInquiryStatus,
  InvestorOpportunityRiskRating,
  InvestorOpportunityStage,
  InvestorOpportunityStatus,
} from '../entities';
import { PaginationDto } from '../common/dto/pagination.dto';

class DueDiligenceDocumentDto {
  @IsString()
  title!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  restricted?: boolean;
}

export class CreateInvestorOpportunityDto {
  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @IsString()
  title!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  mineralFocus!: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  capitalRequired?: number | null;

  @IsString()
  investmentType!: string;

  @IsOptional()
  @IsEnum(InvestorOpportunityStage)
  stage?: InvestorOpportunityStage;

  @IsOptional()
  @IsEnum(InvestorOpportunityRiskRating)
  riskRating?: InvestorOpportunityRiskRating;

  @IsOptional()
  @IsString()
  licenseStatus?: string | null;

  @IsString()
  summary!: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DueDiligenceDocumentDto)
  dueDiligenceDocuments?: DueDiligenceDocumentDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskIndicators?: string[];

  @IsOptional()
  @IsBoolean()
  analyticsSubscriptionEnabled?: boolean;

  @IsOptional()
  @IsEnum(InvestorOpportunityStatus)
  status?: InvestorOpportunityStatus;
}

export class UpdateInvestorOpportunityDto {
  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  mineralFocus?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  capitalRequired?: number | null;

  @IsOptional()
  @IsString()
  investmentType?: string;

  @IsOptional()
  @IsEnum(InvestorOpportunityStage)
  stage?: InvestorOpportunityStage;

  @IsOptional()
  @IsEnum(InvestorOpportunityRiskRating)
  riskRating?: InvestorOpportunityRiskRating;

  @IsOptional()
  @IsString()
  licenseStatus?: string | null;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DueDiligenceDocumentDto)
  dueDiligenceDocuments?: DueDiligenceDocumentDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskIndicators?: string[];

  @IsOptional()
  @IsBoolean()
  analyticsSubscriptionEnabled?: boolean;

  @IsOptional()
  @IsEnum(InvestorOpportunityStatus)
  status?: InvestorOpportunityStatus;
}

export class InvestorOpportunityFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  mineral?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(InvestorOpportunityRiskRating)
  riskRating?: InvestorOpportunityRiskRating;

  @IsOptional()
  @IsEnum(InvestorOpportunityStage)
  stage?: InvestorOpportunityStage;

  @IsOptional()
  @IsString()
  licenseStatus?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minCapital?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxCapital?: number;

  @IsOptional()
  @IsEnum(InvestorOpportunityStatus)
  status?: InvestorOpportunityStatus;
}

export class CreateInvestorOpportunityInquiryDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  investmentRange?: string | null;

  @IsOptional()
  @IsString()
  contactPreference?: string | null;

  @IsOptional()
  @IsBoolean()
  dueDiligenceConsent?: boolean;

  @IsOptional()
  @IsBoolean()
  analyticsSubscriptionInterest?: boolean;
}

export class UpdateInvestorOpportunityInquiryDto {
  @IsOptional()
  @IsEnum(InvestorOpportunityInquiryStatus)
  status?: InvestorOpportunityInquiryStatus;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
