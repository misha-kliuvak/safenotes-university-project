import { Injectable } from '@nestjs/common';

import { CompanyUserService } from '@/modules/company/service/company-user.service';
import { CompanyService } from '@/modules/company/service/company.service';
import { SubscriptionService } from '@/modules/subscription/service/subscription.service';
import { subscriptionPlans } from '@/modules/subscription/constants';
import {
  SubscriptionPermission,
  SubscriptionPlan,
} from '@/modules/subscription/enums';
import { Role } from '@/shared/enums';
import { SafeNoteService } from '@/modules/safe-note/service/safe-note.service';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import { Op } from 'sequelize';
import { ORDER_BY } from '@/modules/database/enums';
import { CompanyUserEntity } from '@/modules/company/entity/company-user.entity';
import { InviteTeamMemberDto } from '@/modules/team-member/dto/invite-team-member.dto';

@Injectable()
export class SubscriptionGuardService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly companyUserService: CompanyUserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly safeNoteService: SafeNoteService,
  ) {}

  /**
   * get user company ids
   *
   * @param userId
   * @private
   */
  private async getUserCompanyIds(userId: string) {
    const companyUsers = await this.companyUserService.getAllByUserAndRole(
      userId,
      Role.OWNER,
    );

    return companyUsers.map((companyUser) => companyUser.companyId);
  }

  /**
   * Check if the user's subscription allows creating SAFE notes
   *
   * @param userId
   * @param incomingSafeNotes
   */
  async canCreateSafeNotes(
    userId: string,
    incomingSafeNotes: number = 1,
  ): Promise<boolean> {
    if (await this.subscriptionService.getActiveByUserId(userId)) {
      return true;
    }

    const limits =
      subscriptionPlans[SubscriptionPlan.BASIC][
        SubscriptionPermission.safeNote
      ];

    const companyIds = await this.getUserCompanyIds(userId);

    const safeNotes = await this.safeNoteService.getAll({
      where: { senderCompanyId: { [Op.in]: companyIds } },
    });

    if (safeNotes.length + incomingSafeNotes > limits) {
      return false;
    }

    return true;
  }

  /**
   * Check if the user's subscription allows updating SAFE note
   *
   * @param userId
   * @param safeId
   */
  async canUpdateSafeNotes(userId: string, safeId: string): Promise<boolean> {
    if (await this.subscriptionService.getActiveByUserId(userId)) {
      return true;
    }

    const limits =
      subscriptionPlans[SubscriptionPlan.BASIC][
        SubscriptionPermission.safeNote
      ];

    const companyIds = await this.getUserCompanyIds(userId);

    const safeNotes = (await this.safeNoteService.getAll({
      where: { senderCompanyId: { [Op.in]: companyIds } },
      sorting: { createdAt: ORDER_BY.ASC },
      toJson: true,
      limit: limits as number,
    })) as unknown as ResponsePagination<SafeNoteEntity>;

    for (const safeNote of safeNotes.data) {
      if (safeId !== safeNote.id) {
        continue;
      }

      return true;
    }

    return false;
  }

  /**
   * Check if the user's subscription allows adding team members
   *
   * @param userId
   * @param teamMembers
   */
  async canCreateTeamMembers(
    userId: string,
    teamMembers: InviteTeamMemberDto[],
  ): Promise<boolean> {
    const incomingTeamMembers = teamMembers.length;
    if (!incomingTeamMembers) {
      return false;
    }

    if (await this.subscriptionService.getActiveByUserId(userId)) {
      return true;
    }

    const limits =
      subscriptionPlans[SubscriptionPlan.BASIC][
        SubscriptionPermission.teamMember
      ];

    const companyIds = await this.getUserCompanyIds(userId);

    const companyTeamMembers = await this.companyUserService.getAll({
      where: { companyId: { [Op.in]: companyIds }, role: Role.TEAM_MEMBER },
    });

    if (companyTeamMembers.length + incomingTeamMembers > limits) {
      return false;
    }

    const sharedPermission =
      subscriptionPlans[SubscriptionPlan.BASIC][
        SubscriptionPermission.sharePermissions
      ];

    for (const teamMember of teamMembers) {
      if (sharedPermission.includes(teamMember.permission)) {
        continue;
      }

      return false;
    }

    return true;
  }

  /**
   * Check if the user's subscription can update team member
   *
   * @param userId
   * @param teamMemberId
   */
  async canUpdateTeamMembers(
    userId: string,
    teamMemberId: string,
  ): Promise<boolean> {
    if (await this.subscriptionService.getActiveByUserId(userId)) {
      return true;
    }

    const limits =
      subscriptionPlans[SubscriptionPlan.BASIC][
        SubscriptionPermission.teamMember
      ];

    const companyIds = await this.getUserCompanyIds(userId);

    const companyTeamMembers = (await this.companyUserService.getAll({
      where: { companyId: { [Op.in]: companyIds }, role: Role.TEAM_MEMBER },
      sorting: { createdAt: ORDER_BY.ASC },
      toJson: true,
      limit: limits as number,
    })) as unknown as ResponsePagination<CompanyUserEntity>;

    for (const teamMember of companyTeamMembers.data) {
      if (teamMemberId !== teamMember.userId) {
        continue;
      }

      return true;
    }

    return false;
  }

  /**
   * Check if the user's subscription allows joining companies
   *
   * @param userId
   */
  async canJoinCompanies(userId: string): Promise<boolean> {
    if (await this.subscriptionService.getActiveByUserId(userId)) {
      return true;
    }

    const limits =
      subscriptionPlans[SubscriptionPlan.BASIC][
        SubscriptionPermission.joinableCompany
      ];

    const companyUsers = await this.companyUserService.getAllByUserAndRole(
      userId,
      Role.TEAM_MEMBER,
    );

    if (companyUsers.length >= limits) {
      return false;
    }

    return true;
  }

  /**
   * Check if the user's subscription allows creating investor companies
   *
   * @param userId
   * @param teamMembers
   */
  async canCreateInvestorCompanies(
    userId: string,
    teamMembers: InviteTeamMemberDto[],
  ): Promise<boolean> {
    if (await this.subscriptionService.getActiveByUserId(userId)) {
      return true;
    }

    const limits =
      subscriptionPlans[SubscriptionPlan.BASIC][
        SubscriptionPermission.investorCompany
      ];

    const companyUsers = await this.companyUserService.getAllByUserAndRole(
      userId,
      Role.OWNER,
    );

    if (companyUsers.length >= limits) {
      return false;
    }

    if (teamMembers.length) {
      return this.canCreateTeamMembers(userId, teamMembers);
    }

    return true;
  }

  /**
   * Check if the user's subscription allows updating investor companies
   *
   * @param userId
   * @param companyId
   */
  async canUpdateInvestorCompanies(
    userId: string,
    companyId: string,
  ): Promise<boolean> {
    if (await this.subscriptionService.getActiveByUserId(userId)) {
      return true;
    }

    const limits =
      subscriptionPlans[SubscriptionPlan.BASIC][
        SubscriptionPermission.investorCompany
      ];

    const companyUsers = (await this.companyUserService.getAllByUserAndRole(
      userId,
      Role.OWNER,
      {
        sorting: { createdAt: ORDER_BY.ASC },
        toJson: true,
        limit: limits as number,
      },
    )) as unknown as ResponsePagination<CompanyUserEntity>;

    for (const companyUser of companyUsers.data) {
      if (companyId !== companyUser.companyId) {
        continue;
      }

      return true;
    }

    const company = await this.companyService.getById(companyId, {
      paranoid: false,
    });
    if (company.deletedAt && companyUsers.data.length < limits) {
      return true;
    }

    return false;
  }
}
