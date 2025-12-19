import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { CompanyPaymentEntity } from '@/modules/company/entity/company-payment.entity';

@InjectEntity(CompanyPaymentEntity)
export class CompanyPaymentRepository extends BaseRepository<CompanyPaymentEntity> {
  constructor(model) {
    super(model);
  }
}
