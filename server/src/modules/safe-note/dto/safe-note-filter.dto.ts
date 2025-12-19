import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { SafeNoteStatus } from '@/modules/safe-note/enums';
import { toBoolean } from '@/shared/utils';
import { BaseFiltersDto } from '@/modules/database/dto/base-filters.dto';

export class SafeNoteFilterDto extends BaseFiltersDto {
  @ApiProperty({
    description: 'Filter by entrepreneur company id',
    nullable: true,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  entrepreneurCompanyId?: string;

  @ApiProperty({
    description: 'Filter by angel company id',
    nullable: true,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  angelCompanyId?: string;

  @ApiProperty({
    description: 'Filter by paid status',
    nullable: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  paid?: boolean;

  @ApiProperty({
    description: 'Filter by safe note status',
    nullable: true,
    required: false,
    isArray: true,
    enum: SafeNoteStatus,
    example: [SafeNoteStatus.SENT, SafeNoteStatus.SIGNED],
  })
  @IsEnum(SafeNoteStatus, { each: true })
  @IsOptional()
  status?: SafeNoteStatus[];

  @ApiProperty({
    description: 'Filter by mfn status',
    nullable: true,
    required: false,
  })
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  @IsOptional()
  mfn?: boolean;
}
