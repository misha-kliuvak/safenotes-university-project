import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { PlaidSettingsEntity } from '@/modules/plaid/entity/plaid-settings.entity';
import { PlaidSettingsKey } from '@/modules/plaid/enums';

@InjectEntity(PlaidSettingsEntity)
export class PlaidSettingsRepository extends BaseRepository<PlaidSettingsEntity> {
  constructor(entity) {
    super(entity);
  }

  async getPlaidLastEventId() {
    return this.getOneOrCreate(
      {
        where: {
          key: PlaidSettingsKey.LAST_EVENT_ID,
        },
      },
      {
        key: PlaidSettingsKey.LAST_EVENT_ID,
        value: '0',
      },
    );
  }

  async setPlaidLastEventId(value: string | number) {
    return this.update(
      {
        value,
      },
      {
        where: {
          key: PlaidSettingsKey.LAST_EVENT_ID,
        },
      },
    );
  }
}
