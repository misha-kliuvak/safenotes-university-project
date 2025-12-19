import { ForbiddenException, Injectable } from '@nestjs/common';

import { CompanySummaryEntity } from '@/modules/company/entity/company-summary.entity';
import { CompanyType } from '@/modules/company/enums';
import { CompanySummaryRepository } from '@/modules/company/repository/company-summary.repository';
import { CompanySummary } from '@/modules/company/types';
import { IFindByIdOptions, IFindOptions } from '@/modules/database/types';
import { SafeNoteStatus } from '@/modules/safe-note/enums';
import { Role } from '@/shared/enums';

@Injectable()
export class CompanySummaryService {
  constructor(
    private readonly companySummaryRepository: CompanySummaryRepository,
  ) {}

  private calculateSummary(entity: CompanySummaryEntity): CompanySummary {
    const calculate = (data = []) =>
      data?.reduce(
        (acc, curr) => {
          if (curr.status !== 'draft') {
            acc.totalSafeCount++;
          }

          if (curr.status === SafeNoteStatus.SIGNED) {
            acc.signedCount++;
          }

          if (curr.paid) {
            acc.paidAmount += curr.safeAmount;
          }

          if (!curr.paid) {
            acc.unpaidCount++;

            acc.unpaidAmount += curr.safeAmount;
          }

          return acc;
        },
        {
          totalSafeCount: 0,
          unpaidCount: 0,
          signedCount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
        },
      );

    const entrepreneurStats = calculate(entity?.sentSafes);
    const angelStats = calculate(entity?.tiedSafes);

    const toSpread =
      entity.type === CompanyType.ANGEL ? angelStats : entrepreneurStats;

    return {
      numberOfInvestedCompanies: entity?.tiedSafes?.length || 0,
      ...toSpread,
    };
  }

  private includeCompanySummary(company: CompanySummaryEntity) {
    const summary = this.calculateSummary(company);

    const result = {
      ...company.toJSON(),
      summary,
    };

    delete result.sentSafes;
    delete result.tiedSafes;
    delete result.companyUser;

    return result;
  }

  public async getAllByUser(userId: string, options?: IFindOptions) {
    const companies = await this.companySummaryRepository.getAllByUser(
      userId,
      options,
    );

    // filter array first to remove companies for safeRecipient role
    // if viaAngelCompany is not provided,
    // as recipient should not know about company summary
    // without including his angel company
    return companies
      .filter((company: CompanySummaryEntity) => {
        return !(
          company?.companyUser?.role === Role.SAFE_RECIPIENT &&
          !options?.filters?.viaAngelCompany
        );
      })
      .map((entity) => this.includeCompanySummary(entity));
  }

  public async getById(id: string, options?: IFindByIdOptions) {
    const company = await this.companySummaryRepository.getById(id, {
      throwNotFound: true,
      ...options,
    });

    if (company?.companyUser?.role === Role.SAFE_RECIPIENT) {
      throw new ForbiddenException();
    }

    return this.includeCompanySummary(company);
  }
}
