import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { InviteStatus, Permission } from '@/shared/enums';
import { toLowerCase, trim } from '@/shared/utils/dto.utils';

export class UpdateTeamMemberDto {
  @ApiProperty({
    nullable: false,
    required: false,
    description: 'User position in the company',
  })
  @IsOptional()
  @IsString()
  readonly position?: string;

  @ApiProperty({
    nullable: false,
    required: false,
    description: 'User permission in the company',
    example: Permission.EDIT,
    enum: Permission,
  })
  @IsOptional()
  @IsEnum(Permission)
  @Transform(({ value }) => value?.toLowerCase())
  readonly permission?: Permission;

  @ApiProperty({
    nullable: false,
    required: false,
    description: 'Invite status',
    enum: InviteStatus,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(InviteStatus)
  @Transform(trim)
  @Transform(toLowerCase)
  readonly inviteStatus?: InviteStatus;
}
