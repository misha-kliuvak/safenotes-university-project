import { IsNotEmpty, IsUUID, IsObject } from 'class-validator';

import { IncomingSafeNotePayload } from '@/modules/notification/types/index';

export class IncomingSafeNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsObject()
  payload: IncomingSafeNotePayload;
}
