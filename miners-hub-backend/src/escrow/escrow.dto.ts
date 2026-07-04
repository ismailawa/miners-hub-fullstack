import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpsertPayoutAccountDto {
  @IsNotEmpty()
  @IsString()
  bankName!: string;

  @IsNotEmpty()
  @IsString()
  bankCode!: string;

  @IsNotEmpty()
  @IsNumberString()
  accountNumber!: string;

  @IsNotEmpty()
  @IsString()
  accountName!: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
