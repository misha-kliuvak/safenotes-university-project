import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { TokenBlacklistEntity } from '@/modules/token/entity/token-blacklist.entity';

@InjectEntity(TokenBlacklistEntity)
export class TokenBlacklistRepository extends BaseRepository<TokenBlacklistEntity> {
  constructor(entity) {
    super(entity);
  }
}
