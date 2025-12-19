import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PaymentProvider } from '@/modules/payment/enums';

export class StripeProvider {
  static forRoot() {
    return {
      provide: PaymentProvider.STRIPE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return new Stripe(configService.get('stripe.skKey'), {
          apiVersion: '2023-08-16',
        });
      },
    };
  }
}
