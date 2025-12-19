import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsUUID } from 'class-validator';

import { trim } from '@/shared/utils/dto.utils';

export class UpdateDraftRecipientDto {
  @ApiProperty({
    required: true,
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    required: true,
  })
  @IsUUID()
  safeId: string;

  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsEmail()
  @Transform(trim)
  email: string;
}
