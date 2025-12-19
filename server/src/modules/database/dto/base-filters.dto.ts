import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { toBoolean } from '@/shared/utils';

export class BaseFiltersDto {
  @ApiProperty({
    description: 'Deleted entities only',
    nullable: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  isDeleted?: boolean;

  @ApiProperty({
    description: 'With deleted entities',
    nullable: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  includeDeleted?: boolean;
}
