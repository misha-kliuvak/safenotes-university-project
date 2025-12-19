import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateEntrepreneurCompanyDto } from '@/modules/company/dto/create-entrepreneur-company.dto';

export class UpdateEntrepreneurCompanyDto extends OmitType(
  PartialType(CreateEntrepreneurCompanyDto),
  ['type'],
) {}
