import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
