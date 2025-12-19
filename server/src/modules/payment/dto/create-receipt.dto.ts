import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateReceiptDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;
}
