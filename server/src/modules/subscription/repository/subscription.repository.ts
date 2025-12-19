import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { IFindOptions } from '@/modules/database/types';
import { Op } from 'sequelize';
import { SubscriptionStatus } from '@/modules/subscription/enums';

@InjectEntity(SubscriptionEntity)
export class SubscriptionRepository extends BaseRepository<SubscriptionEntity> {
  getByUserId(userId: string, options?: IFindOptions) {
    return super.getAll({
      where: { userId },
      ...options,
    });
  }

  getActiveByUserId(userId: string, options?: IFindOptions) {
    return super.getOne({
      where: {
        userId,
        endAt: { [Op.gte]: new Date() },
        status: SubscriptionStatus.ACTIVE,
      },
      ...options,
    });
  }

  getByStripeSubscriptionId(
    stripeSubscriptionId: string,
    options?: IFindOptions,
  ) {
    return super.getOne({
      where: { stripeSubscriptionId },
      ...options,
    });
  }
}
