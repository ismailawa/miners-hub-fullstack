import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsNotEmpty,
  IsArray,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateListingDto {
  @IsNotEmpty()
  @IsString()
  mineralType!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @IsString()
  gradePurity?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(['buy_now', 'auction'])
  listingType?: 'buy_now' | 'auction';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  moisturePercentage?: number;

  @IsOptional()
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  images?: string[];
}

export class ListingFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  mineralType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(['buy_now', 'auction'])
  listingType?: 'buy_now' | 'auction';
}
