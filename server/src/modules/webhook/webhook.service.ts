import { Injectable } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import { importJWK, jwtVerify } from 'jose';
import { decode } from 'jsonwebtoken';
import { TransferEventType } from 'plaid';

import { Logger } from '@/modules/logger/logger';
import { PaymentService } from '@/modules/payment/payment.service';
import { PlaidService } from '@/modules/plaid/plaid.service';
import { StripeService } from '@/modules/stripe/stripe.service';
import { SubscriptionService } from '@/modules/subscription/service/subscription.service';
import { PlaidWebhookDto } from '@/modules/webhook/dto/plaid-webhook.dto';
import { PlaidTransferWebhookCode } from '@/modules/webhook/enums';

@Injectable()
export class WebhookService {
  private readonly logger: Logger = new Logger(WebhookService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly plaidService: PlaidService,
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Handle Stripe Webhook
   *
   * @param payload
   * @param signature
   */
  public async handleStripeWebhook(
    payload: string | Buffer,
    signature: string,
  ) {
    try {
      const paymentIntent = await this.stripeService.handleWebhook(
        payload,
        signature,
      );

      if (!paymentIntent) return;

      if (['charge', 'payment_intent'].includes(paymentIntent.object)) {
        await this.paymentService.updatePaymentByPaymentIntent(paymentIntent);
      }

      if (['invoice'].includes(paymentIntent.object)) {
        await this.subscriptionService.updateSubscriptionByInvoice(
          paymentIntent,
        );
      }
    } catch (error) {
      this.logger.error('[Stripe Webhook]', error.stack);
    }
  }

  public async handlePlaidTransferWebhook(dto: PlaidWebhookDto) {
    switch (dto.webhook_code) {
      case PlaidTransferWebhookCode.TRANSFER_EVENTS_UPDATE:
        this.logger.debug('[Plaid Webhook] Transfer events update');
        const transfers = await this.plaidService.syncTransfer();

        for (const transfer of transfers) {
          try {
            switch (transfer.event_type) {
              case TransferEventType.Failed:
                await this.paymentService.handleFailedPayment(
                  transfer.transfer_id,
                );
                break;

              case TransferEventType.Returned:
              case TransferEventType.RefundSettled:
                await this.paymentService.handleRefundPayment(
                  transfer.transfer_id,
                );
                break;

              default:
                break;
            }
          } catch (error) {
            this.logger.error(
              `[Plaid Webhook] Error processing transfer: ${transfer.transfer_id}`,
              error.stack,
            );
          }
        }

      default:
    }
  }

  async verifyPlaidWebhook(signature: string, body: Buffer) {
    const { header, payload } = decode(signature, { complete: true }) as {
      [key: string]: any;
    };

    // Verify the webhook
    const verificationKey = await this.plaidService.getVerificationKey(
      header.kid,
    );

    try {
      const keyLike = await importJWK(verificationKey);

      await jwtVerify(signature, keyLike, {
        maxTokenAge: '5 min',
      });
    } catch (error) {
      return false;
    }

    const bodyHash = createHash('sha256').update(body).digest();

    const claimedBodyHash = payload.request_body_sha256;

    return timingSafeEqual(bodyHash, Buffer.from(claimedBodyHash, 'hex'));
  }
}
