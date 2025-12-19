import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class RecipientDto {
  @ApiProperty({
    description: 'User email who will receive the safe',
    required: true,
    nullable: false,
    example: 'johndoe@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'Only affects if user did not have an account when SAFE was sent',
    required: true,
    nullable: false,
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'Required if not draft',
    required: true,
    nullable: false,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'amount should not be empty' })
  @Type(() => Number)
  amount: number;
}
