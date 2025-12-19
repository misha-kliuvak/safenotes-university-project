import { Module } from '@nestjs/common';

import { OAuthService } from '@/modules/auth/service/oauth.service';
import { TwoFactorAuthService } from '@/modules/auth/service/two-factor-auth.service';
import { MailModule } from '@/modules/mail/mail.module';
import { UserModule } from '@/modules/user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LinkedInStrategy } from './strategies/linkedin.strategy';

@Module({
  imports: [UserModule, MailModule],
  controllers: [AuthController],
  providers: [
    OAuthService,
    AuthService,
    GoogleStrategy,
    LinkedInStrategy,
    FacebookStrategy,
    TwoFactorAuthService,
  ],
})
export class AuthModule {}
