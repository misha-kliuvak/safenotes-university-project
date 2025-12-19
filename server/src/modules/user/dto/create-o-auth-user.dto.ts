import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { OAuthProvider } from '@/modules/auth/types';

export class CreateOAuthUserDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @IsArray()
  @IsNotEmpty()
  readonly providers: OAuthProvider[];

  @IsOptional()
  readonly image?: string;

  active?: boolean = false;
}
