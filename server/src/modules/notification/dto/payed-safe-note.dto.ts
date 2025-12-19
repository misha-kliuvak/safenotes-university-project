import { IsNotEmpty, IsUUID, IsObject, IsOptional } from 'class-validator';

import { PayedSafeNotePayload } from '@/modules/notification/types/index';

export class PayedSafeNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsObject()
  payload: PayedSafeNotePayload;
}
