import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendContactAttemptDto {
  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsString()
  readonly topic: string;

  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsString()
  readonly message: string;
}
