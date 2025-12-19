import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@/config';
import { CompleteResetPasswordDto } from '@/modules/auth/dto/complete-reset-passwor.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegistrationDto } from '@/modules/auth/dto/registration.dto';
import { AuthResponse } from '@/modules/auth/types';
import { TxService } from '@/modules/database/tx.service';
import { Logger } from '@/modules/logger/logger';
import { MailService } from '@/modules/mail/mail.service';
import { TokenService } from '@/modules/token/token.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly txService: TxService,
  ) {}

  public generateAccessToken(user: UserEntity) {
    return this.tokenService.createAccessToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      oauthProviders: user.oauthProviders,
    });
  }

  public getAuthResponse(user: UserEntity): AuthResponse {
    const accessToken = this.generateAccessToken(user);

    return {
      user,
      accessToken,
    };
  }

  public async oAuthLogin(req, res) {
    const { user: authenticatedUser } = req;

    const user = await this.userService.getById(authenticatedUser.id);

    if (!user) {
      throw new NotFoundException();
    }

    const accessToken = this.generateAccessToken(user);

    const { oauthSignUpCallbackUrl, oauthLoginCallbackUrl } =
      this.configService.getUrlConfig();

    const redirectUrl = user.isOnboardingComplete
      ? oauthLoginCallbackUrl
      : oauthSignUpCallbackUrl;

    const urlWithToken = `${redirectUrl}?accessToken=${accessToken}`;
    res.redirect(urlWithToken);
  }

  public async signUp(data: RegistrationDto): Promise<AuthResponse> {
    data.active = true;

    const user: UserEntity = await this.userService.createOrUpdate(data);

    try {
      this.userService.helper.sendWelcomeEmail(user.email, user.fullName);

      return this.getAuthResponse(user);
    } catch (err) {
      this.logger.error('[sign up]', err.stack);
      throw new InternalServerErrorException(
        'Cannot register the user. Contact an admin!',
      );
    }
  }

  public async login(data: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.authenticate(data);

    return this.getAuthResponse(user);
  }

  public async logout(userId: string, token: string): Promise<void> {
    await this.tokenService.invalidate(token);
    await this.userService.updateOtpAuth(userId, { otpVerified: false });
  }

  public async confirmAndGetEmail(token): Promise<string> {
    if (!token) {
      throw new BadRequestException('Token is not provided');
    }

    const response = await this.tokenService.validateServiceToken(token);

    if (response.valid) {
      const email = response.data?.email;

      const user = await this.userService.getByEmail(email);
      if (!user) throw new NotFoundException('User not found');

      await this.userService.verifyEmail(user.id);
      return email;
    }
    throw new BadRequestException('Token is invalid or expired');
  }

  public extractTokenFromBearerHeader(bearerToken: string) {
    const parts = bearerToken.split(' ');
    const bearer = parts[0];
    const token = parts[1];

    if (bearer !== 'Bearer') {
      throw new BadRequestException('Wrong token format');
    }

    return token;
  }

  public async resetPassword(email: string) {
    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new NotFoundException({
        email: ['Couldn’t find an account with this email'],
      });
    }

    await this.mailService.sendResetPasswordEmail({ to: user.email });
  }

  public async completeResetPassword({
    token,
    password,
  }: CompleteResetPasswordDto) {
    const response = await this.tokenService.validateServiceToken(token);

    if (response.valid) {
      return this.txService.transaction(async (transaction) => {
        let user = await this.userService.getByEmail(response.data?.email, {
          transaction,
        });

        if (!user) throw new NotFoundException('User not found');

        await Promise.all([
          this.userService.activateUser(user.id, transaction),
          this.userService.savePassword(user.id, password, { transaction }),
        ]);

        user = await this.userService.getById(user.id, {
          transaction,
        });

        return this.getAuthResponse(user);
      });
    }
    throw new BadRequestException(
      'Token is expired or invalid. Try to reset password once again.',
    );
  }
}
