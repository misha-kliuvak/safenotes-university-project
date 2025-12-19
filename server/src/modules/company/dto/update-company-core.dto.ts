import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateCompanyCoreDto } from '@/modules/company/dto/create-company-core.dto';

export class UpdateCompanyCoreDto extends OmitType(
  PartialType(CreateCompanyCoreDto),
  ['type', 'teamMembers'],
) {}
