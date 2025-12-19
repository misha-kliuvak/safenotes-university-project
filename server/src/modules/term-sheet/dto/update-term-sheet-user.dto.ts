import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { TermSheetStatus } from '@/modules/term-sheet/enums';

export class UpdateTermSheetUserDto {
  @IsEnum(TermSheetStatus)
  @IsOptional()
  status: TermSheetStatus;

  @IsUUID()
  @IsOptional()
  companyId: string;

  @IsString()
  @IsOptional()
  comment: string;
}
