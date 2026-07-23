import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { MineralPriceOverrideStatus } from '../entities/mineral-price-override.entity';

export class CreateMineralPriceOverrideDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(24)
  symbol!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  change?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsEnum(MineralPriceOverrideStatus)
  status?: MineralPriceOverrideStatus;
}

export class UpdateMineralPriceOverrideDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  symbol?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  change?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsEnum(MineralPriceOverrideStatus)
  status?: MineralPriceOverrideStatus;
}
