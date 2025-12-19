import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { SignSafeAs } from '@/modules/safe-note/enums';

export class SignSafeDto {
  @ApiProperty({
    description: 'To determine who is gonna sign the SAFE',
    required: true,
    nullable: false,
    enum: SignSafeAs,
    example: SignSafeAs.SENDER,
  })
  @IsEnum(SignSafeAs)
  @IsNotEmpty()
  signAs: SignSafeAs;

  @ApiProperty({
    description: "Signer's name",
    required: true,
    nullable: false,
    example: 'John Doe',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'Signature file',
  })
  signature?: Express.Multer.File;
}
