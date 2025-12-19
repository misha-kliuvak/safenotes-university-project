import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CompanyUserService } from '@/modules/company/service/company-user.service';
import { BaseGuard } from '@/shared/common/base.guard';
import { Role } from '@/shared/enums';

@Injectable()
export class AssignCompanyGuard extends BaseGuard {
  constructor(
    public readonly reflector: Reflector,
    private readonly companyUserService: CompanyUserService,
  ) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await super.canActivate(context)) return true;

    const request = context.switchToHttp().getRequest();

    const userId: string = request.user.id;
    const companyId = request.params?.companyId || request?.body?.companyId;

    // companyId could be optional
    if (!companyId) return true;

    await this.uuidValidation(companyId);

    const companyUser = await this.companyUserService.getCompanyUserByRole(
      companyId,
      userId,
      [Role.OWNER, Role.TEAM_MEMBER],
    );

    if (!companyUser) return false;

    // only owner or angel company can access this route
    return companyUser.userId === userId;
  }
}
