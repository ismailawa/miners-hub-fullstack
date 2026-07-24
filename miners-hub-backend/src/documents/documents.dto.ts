import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { DocumentType } from '../entities/document.entity';
import { DocumentReviewStatus } from '../entities/document.entity';

export class UploadDocumentDto {
  @IsNotEmpty()
  @IsEnum(DocumentType)
  type!: DocumentType;

  @IsOptional()
  @IsUUID()
  listingId?: string;

  @IsOptional()
  @IsString()
  uploadCategory?: string;

  @IsOptional()
  @IsString()
  ownerResource?: string;

  @IsOptional()
  @IsUUID()
  ownerResourceId?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  correlationId?: string;
}

export class ReviewDocumentDto {
  @IsNotEmpty()
  @IsEnum(DocumentReviewStatus)
  status!: DocumentReviewStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
