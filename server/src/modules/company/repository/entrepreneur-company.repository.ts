import { EntrepreneurCompanyEntity } from '@/modules/company/entity/entrepreneur-company.entity';
import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';

@InjectEntity(EntrepreneurCompanyEntity)
export class EntrepreneurCompanyRepository extends BaseRepository<EntrepreneurCompanyEntity> {
  constructor(model) {
    super(model);
  }
}
