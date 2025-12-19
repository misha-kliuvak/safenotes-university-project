import { ApiProperty } from '@nestjs/swagger';
import {
  IsCreditCard,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CardPaymentDataDto {
  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsCreditCard()
  cardNumber: string;

  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Max(12)
  @Min(1)
  expirationMonth: number;

  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  expirationYear: number;

  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(10)
  cvv: number;

  @ApiProperty({
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  amount: number;
}
