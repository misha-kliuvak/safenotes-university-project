import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { toBoolean } from '@/shared/utils';
import { RecipientDto } from '@/modules/safe-note/dto/recipient.dto';

export class CreateSafeByRecipientsDto {
  @ApiProperty({
    isArray: true,
    type: RecipientDto,
    required: true,
    nullable: false,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients?: RecipientDto[];

  @ApiProperty({
    description: 'Once true, all fields becomes optional',
    nullable: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  draft?: boolean;
}
