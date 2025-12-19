import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, NotEquals } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Number of max of items per page',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Current page number',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @NotEquals(0)
  page?: number;
}
