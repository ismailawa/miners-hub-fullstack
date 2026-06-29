import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  /**
   * Optional direct offset (e.g. sent by the frontend as ?limit=12&offset=0).
   * When provided, this takes precedence over the page-based calculation.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  rawOffset?: number;

  get offset(): number {
    if (this.rawOffset !== undefined) return this.rawOffset;
    return (this.page - 1) * this.limit;
  }
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate<T>(
  data: T[],
  total: number,
  pagination: PaginationDto,
): PaginatedResponse<T> {
  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}
