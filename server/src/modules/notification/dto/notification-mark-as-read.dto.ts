import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class NotificationMarkAsReadDto {
  @ApiProperty({
    description: 'Array of notification ids',
    nullable: false,
    required: true,
    isArray: true,
    type: 'string',
  })
  @IsUUID('all', { each: true })
  ids: string[];
}
