import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

import { ConfigService } from '@/config';
import { OAuthStrategy } from '@/modules/auth/enums';
import { OAuthService } from '@/modules/auth/service/oauth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  OAuthStrategy.GOOGLE,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly oauthService: OAuthService,
  ) {
    const { clientId, clientSecret } = configService.getGoogleConfig();
    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: oauthService.getCallbackUrl(OAuthStrategy.GOOGLE),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const user = await this.oauthService.authenticate(
      profile,
      OAuthStrategy.GOOGLE,
    );

    done(null, user);
  }
}
