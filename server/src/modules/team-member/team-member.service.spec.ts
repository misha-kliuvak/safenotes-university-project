import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';

import { InviteTeamMemberDto } from '@/modules/team-member/dto/invite-team-member.dto';
import { TeamMemberModule } from '@/modules/team-member/team-member.module';
import { TeamMemberService } from '@/modules/team-member/team-member.service';
import { MappedTeamMember } from '@/modules/team-member/types';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { RawUser } from '@/modules/user/types';
import { UserModule } from '@/modules/user/user.module';
import { UserService } from '@/modules/user/user.service';
import { InviteStatus, Permission, Role } from '@/shared/enums';
import { JestModule } from '@/shared/jest/jest.module';

describe('TeamMemberService', () => {
  let teamMemberService: TeamMemberService;
  let userService: UserService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({ dialect: 'postgres' }),
        JestModule,
        TeamMemberModule,
        UserModule,
      ],
    }).compile();

    teamMemberService = app.get(TeamMemberService);
    userService = app.get(UserService);
  });

  it('should be defined', () => {
    expect(teamMemberService).toBeDefined();
  });

  describe('processTeamMembers', () => {
    it('should return an empty array if data is empty', async () => {
      const currentUser = { email: 'user@example.com' };
      const result = await teamMemberService.mapTeamMembers(
        currentUser as UserEntity,
        [],
      );
      expect(result).toEqual([]);
    });

    it('should create team members in db and return', async () => {
      const currentUser = { email: 'user@example.com' };
      const inviteData: InviteTeamMemberDto[] = [
        {
          email: 'user1@example.com',
          fullName: 'User 1',
          permission: Permission.VIEW,
          position: 'Developer',
        },
        {
          email: 'user2@example.com',
          fullName: 'User 2',
          permission: Permission.EDIT,
          position: 'Designer',
        },
        {
          email: 'user2@example.com', // Should be filtered out
          fullName: 'Current User',
          permission: Permission.CREATE,
          position: 'Admin',
        },
      ];

      userService.getByEmailOrCreate = jest
        .fn()
        .mockImplementation(async (userDto) => userDto);

      // Act
      const result: MappedTeamMember[] = await teamMemberService.mapTeamMembers(
        currentUser as RawUser,
        inviteData,
      );

      // Assert
      expect(result).toHaveLength(2); // Should have 2 non-duplicate team members
      expect(userService.getByEmailOrCreate).toHaveBeenCalledTimes(2); // Called twice for unique email addresses
      expect(result[0].data).toEqual({
        role: Role.TEAM_MEMBER,
        permission: Permission.VIEW,
        position: 'Developer',
        inviteStatus: InviteStatus.PENDING,
      });
      expect(result[1].data).toEqual({
        role: Role.TEAM_MEMBER,
        permission: Permission.EDIT,
        position: 'Designer',
        inviteStatus: InviteStatus.PENDING,
      });
    });
  });
});
