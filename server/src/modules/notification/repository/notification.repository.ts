import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { IFindOptions } from '@/modules/database/types';
import { NotificationEntity } from '@/modules/notification/entity/notification.entity';

@InjectEntity(NotificationEntity)
export class NotificationRepository extends BaseRepository<NotificationEntity> {
  constructor(entity) {
    super(entity);
  }

  getByUserId(userId: string, options?: IFindOptions) {
    return super.getAll({
      where: { userId },
      ...options,
    });
  }
}
