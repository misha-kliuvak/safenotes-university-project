import { IsNotEmpty, IsUUID, IsObject } from 'class-validator';

import { TeamMemberRequestPayload } from '@/modules/notification/types/index';

export class TeamMemberRequestNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsObject()
  payload: TeamMemberRequestPayload;
}
