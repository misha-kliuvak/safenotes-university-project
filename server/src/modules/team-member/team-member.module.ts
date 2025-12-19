import { forwardRef, Module } from '@nestjs/common';

import { UserModule } from '@/modules/user/user.module';

import { TeamMemberService } from './team-member.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [TeamMemberService],
  exports: [TeamMemberService],
})
export class TeamMemberModule {}
