import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AmountDto {
  @ApiProperty({
    nullable: false,
    required: false,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  amount?: number;
}
