import { Injectable } from '@nestjs/common';

import { CompanyUserEntity } from '@/modules/company/entity/company-user.entity';
import { CompanyUserService } from '@/modules/company/service/company-user.service';
import { CompanyService } from '@/modules/company/service/company.service';
import { InviteStatus, Permission, Role } from '@/shared/enums';
import { PermissionUtils } from '@/shared/utils';

@Injectable()
export class CompanyGuardHelper {
  constructor(
    private readonly companyUserService: CompanyUserService,
    private readonly companyService: CompanyService,
  ) {}

  private async matchTeamMemberPermissions(
    teamMember: CompanyUserEntity,
    permissions: Permission[] = [],
  ) {
    if (permissions?.length === 0) return true;

    const isExactPermission = permissions.includes(teamMember.permission);

    if (isExactPermission) {
      return true;
    }

    const permissionHierarchy = PermissionUtils.getPermissionHierarchy(
      teamMember.permission,
    );
    return permissionHierarchy.some((p) => permissions.includes(p));
  }

  public async matchAccessForCompany(
    companyId: string,
    userId: string,
    roles: Role[] = [],
    permissions: Permission[] = [],
  ): Promise<boolean> {
    const noRoles = roles?.length === 0;
    const company = await this.companyService.getById(companyId, {
      throwNotFound: false,
    });

    // allow access if there is no such company
    if (!company) {
      return true;
    }

    const teamMember = await this.companyUserService.getCompanyUserByRole(
      companyId,
      userId,
      Role.TEAM_MEMBER,
    );

    if (
      (!teamMember || teamMember?.inviteStatus !== InviteStatus.DECLINED) &&
      noRoles
    ) {
      return true;
    }

    // condition for owner
    const isOwner = company?.owner?.id === userId;
    if (roles.includes(Role.OWNER) && isOwner) {
      return true;
    }

    const safeRecipient = await this.companyUserService.getCompanyUserByRole(
      companyId,
      userId,
      Role.SAFE_RECIPIENT,
    );

    // condition for safe recipient
    if (
      roles.includes(Role.SAFE_RECIPIENT) &&
      safeRecipient?.userId === userId
    ) {
      return true;
    }

    const termSheetRecipient =
      await this.companyUserService.getCompanyUserByRole(
        companyId,
        userId,
        Role.TERM_SHEET_RECIPIENT,
      );

    // condition for safe recipient
    if (
      roles.includes(Role.TERM_SHEET_RECIPIENT) &&
      termSheetRecipient?.userId === userId
    ) {
      return true;
    }

    if (roles.includes(Role.TEAM_MEMBER) && teamMember?.userId === userId) {
      if (!teamMember || teamMember?.inviteStatus !== InviteStatus.ACCEPTED) {
        return false;
      }

      return this.matchTeamMemberPermissions(teamMember, permissions);
    }

    return false;
  }
}
