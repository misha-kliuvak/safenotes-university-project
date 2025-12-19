import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Max } from 'class-validator';

import { toBoolean } from '@/shared/utils';

export class UpdateSafeDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  safeAmount: number;

  @IsNumber()
  @IsOptional()
  @Max(100)
  @Type(() => Number)
  discountRate: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  valuationCap: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  mfn?: boolean;

  @IsBoolean()
  @IsOptional()
  draft?: boolean;
}
