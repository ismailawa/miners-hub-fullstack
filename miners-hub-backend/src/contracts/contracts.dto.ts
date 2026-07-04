import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractStatus } from '../entities/contract.entity';

export class CreateContractDto {
  @IsNotEmpty()
  @IsUUID()
  party2Id!: string;

  @IsOptional()
  @IsUUID()
  listingId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty()
  @IsString()
  terms!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  value?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class UpdateContractStatusDto {
  @IsNotEmpty()
  @IsEnum(ContractStatus)
  status!: ContractStatus;
}

export class SignContractDto {
  @IsNotEmpty()
  @IsString()
  signature!: string; // Base64 signature image or drawn signature data
}
