import { Op } from 'sequelize';

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
import { PaymentEntity } from '@/modules/payment/entity/payment.entity';
import { SafeNoteStatus } from '@/modules/safe-note/enums';
import { safeNoteFilter } from '@/modules/safe-note/safe-note.filter';
import { SafeNoteTerms } from '@/modules/safe-note/types';
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';
import { SHARED_USER_ATTRIBUTES } from '@/modules/user/attributes';
import { UserEntity } from '@/modules/user/entity/user.entity';

import { SafeNoteEntity } from '../entity/safe-note.entity';

@InjectEntity(SafeNoteEntity)
export class SafeNoteRepository extends BaseRepository<SafeNoteEntity> {
  protected predefinedFilters(): PredefinedFilters {
    return safeNoteFilter;
  }

  async getAll(options?: IFindOptions) {
    return super.getAll({
      include: [
        TermSheetEntity,
        {
          model: UserEntity,
          attributes: SHARED_USER_ATTRIBUTES,
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
            deletedAt: options?.filters?.isDeleted ? { [Op.not]: null } : null,
          },
          paranoid: !options?.filters?.isDeleted,
        },
      ],
      ...options,
    });
  }

  async getPendingSafes(userId: string) {
    return this.getAll({
      where: {
        recipientId: userId,
        recipientCompanyId: null,
        status: SafeNoteStatus.SENT,
      },
    });
  }

  async getAllReceived(
    userId: string,
    angelCompanyId: string,
    options?: IFindOptions,
  ) {
    return this.getAll({
      where: {
        [Op.or]: { recipientId: userId, recipientCompanyId: angelCompanyId },
      },
      ...options,
    });
  }

  async getById(id: string, options?: IFindByIdOptions) {
    return super.getById(id, {
      include: [
        TermSheetEntity,
        {
          model: UserEntity,
          attributes: SHARED_USER_ATTRIBUTES,
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
        PaymentEntity,
      ],
      ...options,
    });
  }

  async getMaxDiscountRate(companyId: string) {
    const discountRate = await this.max('discountRate', {
      where: {
        senderCompanyId: companyId,
        status: SafeNoteStatus.SIGNED,
        discountRate: { [Op.ne]: [NaN, null] },
      },
    });

    return discountRate ?? 0;
  }

  async getMaxValuationCap(
    companyId: string,
  ): Promise<Omit<SafeNoteTerms, 'discountRate'>> {
    const safeNote = await super.getAll({
      where: {
        senderCompanyId: companyId,
        status: SafeNoteStatus.SIGNED,
      },
      attributes: ['valuationCap'],
    });

    const safeTerms = safeNote.map((entity) => {
      const json = entity.toJSON();

      return {
        valuationCap: json.valuationCap,
      };
    });

    return safeTerms.reduce(function (max, currentItem) {
      return currentItem.valuationCap > max.valuationCap ? currentItem : max;
    }, safeTerms[0]); // Start with the first item as the initial max
  }

  async getMaxTerms(companyId: string): Promise<SafeNoteTerms> {
    const discountRate = await this.getMaxDiscountRate(companyId);
    const valuationCapData = await this.getMaxValuationCap(companyId);

    return {
      discountRate: +discountRate,
      ...valuationCapData,
    };
  }
}
