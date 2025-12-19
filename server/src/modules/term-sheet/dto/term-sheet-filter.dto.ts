import { PickType } from '@nestjs/mapped-types';

import { SafeNoteFilterDto } from '@/modules/safe-note/dto/safe-note-filter.dto';

export class TermSheetFilterDto extends PickType(SafeNoteFilterDto, [
  'entrepreneurCompanyId',
  'angelCompanyId',
]) {}
