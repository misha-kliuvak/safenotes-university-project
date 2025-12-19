import { Body, Controller, Get, Header, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ConfigService } from '@/config';
import { AppService } from '@/main/app.service';
import { MailService } from '@/modules/mail/mail.service';
import { STRIPE_FEE } from '@/modules/payment/constants';
import { PaymentUtils } from '@/modules/payment/payment.utils';
import { SafeNoteUtils } from '@/modules/safe-note/safe-note.utils';
import { TokenService } from '@/modules/token/token.service';
import { Public } from '@/shared/decorators/public.decorator';
import { AmountDto } from '@/shared/dto/amount.dto';

@ApiTags('Main')
@Controller('/')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  @Public()
  @Get('/')
  public home() {
    return this.appService.home();
  }

  @Public()
  @Post('/request-info')
  public async requestInfo() {
    return;
  }

  @Public()
  @Get('/validate-token')
  public validateToken(@Query() { token }: { token: string }) {
    return this.tokenService.validateServiceToken(token);
  }

  @Public()
  @Get('/stripe-fee')
  public getStripeFee() {
    return {
      fee: STRIPE_FEE,
    };
  }

  @Public()
  @Get('/fee')
  publicgetFee(@Query() { amount }: AmountDto) {
    const platformFee = SafeNoteUtils.calculatePlatformFee(amount);
    const stripeFee = PaymentUtils.calculateStripeFee(amount);

    return {
      stripeFee,
      platformFee,
      totalFee: platformFee + stripeFee,
    };
  }

  @Public()
  @Post('/generate-pdf')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="safe.pdf"')
  public async generatePdf(@Body() body: { html: string }) {
    return this.appService.generatePdf(body.html);
  }
}
