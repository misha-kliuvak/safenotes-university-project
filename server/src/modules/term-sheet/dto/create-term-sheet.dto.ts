import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { CreateSafeDto } from '@/modules/safe-note/dto/create-safe.dto';

export class CreateTermSheetDto extends PickType(CreateSafeDto, [
  'valuationCap',
  'mfn',
  'discountRate',
]) {
  @ApiProperty({
    description: 'ID of the Entrepreneur company who send the Term Sheet',
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  senderCompanyId: string;

  @ApiProperty({
    required: false,
    nullable: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  roundAmount?: number;

  @ApiProperty({
    description: "Sender's name",
    required: false,
    nullable: true,
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  signName?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Signature file',
  })
  signature?: Express.Multer.File;

  @ApiProperty({
    required: false,
    nullable: false,
  })
  @IsEmail({}, { each: true })
  @ArrayMinSize(1)
  recipients: string[];
}
