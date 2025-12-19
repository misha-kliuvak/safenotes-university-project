import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { SendEmailEvent } from '@/modules/mail/constants';
import {
  InviteToPlatformEmailEventPayload,
  OtpEmailPayload,
  WelcomeEmailEventPayload,
} from '@/modules/mail/types';
import { OtpService } from '@/modules/otp/otp.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { RawUser } from '@/modules/user/types';
import { getFirstName } from '@/shared/utils';

@Injectable()
export class UserHelper {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly otpService: OtpService,
  ) {}

  public sendWelcomeEmail(email: string, fullName: string) {
    const firstName = getFirstName(fullName);

    this.eventEmitter.emit(SendEmailEvent.WELCOME, {
      to: email,
      userName: firstName,
    } as WelcomeEmailEventPayload);
  }

  public sendInviteToUser(inviter: UserEntity | null, user: UserEntity): void {
    const eventPayload: InviteToPlatformEmailEventPayload = {
      to: user.email,
      userName: user.fullName || 'User',
      inviterName: inviter?.fullName || 'MySAFEnotes',
      inviterEmail: inviter?.email || 'admin@mysafenotes.conm',
      inviterPhoto: inviter?.image,
    };

    this.eventEmitter.emit(SendEmailEvent.INVITE_TO_PLATFORM, eventPayload);
  }

  public async sendOtpCodeEmail(user: RawUser) {
    const code = await this.otpService.generate(
      await this.otpService.convertInputToSecret(user.id),
      { period: 600 },
    ); // code lasts 10min

    this.eventEmitter.emit(SendEmailEvent.OTP, {
      to: user.email,
      userName: user.fullName,
      code,
    } as OtpEmailPayload);

    return {
      message: 'OTP code has been sent to your email',
    };
  }
}
