import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

import { PlaidWebhookType } from '@/modules/webhook/enums';

export class PlaidWebhookDto {
  @ApiProperty({
    required: true,
  })
  @IsEnum(PlaidWebhookType)
  webhook_type: PlaidWebhookType;

  @ApiProperty({
    required: true,
  })
  @IsString()
  webhook_code: string;
}
