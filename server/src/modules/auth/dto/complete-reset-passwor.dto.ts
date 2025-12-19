import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteResetPasswordDto {
  @ApiProperty({
    required: true,
    nullable: false,
    description: 'Token from email to verify user',
  })
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @ApiProperty({
    required: true,
    nullable: false,
    description: 'New password',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
