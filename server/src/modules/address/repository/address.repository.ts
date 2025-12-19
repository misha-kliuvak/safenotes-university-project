import { AddressEntity } from '@/modules/address/entity/address.entity';
import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';

@InjectEntity(AddressEntity)
export class AddressRepository extends BaseRepository<AddressEntity> {
  constructor(entity) {
    super(entity);
  }
}
