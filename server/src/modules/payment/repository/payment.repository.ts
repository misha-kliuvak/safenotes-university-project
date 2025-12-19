import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { IFindOptions } from '@/modules/database/types';
import { PaymentEntity } from '@/modules/payment/entity/payment.entity';

@InjectEntity(PaymentEntity)
export class PaymentRepository extends BaseRepository<PaymentEntity> {
  constructor(entity) {
    super(entity);
  }

  public getByPaymentIntent(id: string, options?: IFindOptions) {
    return super.getOne({
      where: {
        paymentIntentId: id,
      },
      ...options,
    });
  }
}
