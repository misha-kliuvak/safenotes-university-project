import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SKIP_OTP_AUTH_DECORATOR_KEY } from '@/modules/auth/opt.decorator';
import { AuthService } from '@/modules/auth/service/auth.service';
import { TokenService } from '@/modules/token/token.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { RawUser } from '@/modules/user/types';
import { UserService } from '@/modules/user/user.service';
import { BaseGuard } from '@/shared/common/base.guard';
import { RequestWithUser } from '@/shared/types';

@Injectable()
export class JwtAuthGuard extends BaseGuard {
  constructor(
    public readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super(reflector);
  }

  private async checkIfOtpEnabled(user: UserEntity, isOtpRoute: boolean) {
    if (user.otpEnabled && !user.otpVerified) {
      // for 2FA allow access only for otp routes
      return isOtpRoute;
    }

    return true;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await super.isPublicRoute(context)) return true;

    const request: RequestWithUser = context.switchToHttp().getRequest();

    const authorization: string = request.headers['authorization'];
    if (!authorization) throw new UnauthorizedException();

    const token = this.authService.extractTokenFromBearerHeader(authorization);
    const validatedToken = await this.tokenService.validateAccessToken(token);
    const user = await this.userService.getById(validatedToken.data?.id, {
      throwNotFound: false,
    });

    if (!validatedToken.valid && user?.id) {
      await this.userService.updateOtpAuth(user.id, { otpVerified: false });
    }

    if (!validatedToken.valid || !user?.id) throw new UnauthorizedException();

    request.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      oauthProviders: user.oauthProviders,
      emailVerified: user.emailVerified,
      otpEnabled: user.otpEnabled,
      otpVerified: user.otpVerified,
      otpAuthUrl: user.otpAuthUrl,
    } as RawUser;
    request.userToken = token;

    const isOtpRoute = this.reflector.get<boolean>(
      SKIP_OTP_AUTH_DECORATOR_KEY,
      context.getHandler(),
    );

    return this.checkIfOtpEnabled(user, isOtpRoute);
  }
}
