import { BadRequestException, Global, Injectable } from '@nestjs/common';
import { encode } from 'hi-base32';
import { TOTP } from 'otpauth';
import { v4 } from 'uuid';

@Injectable()
@Global()
export class OtpService {
  public async generateSecret() {
    return encode(v4()).substring(0, 24);
  }

  public async convertInputToSecret(input: string = v4()) {
    return encode(input).substring(0, 24);
  }

  public async getTOTP(secret: string, options?: TOTPOptions) {
    return new TOTP({
      issuer: 'MySAFEnotes',
      algorithm: 'SHA1',
      label: options?.label || '2FA',
      digits: options?.digits || 6,
      period: options?.period || 30,
      secret: secret,
    });
  }

  public async generate(secret?: string, options?: TOTPOptions) {
    const totp = await this.getTOTP(secret, options);

    return totp.generate();
  }

  public async validate(
    secret: string,
    token: string,
    throwError?: boolean,
  ): Promise<boolean> {
    const totp = await this.getTOTP(secret);

    const delta = totp.validate({
      token,
      window: 1,
    });

    const isValid = delta !== null;

    if (!isValid && throwError) {
      throw new BadRequestException('OTP code is not valid');
    }

    return isValid;
  }
}
