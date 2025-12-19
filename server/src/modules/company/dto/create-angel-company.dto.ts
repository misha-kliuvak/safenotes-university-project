import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { CreateCompanyCoreDto } from '@/modules/company/dto/create-company-core.dto';
import { AngelInvestorType, CompanyType } from '@/modules/company/enums';

export class CreateAngelCompanyDto extends OmitType(CreateCompanyCoreDto, [
  'type',
]) {
  @ApiProperty({
    type: 'string',
    default: CompanyType.ANGEL,
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly type: CompanyType.ANGEL;

  @ApiProperty({
    description: 'Angel investor type',
    enum: AngelInvestorType,
    required: false,
    nullable: false,
  })
  @IsEnum(AngelInvestorType)
  @IsOptional()
  readonly investorType?: AngelInvestorType;
}
