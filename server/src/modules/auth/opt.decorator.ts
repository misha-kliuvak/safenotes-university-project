import { SetMetadata } from '@nestjs/common';

export const SKIP_OTP_AUTH_DECORATOR_KEY = 'isOtpRoute';
export const SkipOtpAuth = () => SetMetadata(SKIP_OTP_AUTH_DECORATOR_KEY, true);
