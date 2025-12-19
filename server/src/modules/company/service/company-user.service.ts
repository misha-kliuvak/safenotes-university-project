import { Injectable } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

import { CreateAngelCompanyDto } from '@/modules/company/dto/create-angel-company.dto';
import { CreateCompanyUserDto } from '@/modules/company/dto/create-company-user.dto';
import { CreateEntrepreneurCompanyDto } from '@/modules/company/dto/create-entrepreneur-company.dto';
import { CompanyUserEntity } from '@/modules/company/entity/company-user.entity';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { VerificationStatus } from '@/modules/company/enums';
import { CompanyHelper } from '@/modules/company/helper/company.helper';
import { CompanyUserRepository } from '@/modules/company/repository/company-user.repository';
import { CompanyService } from '@/modules/company/service/company.service';
import { BaseServiceImpl } from '@/modules/database/base.service';
import { ICreateOptions, IFindOptions } from '@/modules/database/types';
import { Logger } from '@/modules/logger/logger';
import { InviteTeamMemberDto } from '@/modules/team-member/dto/invite-team-member.dto';
import { UpdateTeamMemberDto } from '@/modules/team-member/dto/update-team-member.dto';
import { TeamMemberService } from '@/modules/team-member/team-member.service';
import { MappedTeamMember } from '@/modules/team-member/types';
import { UserService } from '@/modules/user/user.service';
import { InviteStatus, Permission, Role } from '@/shared/enums';

@Injectable()
export class CompanyUserService extends BaseServiceImpl<CompanyUserEntity> {
  private readonly logger = new Logger(CompanyUserService.name);

  constructor(
    private readonly companyUserRepository: CompanyUserRepository,
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
    private readonly teamMemberService: TeamMemberService,
    private readonly companyHelper: CompanyHelper,
  ) {
    super(companyUserRepository);
  }

  public async getAllByUserAndRole(
    userId: string,
    role: Role,
    options?: IFindOptions,
  ) {
    return this.companyUserRepository.getAll({
      include: [
        {
          model: CompanyEntity,
          where: {
            deletedAt: null,
          },
        },
      ],
      ...options,
      where: {
        userId,
        role,
      },
    });
  }

  public async getCompanyUserByRole(
    companyId: string,
    userId: string,
    role: Role | Role[],
  ) {
    return this.companyUserRepository.getOne({
      where: {
        companyId,
        userId,
        ...(Array.isArray(role) ? { role: { [Op.in]: role } } : { role }),
      },
    });
  }

  public async createCompany(
    ownerId: string,
    {
      teamMembers,
      ...data
    }: CreateAngelCompanyDto | CreateEntrepreneurCompanyDto,
  ) {
    const company = await this.companyService.create(ownerId, data);

    await this.inviteTeamMembers(ownerId, company.id, teamMembers);

    return this.companyService.getByIdForUser(company.id, ownerId);
  }

  public async create(data: CreateCompanyUserDto, options?: ICreateOptions) {
    return this.companyUserRepository.create(data, options);
  }

  public async updateByCompanyAndUser(
    companyId: string,
    userId: string,
    body: UpdateTeamMemberDto,
  ) {
    await this.userService.updateById(userId, {
      isOnboardingComplete: true,
    });

    if (body.inviteStatus === InviteStatus.DECLINED) {
      return this.deleteByCompanyAndUser(companyId, userId);
    }

    return this.companyUserRepository.update(body, {
      where: {
        companyId,
        userId,
      },
    });
  }

  public async deleteByCompanyAndUser(companyId: string, userId: string) {
    return this.companyUserRepository.delete({
      where: {
        companyId,
        userId,
      },
    });
  }

  public async inviteTeamMembers(
    invitedId: string,
    companyId: string,
    teamMembers: InviteTeamMemberDto[],
    transaction?: Transaction,
  ) {
    const inviter = await this.userService.getById(invitedId);
    const company = await this.companyService.getById(companyId);

    const companyTeamMembers = company.teamMembers.filter(
      (member) => member.inviteStatus === InviteStatus.ACCEPTED,
    );
    const teamSize = companyTeamMembers.length;

    try {
      const resultData = await this.teamMemberService.mapTeamMembers(
        inviter,
        teamMembers,
      );

      if (!resultData?.length) return;

      const createPromiseArr = [];

      resultData.forEach(({ user, data }: MappedTeamMember) => {
        const createTeamMember = () =>
          this.companyUserRepository.createOrUpdate(
            {
              where: {
                companyId: company.id,
                userId: user.id,
              },
              transaction,
            },
            {
              ...data,
              companyId: company.id,
              userId: user.id,
              inviteStatus: InviteStatus.PENDING,
            },
          );

        const sendEmailToTeamMember = () =>
          this.companyHelper.sendInviteEmail(
            company,
            inviter,
            user,
            teamSize,
            company.verificationStatus === VerificationStatus.VERIFIED,
          );

        const sendNotificationToTeamMember = () =>
          this.companyHelper.sendInviteNotification(company, inviter, user);

        createPromiseArr.push(
          createTeamMember().then(() => {
            sendEmailToTeamMember();
            sendNotificationToTeamMember();
          }),
        );
      });

      await Promise.all(createPromiseArr);
    } catch (err) {
      this.logger.error('[inviteTeamMembers] ' + err.message, err.stack);
    }
  }

  public async requestPermission(requesterId: string, companyId: string) {
    const requester = await this.userService.getById(requesterId);
    const company = await this.companyService.getById(companyId);

    const companyTeamMembers = company.companyUsers.filter((member) => {
      if (member.inviteStatus !== InviteStatus.ACCEPTED) return false;

      if (member.id === requesterId) return false;

      return member.permission !== Permission.VIEW;
    });

    const teamSize = companyTeamMembers.length;

    try {
      if (!companyTeamMembers?.length) return;

      companyTeamMembers.forEach((teamMember) => {
        const sendRequestToTeamMember = () =>
          this.companyHelper.sendPermissionRequestEmail(
            company,
            requester,
            teamMember.user,
            teamSize,
            company.verificationStatus === VerificationStatus.VERIFIED,
          );

        if (teamMember.permission !== Permission.VIEW)
          sendRequestToTeamMember();
      });
    } catch (err) {
      this.logger.error('[requestPermissions] ' + err.message, err.stack);
    }
  }
}
