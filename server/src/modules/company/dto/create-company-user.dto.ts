import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { Permission, Role } from '@/shared/enums';

export class CreateCompanyUserDto {
  @ApiProperty({
    required: true,
    nullable: false,
    description: 'Target Company ID to which user will be tied',
  })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({
    required: true,
    nullable: false,
    description: 'Target User ID to which to ties for specific company',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    required: true,
    nullable: false,
    enum: Role,
    description: 'User role in the company',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiProperty({
    required: true,
    nullable: false,
    enum: Permission,
    description: 'User permission in the company',
    default: 'view',
  })
  @IsEnum(Permission)
  @IsOptional()
  permission?: Permission;

  @ApiProperty({
    required: true,
    nullable: false,
    description: 'User position in the company',
    example: 'Developer/CEO/Manager',
  })
  @IsOptional()
  position?: string;

  // can be set only internally
  readonly inviteStatus;
}
