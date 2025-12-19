import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { AddressDto } from '@/modules/address/dto/address.dto';
import { CompanyType } from '@/modules/company/enums';
import { IsImageUrlOrFile } from '@/modules/database/decorator';
import { InviteTeamMemberDto } from '@/modules/team-member/dto/invite-team-member.dto';
import { MulterFile } from '@/shared/types';
import { trim } from '@/shared/utils/dto.utils';

export class CreateCompanyCoreDto {
  @ApiProperty({
    required: true,
    enum: CompanyType,
  })
  @IsNotEmpty()
  @IsEnum(CompanyType)
  readonly type: CompanyType;

  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(trim)
  readonly name: string;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  readonly mainName?: string;

  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  readonly ownerPosition?: string;

  @ApiProperty({
    required: false,
    nullable: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  readonly goal?: number;

  @ApiProperty({
    isArray: true,
    type: InviteTeamMemberDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteTeamMemberDto)
  readonly teamMembers?: InviteTeamMemberDto[];

  @ApiProperty({
    type: AddressDto,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Company image',
  })
  @IsOptional()
  @IsImageUrlOrFile()
  image?: MulterFile | string;
}
