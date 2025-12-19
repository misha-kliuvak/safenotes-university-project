import { PredefinedFilters } from '@/modules/database/types';
import { TermSheetFilterDto } from '@/modules/term-sheet/dto/term-sheet-filter.dto';
import { TermSheetUserEntity } from '@/modules/term-sheet/entity/term-sheet-user.entity';

export const termSheetFilter: PredefinedFilters<TermSheetFilterDto> = {
  entrepreneurCompanyId: (value: string) => ({
    where: { senderCompanyId: value },
  }),
  angelCompanyId: (value: string) => ({
    include: [
      {
        as: 'recipients',
        model: TermSheetUserEntity,
        where: {
          userCompanyId: value,
        },
      },
    ],
  }),
};
