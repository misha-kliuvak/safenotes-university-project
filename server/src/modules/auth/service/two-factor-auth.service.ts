import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as QRCode from 'qrcode';
import { Writable } from 'stream';

import { VerifyOtpDto } from '@/modules/auth/dto/verify-otp.dto';
import { AuthService } from '@/modules/auth/service/auth.service';
import { Logger } from '@/modules/logger/logger';
import { OtpService } from '@/modules/otp/otp.service';
import { RawUser } from '@/modules/user/types';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class TwoFactorAuthService {
  private readonly logger = new Logger(TwoFactorAuthService.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  public async generateQRCode(stream: Writable, user: RawUser) {
    if (user.otpEnabled) {
      throw new ForbiddenException(
        'Cannot generate QRCode once otp is enabled',
      );
    }
    const dataUrl = user.otpAuthUrl;

    if (!dataUrl.trim()) {
      throw new BadRequestException('OTP Auth url is not valid');
    }

    try {
      return await QRCode.toFileStream(stream, dataUrl);
    } catch (err) {
      this.logger.error(`Cannot generate otp QRCode`, err.stack);
      throw new InternalServerErrorException('Cannot generate QRCode');
    }
  }

  public async generateOtp(userId: string) {
    const user = await this.userService.getById(userId);

    if (user.otpEnabled) {
      throw new BadRequestException(
        'Two-Factor Authentication already enabled',
      );
    }

    const otpSecret = await this.otpService.generateSecret();
    const totp = await this.otpService.getTOTP(otpSecret, {
      label: user.email,
      period: 30,
    });

    const otpAuthUrl = totp.toString();

    await this.userService.registerOtpAuth(userId, {
      otpAuthUrl,
      otpSecret,
    });

    return {
      otpAuthUrl,
      otpSecret,
    };
  }

  public async verifyOtp(userId: string, { code }: VerifyOtpDto) {
    let user = await this.userService.getById(userId);

    await this.otpService.validate(user.otpSecret, code, true);

    user = await this.userService.updateOtpAuth(userId, {
      otpEnabled: true,
      otpVerified: true,
    });

    return this.authService.getAuthResponse(user);
  }

  public async disableOtp(userId: string) {
    await this.userService.updateOtpAuth(userId, {
      otpEnabled: false,
      otpVerified: false,
    });
  }
}
