import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy, VerifyCallback } from 'passport-facebook';

import { ConfigService } from '@/config';
import { OAuthStrategy } from '@/modules/auth/enums';
import { OAuthService } from '@/modules/auth/service/oauth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(
  Strategy,
  OAuthStrategy.FACEBOOK,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly oauthService: OAuthService,
  ) {
    const { clientId, clientSecret } = configService.getFacebookConfig();

    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: oauthService.getCallbackUrl(OAuthStrategy.FACEBOOK),
      scope: 'email',
      profileFields: ['id', 'displayName', 'name', 'photos', 'emails'],
    });
  }

  async validate(
    accessToken,
    refreshToken,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const user = this.oauthService.authenticate(
      profile,
      OAuthStrategy.FACEBOOK,
    );
    done(null, user);
  }
}
