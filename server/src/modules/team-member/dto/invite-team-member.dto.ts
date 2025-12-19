import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { Permission } from '@/shared/enums';
import { compose } from '@/shared/utils/common.utils';
import { toLowerCase, trim } from '@/shared/utils/dto.utils';

export class InviteTeamMemberDto {
  @ApiProperty({
    description: 'Email of user who get invitation to team',
    required: true,
    nullable: false,
    example: 'john@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(trim)
  readonly email: string;

  @ApiProperty({
    description:
      'Used only if user did not have an account once was invited to team',
    required: true,
    nullable: false,
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(trim)
  readonly fullName: string;

  @ApiProperty({
    description: 'To determine user position in team',
    required: false,
    nullable: true,
    example: 'DEV',
  })
  @IsOptional()
  @IsString()
  @Transform(trim)
  readonly position?: string;

  @ApiProperty({
    description: 'To determine user permission in team',
    required: false,
    nullable: true,
    default: Permission.VIEW,
    example: Permission.CREATE,
  })
  @IsOptional()
  @IsEnum(Permission)
  @Transform(compose(trim, toLowerCase))
  readonly permission?: Permission;
}
