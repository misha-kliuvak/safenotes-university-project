import { CreateCompanyUserDto } from '@/modules/company/dto/create-company-user.dto';
import { CompanyUserEntity } from '@/modules/company/entity/company-user.entity';
import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { ICreateOptions } from '@/modules/database/types';

@InjectEntity(CompanyUserEntity)
export class CompanyUserRepository extends BaseRepository<CompanyUserEntity> {
  constructor(model) {
    super(model);
  }

  /**
   * The function update Company User if it exists and create if not
   * @param data
   * @param options
   */
  async createOrUpdate(
    options: any,
    data: CreateCompanyUserDto,
  ): Promise<CompanyUserEntity> {
    const companyUser = await this.getOne(options);

    if (companyUser) {
      return this.updateById(companyUser.id, data);
    }

    return this.create(data);
  }
}
