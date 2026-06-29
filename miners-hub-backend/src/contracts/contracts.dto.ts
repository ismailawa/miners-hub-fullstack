import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ContractStatus } from '../entities/contract.entity';

export class CreateContractDto {
  @IsNotEmpty()
  @IsUUID()
  party2Id!: string;

  @IsOptional()
  @IsUUID()
  listingId?: string;

  @IsNotEmpty()
  @IsString()
  terms!: string;
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
