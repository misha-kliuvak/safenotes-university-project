import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CompanyGuardHelper } from '@/modules/company/helper/company-guard.helper';
import { TermSheetService } from '@/modules/term-sheet/term-sheet.service';
import { ROLE_KEY } from '@/shared';
import { BaseGuard } from '@/shared/common/base.guard';
import { PERMISSION_KEY } from '@/shared/decorators/permission.decorator';
import { Permission, Role } from '@/shared/enums';
import { RequestWithUser } from '@/shared/types';

@Injectable()
export class TermSheetGuard extends BaseGuard {
  constructor(
    public readonly reflector: Reflector,
    private readonly termSheetService: TermSheetService,
    private readonly companyGuardHelper: CompanyGuardHelper,
  ) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await super.canActivate(context)) return true;

    const request: RequestWithUser = context.switchToHttp().getRequest();
    const userId: string = request.user.id;

    const permissions =
      this.reflector.get<Permission[]>(PERMISSION_KEY, context.getHandler()) ||
      [];

    const roles =
      this.reflector.get<Role[]>(ROLE_KEY, context.getHandler()) || [];

    const termSheetId = request.params?.id;

    if (!termSheetId) {
      const angelCompanyId = request.query?.angelCompanyId;
      const entrepreneurCompanyId =
        request.body?.senderCompanyId || request.query?.entrepreneurCompanyId;

      let angelPermission = false;
      let entrepreneurPermission = false;

      if (angelCompanyId) {
        angelPermission = await this.companyGuardHelper.matchAccessForCompany(
          String(angelCompanyId),
          userId,
          roles,
          permissions,
        );
      } else {
        angelPermission = true;
      }

      if (entrepreneurCompanyId) {
        entrepreneurPermission =
          await this.companyGuardHelper.matchAccessForCompany(
            String(entrepreneurCompanyId),
            userId,
            roles,
            permissions,
          );
      } else {
        entrepreneurPermission = true;
      }

      return !!angelPermission || !!entrepreneurPermission;
    }

    await this.uuidValidation(termSheetId);

    const termSheet = await this.termSheetService.getById(termSheetId, {
      throwNotFound: true,
    });

    return this.companyGuardHelper.matchAccessForCompany(
      termSheet.senderCompanyId,
      userId,
      roles,
      permissions,
    );
  }
}
