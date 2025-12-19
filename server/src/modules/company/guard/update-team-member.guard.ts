import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CompanyUserService } from '@/modules/company/service/company-user.service';
import { BaseGuard } from '@/shared/common/base.guard';
import { InviteStatus, Role } from '@/shared/enums';

@Injectable()
export class UpdateTeamMemberGuard extends BaseGuard {
  constructor(
    public readonly reflector: Reflector,
    private readonly companyUserService: CompanyUserService,
  ) {
    super(reflector);
  }

  private async matchAccessForOwner(
    companyId: string,
    userId: string,
    body: any,
  ) {
    const ownerCompanyUser = await this.companyUserService.getCompanyUserByRole(
      companyId,
      userId,
      Role.OWNER,
    );

    if (!ownerCompanyUser) return false;

    const attemptToChangeInviteStatusForOwner =
      Object.keys(body).includes('inviteStatus');

    if (attemptToChangeInviteStatusForOwner) {
      throw new ForbiddenException(
        'Company owner cannot change his inviteStatus',
      );
    }

    return !attemptToChangeInviteStatusForOwner;
  }

  private async matchAccessForTeamMember(
    companyId: string,
    userId: string,
    body: any,
  ) {
    const companyUser = await this.companyUserService.getCompanyUserByRole(
      companyId,
      userId,
      Role.TEAM_MEMBER,
    );

    const allowedFieldsToChangedForTeamMember = ['position', 'inviteStatus'];

    // filter request body for team member to allow only fields from array
    Object.keys(body).forEach((key) => {
      if (!allowedFieldsToChangedForTeamMember.includes(key)) {
        delete body[key];
      }
    });

    const inviteWasDeclined =
      companyUser.inviteStatus === InviteStatus.DECLINED;

    const attemptToChangeFromAcceptedToPending =
      companyUser.inviteStatus === InviteStatus.ACCEPTED &&
      body.inviteStatus === InviteStatus.PENDING;

    return !(inviteWasDeclined || attemptToChangeFromAcceptedToPending);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await super.canActivate(context)) return true;

    const request = context.switchToHttp().getRequest();

    const userId: string = request.user.id;
    const companyId = request.params?.id;

    await this.uuidValidation(companyId);

    const companyUserOwner = await this.companyUserService.getCompanyUserByRole(
      companyId,
      userId,
      Role.OWNER,
    );

    const isOwner = companyUserOwner?.userId === userId;
    if (isOwner) {
      return this.matchAccessForOwner(companyId, userId, request?.body);
    }

    return this.matchAccessForTeamMember(companyId, userId, request?.body);
  }
}
