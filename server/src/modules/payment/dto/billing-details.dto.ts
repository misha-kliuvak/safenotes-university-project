import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BillingDetailsDto {
  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    nullable: true,
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
