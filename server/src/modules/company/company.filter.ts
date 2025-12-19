import { CompanyFilterDto } from '@/modules/company/dto/company-filter.dto';
import { CompanyUserEntity } from '@/modules/company/entity/company-user.entity';
import { PredefinedFilters } from '@/modules/database/types';
import { Role } from '@/shared/enums';

export const companyFilter: PredefinedFilters<CompanyFilterDto> = {
  shared: (value: 'own' | 'invited') => {
    if (value !== 'own' && value !== 'invited') return;

    return {
      include: [
        {
          model: CompanyUserEntity,
          as: 'companyUsers',
          where: {
            role: value === 'own' ? Role.OWNER : Role.TEAM_MEMBER,
          },
        },
      ],
    };
  },
  viaAngelCompany: () => ({}),
};
