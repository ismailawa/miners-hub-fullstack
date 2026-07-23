import { IsOptional, IsString, IsObject } from 'class-validator';

export class MetaMapStartDto {
  @IsOptional()
  @IsString()
  identityId?: string;

  @IsOptional()
  @IsString()
  verificationId?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}

export class MetaMapCompleteDto extends MetaMapStartDto {}
