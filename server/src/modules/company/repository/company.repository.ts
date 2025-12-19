import * as _ from 'lodash';
import { Op } from 'sequelize';

import { AddressEntity } from '@/modules/address/entity/address.entity';
import { companyFilter } from '@/modules/company/company.filter';
import { AngelCompanyEntity } from '@/modules/company/entity/angel-company.entity';
import { CompanyUserEntity } from '@/modules/company/entity/company-user.entity';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { EntrepreneurCompanyEntity } from '@/modules/company/entity/entrepreneur-company.entity';
import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import {
  IFindByIdOptions,
  IFindOptions,
  PredefinedFilters,
} from '@/modules/database/types';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import { SHARED_USER_ATTRIBUTES } from '@/modules/user/attributes';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { InviteStatus, Role } from '@/shared/enums';

@InjectEntity(CompanyEntity)
export class CompanyRepository extends BaseRepository<CompanyEntity> {
  protected predefinedFilters(): PredefinedFilters {
    return companyFilter;
  }

  public async getAll(options?: IFindOptions) {
    return super.getAll({
      include: [
        AddressEntity,
        AngelCompanyEntity,
        EntrepreneurCompanyEntity,
        {
          model: CompanyUserEntity,
          as: 'companyUsers',
          include: [
            {
              model: UserEntity,
              attributes: SHARED_USER_ATTRIBUTES,
            },
          ],
        },
      ],
      ...options,
      where: {
        ...options?.where,
        deletedAt: null,
      },
    });
  }

  public async getAllByUser(userId: string, options?: IFindOptions) {
    return super.getAll({
      ...options,
      where: {
        ...options?.where,
        deletedAt: null,
      },
      include: [
        AddressEntity,
        AngelCompanyEntity,
        EntrepreneurCompanyEntity,
        {
          model: CompanyUserEntity,
          as: 'companyUser',
          include: [
            {
              model: UserEntity,
              attributes: SHARED_USER_ATTRIBUTES,
            },
          ],
          where: {
            userId,
            inviteStatus: {
              [Op.not]: InviteStatus.DECLINED,
            },
            role: {
              [Op.not]: Role.SAFE_RECIPIENT,
            },
          },
        },
        {
          model: CompanyUserEntity,
          as: 'companyUsers',
          include: [
            {
              model: UserEntity,
              attributes: SHARED_USER_ATTRIBUTES,
            },
          ],
        },
      ],
    });
  }

  public async getById(
    companyId: string,
    options?: IFindByIdOptions,
  ): Promise<CompanyEntity | null> {
    return super.getById(companyId, {
      include: [
        AddressEntity,
        AngelCompanyEntity,
        EntrepreneurCompanyEntity,
        {
          model: CompanyUserEntity,
          as: 'companyUsers',
          include: [
            {
              model: UserEntity,
              attributes: SHARED_USER_ATTRIBUTES,
            },
          ],
        },
      ],
      ...options,
      where: {
        ...options?.where,
        deletedAt: null,
      },
    });
  }

  public async getByIdForUser(
    companyId: string,
    userId: string,
    options?: IFindByIdOptions,
  ): Promise<CompanyEntity | null> {
    return super.getById(companyId, {
      include: [
        AddressEntity,
        AngelCompanyEntity,
        EntrepreneurCompanyEntity,
        {
          model: CompanyUserEntity,
          as: 'companyUser',
          required: false,
          include: [
            {
              model: UserEntity,
              attributes: SHARED_USER_ATTRIBUTES,
            },
          ],
          where: {
            userId,
          },
        },
        {
          model: CompanyUserEntity,
          as: 'companyUsers',
          include: [
            {
              model: UserEntity,
              attributes: SHARED_USER_ATTRIBUTES,
            },
          ],
        },
      ],
      ...options,
      where: {
        ...options?.where,
        deletedAt: null,
      },
    });
  }

  public async getMfnHolders(companyId: string, options?: IFindByIdOptions) {
    const company = await super.getById(companyId, {
      include: [
        {
          model: SafeNoteEntity,
          as: 'safeNotes',
          include: [
            {
              model: UserEntity,
              attributes: SHARED_USER_ATTRIBUTES,
            },
          ],
          where: {
            mfn: {
              [Op.eq]: true,
            },
          },
        },
      ],
      ...options,
      where: {
        ...options?.where,
        deletedAt: null,
      },
    });

    if (!company || !company?.safeNotes?.length) return [];

    const recipients = company?.safeNotes.map(
      (safeNote: SafeNoteEntity) => safeNote.recipient,
    );

    return _.uniqBy(recipients, 'email');
  }

  async getDeletedById(id: string, options?: IFindByIdOptions) {
    return super.getById(id, {
      ...options,
      where: { deletedAt: { [Op.not]: null } },
      paranoid: false,
    });
  }
}
