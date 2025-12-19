import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, MinLength } from 'class-validator';

import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { trim } from '@/shared/utils/dto.utils';

export class UpdateUserWithPasswordDto extends UpdateUserDto {
  @ApiProperty({
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @MinLength(5)
  @Transform(trim)
  readonly password?: string;
}
