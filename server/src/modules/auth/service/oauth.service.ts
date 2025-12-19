import { BadRequestException, Injectable } from '@nestjs/common';
import { Profile } from 'passport';

import { ConfigService } from '@/config';
import { OAuthStrategy } from '@/modules/auth/enums';
import {
  AuthenticatedUser,
  OAuthProvider,
  OAuthUserModel,
} from '@/modules/auth/types';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class OAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  /**
   * Function to get the correct url in API for OAuth strategy
   * to complete redirect after successful login
   *
   * @param strategy
   */
  public getCallbackUrl(strategy: OAuthStrategy): string {
    const { apiUrl } = this.configService.getUrlConfig();

    return `${apiUrl}/auth/${strategy}/redirect`;
  }

  /**
   * Map photos from profile to array of string
   * @param photos
   */
  public mapProfilePhotos(
    photos: Array<{ value: string }> | undefined,
  ): string[] | null {
    if (!photos) return null;

    return photos.map((i: { value: string }) => i.value);
  }

  /**
   * Parse data received from OAuth profile to user entity
   * @param profile
   * @param strategy
   */
  public parseProfileToUserModel(
    profile: Profile,
    strategy: OAuthStrategy,
  ): OAuthUserModel {
    const { id: providerId, emails = [], name } = profile;

    if (!emails?.length) {
      throw new BadRequestException(
        `Emails cannot be retrieved from ${strategy}`,
      );
    }

    const email = emails[0].value;

    const profilePhotos = this.mapProfilePhotos(profile.photos);
    const userImage = profilePhotos.length ? profilePhotos[0] : null;

    return {
      email,
      fullName: `${name.givenName} ${name.familyName}`,
      image: userImage,
      provider: {
        id: providerId,
        strategy,
      },
    };
  }

  public getCombinedUserProviders(
    newProvider: OAuthProvider,
    providers: OAuthProvider[],
  ) {
    if (!providers?.length) return [newProvider];

    return providers.map((provider: OAuthProvider) => {
      if (provider.strategy === newProvider.strategy) {
        return newProvider;
      }
      return provider;
    });
  }

  /**
   * Parsing profile to user model and creating user if was not created before
   * @param profile
   * @param provider
   */
  public async authenticate(
    profile: Profile,
    provider: OAuthStrategy,
  ): Promise<AuthenticatedUser> {
    const model = this.parseProfileToUserModel(profile, provider);
    const candidate = await this.userService.getByEmail(model.email);

    // creating user
    if (!candidate) {
      const user = await this.userService.create({
        ...model,
        providers: [model.provider],
        active: true,
      });

      // send welcome email
      this.userService.helper.sendWelcomeEmail(model.email, model.fullName);

      return {
        id: user.id,
        isNew: true,
      };
    }

    // updating user with parsed data from strategy
    const user = await this.userService.update(candidate.id, {
      // Update user full name if for first login it was not fetched
      fullName: !candidate.fullName ? model.fullName : candidate.fullName,

      // Update user image name if for first login it was not fetched
      image: !candidate.image ? model.image : candidate.image,

      oauthProviders: this.getCombinedUserProviders(
        model.provider,
        candidate.oauthProviders,
      ),
      active: true,
    });

    // we check here if candidate was not active before instead of user
    // because we make user active anyway, as this function called
    if (!candidate.active) {
      // send welcome email
      this.userService.helper.sendWelcomeEmail(model.email, model.fullName);
    }

    return {
      id: user.id,
      isNew: false,
    };
  }
}
