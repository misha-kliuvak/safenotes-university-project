import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { trim } from '@/shared/utils/dto.utils';

export class AddressDto {
  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Transform(trim)
  readonly address1?: string;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Transform(trim)
  readonly address2?: string;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Transform(trim)
  readonly country?: string;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Transform(trim)
  readonly state?: string;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Transform(trim)
  readonly city?: string;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  readonly zipCode?: number;
}
