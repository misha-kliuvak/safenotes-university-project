import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class SendFeedbackDto {
  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsString()
  readonly feedback: string;

  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsNumber()
  readonly rating: number;
}
