import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { SubscriptionPeriod } from '@/modules/subscription/enums';

export class SubscriptionPeriodDto {
  @ApiProperty({
    description: 'Period',
    required: true,
    nullable: false,
    enum: SubscriptionPeriod,
    example: SubscriptionPeriod.MONTH,
  })
  @IsNotEmpty()
  @IsEnum(SubscriptionPeriod)
  period: SubscriptionPeriod;
}
