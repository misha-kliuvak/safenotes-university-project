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
import { TermSheetFilterDto } from '@/modules/term-sheet/dto/term-sheet-filter.dto';
import { TermSheetUserEntity } from '@/modules/term-sheet/entity/term-sheet-user.entity';
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';
import { TermSheetStatus } from '@/modules/term-sheet/enums';
import { termSheetFilter } from '@/modules/term-sheet/term-sheet.filter';
import { SHARED_USER_ATTRIBUTES } from '@/modules/user/attributes';
import { UserEntity } from '@/modules/user/entity/user.entity';

@InjectEntity(TermSheetEntity)
export class TermSheetRepository extends BaseRepository<TermSheetEntity> {
  private getBaseInclude(userId) {
    return [
      {
        as: 'recipients',
        model: TermSheetUserEntity,
        include: [
          {
            model: UserEntity,
            attributes: SHARED_USER_ATTRIBUTES,
          },
          CompanyEntity,
        ],
      },
      {
        as: 'termSheetUser',
        model: TermSheetUserEntity,
        where: {
          userId,
        },
        required: false,
      },
      {
        model: CompanyEntity,
        as: 'senderCompany',
        include: [
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
        where: {
          deletedAt: null,
        },
      },
    ];
  }

  protected predefinedFilters(): PredefinedFilters<TermSheetFilterDto> {
    return termSheetFilter;
  }

  public async getAllForUser(userId: string, options: IFindOptions) {
    return super.getAll({
      include: this.getBaseInclude(userId),
      ...options,
    });
  }

  public async getById(id: string, options?: IFindByIdOptions) {
    return super.getById(id, {
      include: [
        {
          as: 'recipients',
          model: TermSheetUserEntity,
          include: [
            {
              model: UserEntity,
              attributes: SHARED_USER_ATTRIBUTES,
            },
            CompanyEntity,
          ],
        },
      ],
      ...options,
    });
  }

  public async getByIdForUser(
    id: string,
    userId: string,
    options?: IFindByIdOptions,
  ) {
    return super.getById(id, {
      include: this.getBaseInclude(userId),
      ...options,
    });
  }

  public async getPendingTermSheets(userId: string, options?: IFindOptions) {
    return this.getAll({
      include: [
        {
          model: TermSheetUserEntity,
          as: 'termSheetUser',
          where: {
            userId,
            status: TermSheetStatus.PENDING,
          },
        },
        {
          model: CompanyEntity,
          as: 'senderCompany',
          include: [
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
          where: {
            deletedAt: null,
          },
        },
      ],
      ...options,
    });
  }
}
