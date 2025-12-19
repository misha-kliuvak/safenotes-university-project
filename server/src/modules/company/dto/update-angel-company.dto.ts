import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateAngelCompanyDto } from '@/modules/company/dto/create-angel-company.dto';

export class UpdateAngelCompanyDto extends OmitType(
  PartialType(CreateAngelCompanyDto),
  ['type'],
) {}
