import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SubscriptionPermission } from '@/modules/subscription/enums';
import { SubscriptionGuardService } from '@/modules/subscription/service/subscription-guard.service';
import { SUBSCRIPTION_KEY } from '@/modules/subscription/subscription.decorator';
import { Permission } from '@/shared/enums';
import { RequestWithUser } from '@/shared/types';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    public readonly reflector: Reflector,
    private readonly subscriptionGuardService: SubscriptionGuardService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const userId: string = request.user?.id;

    const permissionData = this.reflector.get<{
      subscriptionPermission: SubscriptionPermission;
      permission: Permission;
    }>(SUBSCRIPTION_KEY, context.getHandler());

    if (!permissionData) return true;

    let can: boolean;

    switch (permissionData.subscriptionPermission) {
      case SubscriptionPermission.safeNote:
        if (permissionData.permission === Permission.EDIT) {
          const safeNoteId =
            request.params?.id || request.query?.id || request.body?.id;
          can = await this.subscriptionGuardService.canUpdateSafeNotes(
            userId,
            safeNoteId,
          );
        } else {
          can = await this.subscriptionGuardService.canCreateSafeNotes(
            userId,
            request.body?.recipients?.length || 1,
          );
        }
        break;
      case SubscriptionPermission.investorCompany:
        if (permissionData.permission === Permission.EDIT) {
          const companyId =
            request.params?.id || request.query?.id || request.body?.id;

          can = await this.subscriptionGuardService.canUpdateInvestorCompanies(
            userId,
            companyId,
          );
        } else {
          can = await this.subscriptionGuardService.canCreateInvestorCompanies(
            userId,
            request.body?.teamMembers || [],
          );
        }

        break;
      case SubscriptionPermission.joinableCompany:
      case SubscriptionPermission.teamMember:
        if (permissionData.permission === Permission.EDIT) {
          const teamMemberId =
            request.params?.userId ||
            request.query?.userId ||
            request.body?.userId;

          if (teamMemberId == userId) {
            can = await this.subscriptionGuardService.canJoinCompanies(userId);
          } else {
            can = await this.subscriptionGuardService.canUpdateTeamMembers(
              userId,
              teamMemberId,
            );
          }
        } else {
          can = await this.subscriptionGuardService.canCreateTeamMembers(
            userId,
            request.body?.teamMembers || [],
          );
        }
        break;
      default:
        return false;
    }

    // TODO temporary allow everything
    return true;
    if (!can) {
      throw new HttpException(
        'Payment Required: Your subscription plan does not allow access to this feature. Please upgrade your subscription to access this resource.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }
}
