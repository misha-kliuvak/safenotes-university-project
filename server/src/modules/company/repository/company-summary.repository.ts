import { Op } from 'sequelize';

import { companyFilter } from '@/modules/company/company.filter';
import { CompanyFilterDto } from '@/modules/company/dto/company-filter.dto';
import { AngelCompanyEntity } from '@/modules/company/entity/angel-company.entity';
import { CompanySummaryEntity } from '@/modules/company/entity/company-summary.entity';
import { CompanyUserEntity } from '@/modules/company/entity/company-user.entity';
import { EntrepreneurCompanyEntity } from '@/modules/company/entity/entrepreneur-company.entity';
import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import {
  IFindByIdOptions,
  IFindOptions,
  PredefinedFilters,
} from '@/modules/database/types';
import { SAFE_SUMMARY_ATTRIBUTES } from '@/modules/safe-note/attributes';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import { SHARED_USER_ATTRIBUTES } from '@/modules/user/attributes';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { InviteStatus } from '@/shared/enums';

@InjectEntity(CompanySummaryEntity)
export class CompanySummaryRepository extends BaseRepository<CompanySummaryEntity> {
  protected predefinedFilters(): PredefinedFilters<CompanyFilterDto> {
    return {
      ...companyFilter,
      viaAngelCompany: (value: string) => {
        return {
          include: [
            {
              model: SafeNoteEntity,
              attributes: SAFE_SUMMARY_ATTRIBUTES,
              as: 'sentSafes',
              where: {
                recipientCompanyId: value,
              },
            },
          ],
        };
      },
    };
  }

  public async getAllByUser(userId: string, options?: IFindOptions) {
    return super.getAll({
      include: [
        {
          model: AngelCompanyEntity,
          attributes: ['id'],
        },
        {
          model: EntrepreneurCompanyEntity,
          attributes: ['id'],
        },
        {
          model: SafeNoteEntity,
          attributes: SAFE_SUMMARY_ATTRIBUTES,
          as: 'sentSafes',
        },
        {
          model: SafeNoteEntity,
          attributes: SAFE_SUMMARY_ATTRIBUTES,
          as: 'tiedSafes',
        },
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
            ...(!options.filters.viaAngelCompany && { userId }),
            inviteStatus: {
              [Op.not]: InviteStatus.DECLINED,
            },
          },
        },
      ],
      ...options,
    });
  }

  public async getById(id: string, options?: IFindByIdOptions) {
    return super.getById(id, {
      include: [
        {
          model: AngelCompanyEntity,
          attributes: ['id'],
        },
        {
          model: EntrepreneurCompanyEntity,
          attributes: ['id'],
        },
        {
          model: SafeNoteEntity,
          attributes: SAFE_SUMMARY_ATTRIBUTES,
          as: 'sentSafes',
        },
        {
          model: SafeNoteEntity,
          attributes: SAFE_SUMMARY_ATTRIBUTES,
          as: 'tiedSafes',
        },
      ],
      ...options,
      where: {
        ...options?.where,
        deletedAt: null,
      },
    });
  }
}
