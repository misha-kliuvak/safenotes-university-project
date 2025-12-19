import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { PayAs } from '@/modules/safe-note/enums';

export class PayAsDto {
  @ApiProperty({
    description: 'To determine who is gonna pay for SAFE',
    enum: PayAs,
    example: PayAs.ANGEL,
    required: true,
    nullable: false,
  })
  @IsEnum(PayAs)
  @IsNotEmpty()
  payAs: PayAs;
}
