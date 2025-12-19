import { AngelCompanyEntity } from '@/modules/company/entity/angel-company.entity';
import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';

@InjectEntity(AngelCompanyEntity)
export class AngelCompanyRepository extends BaseRepository<AngelCompanyEntity> {
  constructor(model) {
    super(model);
  }
}
