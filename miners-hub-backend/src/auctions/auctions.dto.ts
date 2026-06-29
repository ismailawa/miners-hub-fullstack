import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAuctionDto {
  @IsNotEmpty()
  @IsUUID()
  listingId!: string;

  @IsNotEmpty()
  @IsDateString()
  startTime!: string;

  @IsNotEmpty()
  @IsDateString()
  endTime!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  startingBid!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minimumIncrement?: number;
}

export class PlaceBidDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount!: number;
}
