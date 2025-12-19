import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { trim } from '@/shared/utils/dto.utils';

export class CreateUserDto {
  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(trim)
  readonly email: string;

  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(trim)
  readonly fullName: string;

  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @MinLength(5)
  @Transform(trim)
  readonly password?: string;

  @ApiProperty({
    description:
      'Token which allow to sign up user which were invited to the platform',
    nullable: false,
    required: false,
  })
  @IsOptional()
  readonly token?: string;

  // accessible only internally
  active?: boolean = false;
}
