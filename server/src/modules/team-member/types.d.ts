import { UserEntity } from '@/modules/user/entity/user.entity';
import { InviteStatus, Permission, Role } from '@/shared/enums';

export interface MappedTeamMember {
  user: UserEntity;
  data: {
    role: Role;
    permission: Permission;
    position: string;
    inviteStatus: InviteStatus;
  };
}
