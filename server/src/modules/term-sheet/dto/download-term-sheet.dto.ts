import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { CreateSafeDto } from '@/modules/safe-note/dto/create-safe.dto';

export class DownloadTermSheetDto extends PickType(CreateSafeDto, [
  'valuationCap',
  'mfn',
  'discountRate',
]) {
  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  preparedBy: string;

  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  stateOfIncorporation: string;

  @ApiProperty({
    required: false,
    nullable: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roundAmount?: number;
}
