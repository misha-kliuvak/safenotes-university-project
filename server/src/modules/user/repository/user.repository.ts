import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { IFindOptions } from '@/modules/database/types';
import { UserEntity } from '@/modules/user/entity/user.entity';

@InjectEntity(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
  async getByEmail(
    email: string,
    options?: IFindOptions,
  ): Promise<UserEntity | null> {
    return this.getOne({
      where: {
        email,
      },
      ...options,
    });
  }

  async getActiveByEmail(
    email: string,
    options?: IFindOptions,
  ): Promise<UserEntity | null> {
    return this.getOne({
      where: {
        email,
        active: true,
      },
      ...options,
    });
  }
}
