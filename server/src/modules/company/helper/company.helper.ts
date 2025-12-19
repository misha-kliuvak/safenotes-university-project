import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { CompanyType } from '@/modules/company/enums';
import { AngelCompanyRepository } from '@/modules/company/repository/angel-company.repository';
import { EntrepreneurCompanyRepository } from '@/modules/company/repository/entrepreneur-company.repository';
import { SendEmailEvent } from '@/modules/mail/constants';
import { InviteToTeamEmailEventPayload, RequestPermissionEventPayload } from '@/modules/mail/types';
import { SendNotificationEvent } from '@/modules/notification/constants';
import { TeamMemberRequestNotificationDto } from '@/modules/notification/dto/team-member-request';
import { UserEntity } from '@/modules/user/entity/user.entity';

@Injectable()
export class CompanyHelper {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly entrepreneurCompanyRepository: EntrepreneurCompanyRepository,
    private readonly angelCompanyRepository: AngelCompanyRepository,
  ) {
  }

  public getRepositoryForCompany(type: CompanyType) {
    const repositoryMapper = {
      [CompanyType.ENTREPRENEUR]: this.entrepreneurCompanyRepository,
      [CompanyType.ANGEL]: this.angelCompanyRepository,
    };

    return repositoryMapper[type];
  }

  public sendInviteEmail(
    company: CompanyEntity,
    inviter: UserEntity,
    recipient: UserEntity,
    teamSize: number | string,
    companyVerified = false,
  ) {
    const eventPayload: InviteToTeamEmailEventPayload = {
      to: recipient.email,
      userName: recipient.fullName,
      inviterName: inviter.fullName,
      inviterPhoto: inviter.image,
      companyImage: company.image,
      companyName: company.name,
      companyId: company.id,
      isUserActive: recipient.active,
      teamSize,
      companyVerified,
    };

    this.eventEmitter.emit(SendEmailEvent.INVITE_TO_TEAM, eventPayload);
  }

  public sendInviteNotification(
    company: CompanyEntity,
    inviter: UserEntity,
    recipient: UserEntity,
  ) {
    const notification: TeamMemberRequestNotificationDto = {
      userId: recipient.id,
      payload: {
        inviterName: inviter.fullName,
        inviterImage: inviter.image,
        companyName: company.name,
        companyId: company.id,
        companyImage: company.image,
      },
    };

    this.eventEmitter.emit(
      SendNotificationEvent.TEAM_MEMBER_REQUEST,
      notification,
    );
  }

  public sendPermissionRequestEmail(
    company: CompanyEntity,
    requester: UserEntity,
    recipient: UserEntity,
    teamSize: number | string,
    companyVerified = false,
  ) {
    const eventPayload: RequestPermissionEventPayload = {
      to: recipient.email,
      companyLogo: company.image,
      companyName: company.name,
      companyId: company.id,
      membersCount: Number(teamSize),
      companyVerified,
      requesterName: requester.fullName,
    };

    this.eventEmitter.emit(SendEmailEvent.REQUEST_PERMISSION, eventPayload);
  }
}
