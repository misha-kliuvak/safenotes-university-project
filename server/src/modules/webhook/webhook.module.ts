import { forwardRef, Module } from '@nestjs/common';

import { PaymentModule } from '@/modules/payment/payment.module';
import { PlaidModule } from '@/modules/plaid/plaid.module';
import { StripeModule } from '@/modules/stripe/stripe.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';

import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [
    StripeModule,
    PlaidModule,
    PaymentModule,
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
