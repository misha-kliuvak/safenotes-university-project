import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { Filters, Pagination } from '@/modules/database/decorator';
import { PaginationDto } from '@/modules/database/dto/pagination.dto';
import { NotificationFilterDto } from '@/modules/notification/dto/notification-filter.dto';
import { NotificationMarkAsReadDto } from '@/modules/notification/dto/notification-mark-as-read.dto';
import { NotificationService } from '@/modules/notification/notification.service';
import { CurrentUserId } from '@/modules/user/user.decorator';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all user notifications',
    description: 'Return list of all notifications for a user',
  })
  @ApiQuery({ type: NotificationFilterDto })
  async getUserNotifications(
    @CurrentUserId() currentUserId: string,
    @Filters(NotificationFilterDto)
    { companyId, ...filters }: NotificationFilterDto,
    @Pagination() pagination: PaginationDto,
  ) {
    return this.notificationService.getUserAll(currentUserId, {
      pagination,
      filters,
      dynamicFilters: {
        companyId,
      },
    });
  }

  @Get('count')
  @ApiOperation({
    summary: 'Get count of user unread notifications',
    description: 'Return count of all unread notifications for a user',
  })
  @ApiQuery({ type: NotificationFilterDto })
  async getNotificationCount(
    @CurrentUserId() currentUserId: string,
    @Filters(NotificationFilterDto)
    { companyId }: NotificationFilterDto,
  ) {
    return this.notificationService.getUserUnreadCount(
      currentUserId,
      companyId,
    );
  }

  @Patch()
  @ApiOperation({
    summary: 'Mark user notifications as read',
    description: 'Return list of all notifications for a user',
  })
  @ApiExtraModels(NotificationMarkAsReadDto)
  @ApiBody({
    schema: {
      allOf: [{ $ref: getSchemaPath(NotificationMarkAsReadDto) }],
    },
  })
  async markNotificationsAsRead(@Body() dto: NotificationMarkAsReadDto) {
    return this.notificationService.markNotificationsAsRead(dto);
  }
}
