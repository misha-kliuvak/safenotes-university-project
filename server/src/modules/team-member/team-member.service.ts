import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { InviteTeamMemberDto } from '@/modules/team-member/dto/invite-team-member.dto';
import { RawUser } from '@/modules/user/types';
import { UserService } from '@/modules/user/user.service';
import { InviteStatus, Role } from '@/shared/enums';

import { MappedTeamMember } from './types';

@Injectable()
export class TeamMemberService {
  constructor(private readonly userService: UserService) {}

  public async mapTeamMembers(
    currentUser: RawUser,
    data: InviteTeamMemberDto[],
  ): Promise<MappedTeamMember[]> {
    if (!data?.length) return [];

    const nonDuplicateTeamMembers = _.uniqBy(data, 'email').filter(
      (p) => p.email !== currentUser?.email,
    );
    const result: MappedTeamMember[] = [];

    for (const member of nonDuplicateTeamMembers) {
      const user = await this.userService.getByEmailOrCreate({
        email: member.email,
        fullName: member.fullName,
      });

      result.push({
        user,
        data: {
          role: Role.TEAM_MEMBER,
          permission: member.permission,
          position: member.position,
          inviteStatus: InviteStatus.PENDING,
        },
      });
    }

    return result;
  }
}
