import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

import { InviteTeamMemberDto } from './invite-team-member.dto';

export class InviteTeamMembersDto {
  @ApiProperty({
    nullable: false,
    required: true,
    isArray: true,
    type: InviteTeamMemberDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteTeamMemberDto)
  @IsNotEmpty()
  readonly teamMembers?: InviteTeamMemberDto[];
}
