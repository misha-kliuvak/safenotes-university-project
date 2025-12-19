import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { ConfigService } from '@/config';
import { OAuthFilter } from '@/modules/auth/auth.filter';
import { CompleteResetPasswordDto } from '@/modules/auth/dto/complete-reset-passwor.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegistrationDto } from '@/modules/auth/dto/registration.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { VerifyOtpDto } from '@/modules/auth/dto/verify-otp.dto';
import { OAuthStrategy } from '@/modules/auth/enums';
import { SkipOtpAuth } from '@/modules/auth/opt.decorator';
import { TwoFactorAuthService } from '@/modules/auth/service/two-factor-auth.service';
import { RawUser } from '@/modules/user/types';
import {
  CurrentUser,
  CurrentUserId,
  UserToken,
} from '@/modules/user/user.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { TrimPipe } from '@/shared/pipe/trim.pipe';

import { AuthService } from './service/auth.service';

@Public()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  @Public()
  @Get()
  index() {
    return {
      supportedOAuthStrategies: ['/google', '/linkedin', '/facebook'],
    };
  }

  @Public()
  @Get('/google')
  @UseGuards(AuthGuard(OAuthStrategy.GOOGLE) as any)
  @UseFilters(OAuthFilter)
  async googleAuth() {
    return;
  }

  @Public()
  @Get('/google/redirect')
  @UseGuards(AuthGuard(OAuthStrategy.GOOGLE) as any)
  @UseFilters(OAuthFilter)
  googleAuthRedirect(@Req() req, @Res() res) {
    return this.authService.oAuthLogin(req, res);
  }

  @Public()
  @Get('linkedin')
  @UseGuards(AuthGuard(OAuthStrategy.LINKEDIN) as any)
  @UseFilters(OAuthFilter)
  async linkedinAuth() {
    return;
  }

  @Public()
  @Get('/linkedin/redirect')
  @UseGuards(AuthGuard(OAuthStrategy.LINKEDIN) as any)
  @UseFilters(OAuthFilter)
  linkedinAuthRedirect(@Req() req, @Res() res) {
    return this.authService.oAuthLogin(req, res);
  }

  @Public()
  @Get('/facebook')
  @UseGuards(AuthGuard(OAuthStrategy.FACEBOOK) as any)
  @UseFilters(OAuthFilter)
  async facebookAuth() {
    return;
  }

  @Public()
  @Get('/facebook/redirect')
  @UseGuards(AuthGuard(OAuthStrategy.FACEBOOK) as any)
  @UseFilters(OAuthFilter)
  facebookAuthRedirect(@Req() req, @Res() res) {
    return this.authService.oAuthLogin(req, res);
  }

  @Public()
  @Post('/registration')
  async registration(@Body() data: RegistrationDto) {
    return this.authService.signUp(data);
  }

  @Public()
  @Post('/login')
  @HttpCode(200)
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  public async logout(@CurrentUserId() userId: string, @UserToken() token) {
    return this.authService.logout(userId, token);
  }

  @Public()
  @Get('/confirm-email')
  async confirmEmail(@Query(new TrimPipe()) { token }, @Res() res) {
    // TODO implement redirect to front 404 and refactor e2e tests
    const email = await this.authService.confirmAndGetEmail(token);
    const { authVerifyCompleteUrl } = this.configService.getUrlConfig();

    if (email) {
      return res.redirect(`${authVerifyCompleteUrl}?email=${email}`);
    }
  }

  @Public()
  @Post('/reset-password-request')
  resetPasswordRequest(@Body() { email }: ResetPasswordDto) {
    return this.authService.resetPassword(email);
  }

  @Public()
  @Post('/complete-reset-password')
  completeResetPassword(@Body() body: CompleteResetPasswordDto) {
    return this.authService.completeResetPassword(body);
  }

  @Post('/otp/generate')
  @SkipOtpAuth()
  generateOtp(@CurrentUserId() userId: string) {
    return this.twoFactorAuthService.generateOtp(userId);
  }

  @Post('/otp/verify')
  @HttpCode(HttpStatus.OK)
  @SkipOtpAuth()
  verifyOtp(@CurrentUserId() userId: string, @Body() body: VerifyOtpDto) {
    return this.twoFactorAuthService.verifyOtp(userId, body);
  }

  @Post('/otp/disable')
  @HttpCode(HttpStatus.OK)
  @SkipOtpAuth()
  disableOtp(@CurrentUserId() userId: string) {
    return this.twoFactorAuthService.disableOtp(userId);
  }

  @Post('/otp/qrcode')
  @HttpCode(HttpStatus.OK)
  @SkipOtpAuth()
  @Header('Content-Type', 'image/png')
  @Header('Content-Disposition', 'attachment; filename="qrcode.png"')
  generateQRCode(@Res() res, @CurrentUser() user: RawUser) {
    return this.twoFactorAuthService.generateQRCode(res, user);
  }
}
