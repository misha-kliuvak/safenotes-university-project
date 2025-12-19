import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

import { CompanyType } from '@/modules/company/enums';
import { BaseFiltersDto } from '@/modules/database/dto/base-filters.dto';

export class CompanyFilterDto extends BaseFiltersDto {
  @ApiProperty({
    description:
      'Filter companies by all only own, or just all companies in which user was invited',
    nullable: true,
    required: false,
  })
  @IsIn(['own', 'invited'])
  @IsOptional()
  shared: boolean;

  @ApiProperty({
    description: 'Filter companies by type',
    nullable: true,
    required: false,
    enum: CompanyType,
    example: 'entrepreneur',
  })
  @IsEnum(CompanyType)
  @IsOptional()
  type: CompanyType;

  @ApiProperty({
    description:
      'Used to calculate summary for entrepreneur companies including this id',
    nullable: true,
    required: false,
  })
  @IsString()
  @IsOptional()
  viaAngelCompany: string;
}
