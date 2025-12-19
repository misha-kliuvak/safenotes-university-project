import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ShareSafeDto {
  @ApiProperty({
    description: 'Email of user who will receive shared SAFE',
    required: true,
    nullable: false,
    example: 'john@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @ApiProperty({
    description:
      'Name of user who will receive shared SAFE. Used only if user did not have an account',
    required: true,
    nullable: false,
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  recipientName: string;

  @ApiProperty({
    description:
      'Additional message which will be sent to recipient in the email',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  message: string;
}
