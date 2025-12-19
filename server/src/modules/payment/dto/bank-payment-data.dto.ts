import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { BillingDetailsDto } from '@/modules/payment/dto/billing-details.dto';
import { AccountHolderType } from '@/modules/stripe/enums';

export class BankPaymentDataDto {
  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  routingNumber: string;

  @ApiProperty({
    nullable: false,
    required: true,
    enum: AccountHolderType,
  })
  @IsNotEmpty()
  @IsEnum(AccountHolderType)
  accountHolderType: AccountHolderType;

  @ApiProperty({
    nullable: false,
    required: true,
    type: BillingDetailsDto,
  })
  @ValidateNested({ each: true })
  @Type(() => BillingDetailsDto)
  @IsNotEmpty()
  billingDetails: BillingDetailsDto;

  @ApiProperty({
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  amount: number;
}
