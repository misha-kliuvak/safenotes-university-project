import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ConfigService } from '@/config';
import { SkipOtpAuth } from '@/modules/auth/opt.decorator';
import { SendEmailEvent } from '@/modules/mail/constants';
import {
  VerifyEmailEventPayload,
  ContactAttemptEventPayload,
  SendFeedbackEventPayload,
} from '@/modules/mail/types';
import { IMAGE_EXTENSIONS } from '@/modules/storage/constants';
import { SubscriptionService } from '@/modules/subscription/service/subscription.service';
import { SendContactAttemptDto } from '@/modules/user/dto/send-contact-attempt.dto';
import { SendFeedbackDto } from '@/modules/user/dto/send-feedback.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { RawUser } from '@/modules/user/types';
import { CurrentUser, CurrentUserId } from '@/modules/user/user.decorator';
import { UserService } from '@/modules/user/user.service';
import { Public } from '@/shared/decorators/public.decorator';
import { MulterFile } from '@/shared/types';

import { BodyFile } from '../storage/file.decorators';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get('me')
  @HttpCode(200)
  @SkipOtpAuth()
  async currentUser(@CurrentUserId() userId: string) {
    return this.userService.getUserByID(userId);
  }

  @Patch('')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  async updateUser(
    @CurrentUser() user: RawUser,
    @Body() body: UpdateUserDto,
    @BodyFile({ extensions: IMAGE_EXTENSIONS })
    imageFile: MulterFile,
  ) {
    if (imageFile) body.image = imageFile;
    return this.userService.update(user.id, body);
  }

  @Public()
  @Get('/public-by-email')
  async getUserByEmail(@Query() query: { email: string }) {
    return this.userService.getPublicUserByEmail(query.email);
  }

  @Get('/resend-verify-email')
  async resendVerifyEmail(@CurrentUser() user: RawUser) {
    this.eventEmitter.emit(SendEmailEvent.VERIFY, {
      to: user.email,
      userName: user.fullName,
    } as VerifyEmailEventPayload);
  }

  @Post('/contact-attempt')
  async sendContactAttempt(
    @CurrentUser() user: RawUser,
    @Body() body: SendContactAttemptDto,
  ) {
    const recipient = this.configService.getAppConfig().requestInfoRecipient;

    this.eventEmitter.emit(SendEmailEvent.CONTACT_ATTEMPT, {
      to: recipient,
      topic: body.topic,
      message: body.message,
      senderEmail: user.email,
    } as ContactAttemptEventPayload);
  }

  @Post('/feedback')
  async sendFeedback(
    @CurrentUser() user: RawUser,
    @Body() body: SendFeedbackDto,
  ) {
    const recipient = this.configService.getAppConfig().requestInfoRecipient;

    this.eventEmitter.emit(SendEmailEvent.SEND_FEEDBACK, {
      to: recipient,
      rating: body.rating,
      feedback: body.feedback,
      senderEmail: user.email,
    } as SendFeedbackEventPayload);
  }

  @Public()
  @Get('/validate-token')
  validateUserToken(@Query() { token }: { token: string }) {
    return this.userService.validateUserToken(token);
  }

  @Post('/send-otp-code')
  async sendOtpCode(@CurrentUser() user: RawUser) {
    return this.userService.helper.sendOtpCodeEmail(user);
  }

  @Get('/subscriptions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get subscription list' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  subscriptions(@CurrentUser() user: RawUser) {
    return this.subscriptionService.getAllByUserId(user.id);
  }
}
