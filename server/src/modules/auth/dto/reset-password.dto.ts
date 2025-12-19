import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
