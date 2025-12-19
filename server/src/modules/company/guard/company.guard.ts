import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CompanyGuardHelper } from '@/modules/company/helper/company-guard.helper';
import { PERMISSION_KEY, ROLE_KEY } from '@/shared';
import { BaseGuard } from '@/shared/common/base.guard';
import { Permission, Role } from '@/shared/enums';
import { RequestWithUser } from '@/shared/types';

@Injectable()
export class CompanyGuard extends BaseGuard {
  constructor(
    public readonly reflector: Reflector,
    private readonly companyGuardHelper: CompanyGuardHelper,
  ) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await super.canActivate(context)) return true;

    const request: RequestWithUser = context.switchToHttp().getRequest();

    const permissions =
      this.reflector.get<Permission[]>(PERMISSION_KEY, context.getHandler()) ||
      [];
    const roles =
      this.reflector.get<Role[]>(ROLE_KEY, context.getHandler()) || [];

    const userId: string = request.user.id;
    const companyId = request.params?.id;

    // allow access if no company id
    if (!companyId) return true;

    return this.companyGuardHelper.matchAccessForCompany(
      companyId,
      userId,
      roles,
      permissions,
    );
  }
}
