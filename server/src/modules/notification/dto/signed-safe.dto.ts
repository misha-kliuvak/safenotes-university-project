import { IsNotEmpty, IsUUID, IsObject, IsOptional } from 'class-validator';

import { SignedSafeNotePayload } from '@/modules/notification/types/index';

export class SignedSafeNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsObject()
  payload: SignedSafeNotePayload;
}
