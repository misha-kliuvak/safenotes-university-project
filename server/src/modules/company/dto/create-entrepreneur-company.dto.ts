import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { CreateCompanyCoreDto } from '@/modules/company/dto/create-company-core.dto';
import { CompanyType } from '@/modules/company/enums';

export class CreateEntrepreneurCompanyDto extends OmitType(
  CreateCompanyCoreDto,
  ['type'],
) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    default: CompanyType.ENTREPRENEUR,
    nullable: false,
  })
  readonly type: CompanyType.ENTREPRENEUR;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  readonly stateOfIncorporation?: string;
}
