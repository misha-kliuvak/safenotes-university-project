import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SignTermSheetDto {
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
