import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { OAuthProvider } from '@/modules/auth/types';
import { IsImageUrlOrFile } from '@/modules/database/decorator';
import { trim } from '@/shared/utils/dto.utils';

export class UpdateUserDto {
  // no decorators because cannot be set through request, only internally
  oauthProviders?: OAuthProvider[];

  active?: boolean = false;

  @ApiProperty({
    required: false,
    nullable: false,
  })
  @IsString()
  @IsOptional()
  readonly fullName?: string;

  @ApiProperty({
    nullable: false,
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @Transform(trim)
  readonly email?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsImageUrlOrFile()
  @IsOptional()
  image?: string | Express.Multer.File;

  @ApiProperty({
    nullable: false,
    required: false,
  })
  @IsNotEmpty()
  @ValidateIf((v) => v.newPassword)
  @MinLength(5)
  @Transform(trim)
  readonly oldPassword?: string;

  @ApiProperty({
    nullable: false,
    required: false,
  })
  @IsNotEmpty()
  @ValidateIf((v) => v.oldPassword)
  @MinLength(5)
  @Transform(trim)
  readonly newPassword?: string;

  @ApiProperty({
    nullable: false,
    required: false,
  })
  @IsOptional()
  @Transform(trim)
  readonly verificationCode?: string;
}
