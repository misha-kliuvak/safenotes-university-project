import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy, VerifyCallback } from 'passport-linkedin-oauth2';

import { ConfigService } from '@/config';
import { OAuthStrategy } from '@/modules/auth/enums';
import { OAuthService } from '@/modules/auth/service/oauth.service';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(
  Strategy,
  OAuthStrategy.LINKEDIN,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly oauthService: OAuthService,
  ) {
    const { clientId, clientSecret } = configService.getLinkedinConfig();
    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: oauthService.getCallbackUrl(OAuthStrategy.LINKEDIN),
      scope: ['r_emailaddress', 'r_liteprofile'],
    });
  }

  async validate(
    _: string,
    __: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const user = await this.oauthService.authenticate(
      profile,
      OAuthStrategy.LINKEDIN,
    );
    done(null, user);
  }
}
