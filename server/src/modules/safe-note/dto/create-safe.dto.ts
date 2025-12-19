import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import * as _ from 'lodash';

import { SafeFor } from '@/modules/safe-note/enums';
import { toBoolean } from '@/shared/utils';
import { RecipientDto } from '@/modules/safe-note/dto/recipient.dto';

export class CreateSafeDto {
  @ApiProperty({
    description: 'ID of the Entrepreneur company who gives the SAFE',
    required: true,
    nullable: false,
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  senderCompanyId: string;

  @ApiProperty({
    description: 'Term Sheet Id',
    required: false,
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  termSheetId?: string;

  @ApiProperty({
    description: 'Determine to who create SAFE for',
    required: true,
    nullable: false,
    enum: SafeFor,
    example: SafeFor.ANGEL,
  })
  @IsNotEmpty()
  @IsEnum(SafeFor)
  @ValidateIf((o) => !o.draft)
  safeFor: SafeFor;

  @ApiProperty({
    description: 'Required if not draft',
    isArray: true,
    type: RecipientDto,
    required: false,
    nullable: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateIf((o) => !o.draft)
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients?: RecipientDto[];

  @ApiProperty({
    description: 'Required if !mfn && !valuationCap || value > 100',
    required: true,
    nullable: false,
  })
  @IsNumber()
  @ValidateIf((o, v) => {
    // if draft and value is not presented
    if (o.draft && _.isNil(v)) return false;

    const valueGreaterThat100 = v > 100;
    const notMfnAndValueNotPresented = !o.mfn && isNaN(v);
    const noValuationCap = _.isNil(o.valuationCap);

    return (
      valueGreaterThat100 || (notMfnAndValueNotPresented && noValuationCap)
    );
  })
  @IsNotEmpty()
  @Max(100)
  @Type(() => Number)
  discountRate?: number;

  @ApiProperty({
    description: 'Required if !mfn && !discount rate',
    required: true,
    nullable: false,
  })
  @IsNumber()
  @ValidateIf((o, v) => {
    // if draft and value is not presented
    if (o.draft && _.isNil(v)) return false;

    const notMfnAndValueNotPresented = !o.mfn && isNaN(v);
    const noDiscountRate = _.isNil(o.discountRate);
    const noValuePresented = !_.isNil(v);

    return (notMfnAndValueNotPresented && noDiscountRate) || noValuePresented;
  })
  @IsNotEmpty()
  @Type(() => Number)
  valuationCap?: number;

  @ApiProperty({
    required: false,
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @ValidateIf((o) => {
    const noDiscount = isNaN(o.discountRate);
    const noValuationCap = isNaN(o.valuationCap);
    return noDiscount && noValuationCap;
  })
  @Transform(({ value }) => toBoolean(value))
  mfn?: boolean;

  @ApiProperty({
    description: 'Payment ID after payment SAFE',
    type: 'string',
    format: 'uuid',
    required: false,
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  paymentId?: string;

  @ApiProperty({
    description: "Sender's name",
    required: false,
    nullable: true,
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  senderSignName?: string;

  @ApiProperty({
    description: 'Once true, all fields becomes optional',
    nullable: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  draft?: boolean;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Signature file',
  })
  senderSignature?: Express.Multer.File;
}
