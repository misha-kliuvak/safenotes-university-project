import { compare, genSalt, hash } from 'bcryptjs';

import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { IFindOptions, IUpdateByIdOptions } from '@/modules/database/types';
import { UserPasswordEntity } from '@/modules/user/entity/user-password.entity';

@InjectEntity(UserPasswordEntity)
export class UserPasswordRepository extends BaseRepository<UserPasswordEntity> {
  public async encryptPassword(password: string, saltRounds = 12) {
    const salt = await genSalt(saltRounds);
    return hash(password, salt);
  }

  public async getPassword(options?: IFindOptions) {
    const entity = await this.getOne({
      ...options,
    });

    return entity?.password || '';
  }

  public async getPasswordByUserEmail(email: string) {
    return this.getPassword({
      where: { email },
    });
  }

  public async getPasswordByUserId(id: string) {
    return this.getPassword({
      where: { id },
    });
  }

  /**
   * Compare user password with one from args
   * @param userId
   * @param password
   */
  public async comparePasswords(userId: string, password: string) {
    const userPassword = await this.getPasswordByUserId(userId);

    return compare(password, userPassword);
  }

  public async savePassword(userId, password, options?: IUpdateByIdOptions) {
    const encrypted = await this.encryptPassword(password);

    return this.updateById(userId, { password: encrypted }, options);
  }
}
