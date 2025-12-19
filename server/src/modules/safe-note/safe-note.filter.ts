import { PredefinedFilters } from '@/modules/database/types';
import { SafeNoteFilterDto } from '@/modules/safe-note/dto/safe-note-filter.dto';

export const safeNoteFilter: PredefinedFilters<SafeNoteFilterDto> = {
  entrepreneurCompanyId: (value: string) => ({
    where: { senderCompanyId: value },
  }),
  angelCompanyId: (value: string) => ({
    where: { recipientCompanyId: value },
  }),
};
