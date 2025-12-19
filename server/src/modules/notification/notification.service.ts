import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Op } from 'sequelize';

import { ORDER_BY } from '@/modules/database/enums';
import { ServiceQueryOptions } from '@/modules/database/types';
import { Logger } from '@/modules/logger/logger';
import { SendNotificationEvent } from '@/modules/notification/constants';
import { IncomingSafeNotificationDto } from '@/modules/notification/dto/incoming-safe.dto';
import { NotificationMarkAsReadDto } from '@/modules/notification/dto/notification-mark-as-read.dto';
import { PayedSafeNotificationDto } from '@/modules/notification/dto/payed-safe-note.dto';
import { SignedSafeNotificationDto } from '@/modules/notification/dto/signed-safe.dto';
import { TeamMemberRequestNotificationDto } from '@/modules/notification/dto/team-member-request';
import { NotificationType } from '@/modules/notification/enums';
import { NotificationRepository } from '@/modules/notification/repository/notification.repository';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  private async handler(callback) {
    try {
      await callback();
    } catch (err) {
      this.logger.error('[sendNotification]: ' + err.message, err.stack);
    }
  }

  public async getUserAll(userId: string, options?: ServiceQueryOptions) {
    return this.notificationRepository.getAll({
      where: { userId },
      sorting: { createdAt: ORDER_BY.DESC },
      ...options,
    });
  }

  public async getUserUnreadCount(userId: string, companyId?: string) {
    return this.notificationRepository.count({
      where: {
        userId,
        ...(companyId && { companyId }),
        read: false,
      },
    });
  }

  public async markNotificationsAsRead({ ids }: NotificationMarkAsReadDto) {
    return this.notificationRepository.update(
      { read: true },
      {
        where: {
          id: {
            [Op.in]: ids,
          },
        },
        returning: false,
      },
    );
  }

  @OnEvent(SendNotificationEvent.INCOMING_SAFE_NOTE)
  public async sendIncomingSafeNotification(dto: IncomingSafeNotificationDto) {
    await this.handler(async () => {
      await this.notificationRepository.create({
        ...dto,
        type: NotificationType.INCOMING_SAFE_NOTE,
      });
    });
  }

  @OnEvent(SendNotificationEvent.TEAM_MEMBER_REQUEST)
  public async sendTeamMemberRequestNotification(
    dto: TeamMemberRequestNotificationDto,
  ) {
    await this.handler(async () => {
      await this.notificationRepository.create({
        ...dto,
        type: NotificationType.TEAM_MEMBER_REQUEST,
      });
    });
  }

  @OnEvent(SendNotificationEvent.SIGNED_SAFE_NOTE)
  public async sendAcceptedSafeNoteNotification(
    dto: SignedSafeNotificationDto,
  ) {
    await this.handler(async () => {
      await this.notificationRepository.create({
        ...dto,
        type: NotificationType.SIGNED_SAFE_NOTE,
      });
    });
  }

  @OnEvent(SendNotificationEvent.PAYED_SAFE_NOTE)
  public async sendPayedSafeNoteNotification(dto: PayedSafeNotificationDto) {
    await this.handler(async () => {
      await this.notificationRepository.create({
        ...dto,
        type: NotificationType.PAYED_SAFE_NOTE,
      });
    });
  }
}
