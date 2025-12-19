import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { PaymentType } from '@/modules/payment/enums';
import { Type } from 'class-transformer';
import { CardPaymentDataDto } from '@/modules/payment/dto/card-payment-data.dto';
import { BankPaymentDataDto } from '@/modules/payment/dto/bank-payment-data.dto';

export class CreatePaymentDto {
  @ApiProperty({
    nullable: false,
    required: true,
    enum: PaymentType,
  })
  @IsNotEmpty()
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(({ object }) => {
    switch (object.type) {
      case PaymentType.CARD:
        return CardPaymentDataDto;
      case PaymentType.BANK_TRANSFER:
        return BankPaymentDataDto;
    }
  })
  data: CardPaymentDataDto | BankPaymentDataDto;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}
