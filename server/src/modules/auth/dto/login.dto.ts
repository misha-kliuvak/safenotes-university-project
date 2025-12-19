import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}
