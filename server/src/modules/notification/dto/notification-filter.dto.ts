import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

import { toBoolean } from '@/shared/utils';

export class NotificationFilterDto {
  @ApiProperty({
    description: 'Filter by read status',
    nullable: true,
    required: false,
    type: 'boolean',
  })
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  @IsOptional()
  read?: boolean;

  @ApiProperty({
    description: 'Filter by company related notification',
    nullable: true,
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
