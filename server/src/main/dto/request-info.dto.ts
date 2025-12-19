import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestInfoDto {
  @ApiProperty({
    description: 'User full name',
    required: true,
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'User email',
    required: true,
    nullable: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly email: string;
}
