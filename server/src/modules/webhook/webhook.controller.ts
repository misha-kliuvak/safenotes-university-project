import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  BadRequestException,
  Body,
  Req,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { PlaidWebhookDto } from '@/modules/webhook/dto/plaid-webhook.dto';
import { WebhookService } from '@/modules/webhook/webhook.service';
import { Public } from '@/shared/decorators/public.decorator';
import { RequestWithRawBody } from '@/shared/types';

import { PlaidWebhookType } from './types';

@ApiExcludeController()
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public()
  @Post('/stripe')
  @HttpCode(HttpStatus.OK)
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody,
  ) {
    return this.webhookService.handleStripeWebhook(request.rawBody, signature);
  }

  @Public()
  @Post('/plaid')
  @HttpCode(HttpStatus.OK)
  async plaidWebhook(
    @Headers('plaid-verification') signature: string,
    @Req() request: RequestWithRawBody,
    @Body() body: PlaidWebhookDto,
  ) {
    if (!signature) {
      throw new BadRequestException('Verification header is missing');
    }

    const isVerified = await this.webhookService.verifyPlaidWebhook(
      signature,
      request.rawBody,
    );

    if (!isVerified) {
      throw new BadRequestException('Invalid signature');
    }

    switch (body.webhook_type) {
      case PlaidWebhookType.TRANSFER:
        return this.webhookService.handlePlaidTransferWebhook(body);
      default:
        throw new BadRequestException('Invalid webhook type');
    }
  }
}
