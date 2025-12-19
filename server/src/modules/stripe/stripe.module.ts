import { Module } from '@nestjs/common';

import { StripeProvider } from './stripe.provider';
import { StripeService } from './stripe.service';

@Module({
  providers: [StripeProvider.forRoot(), StripeService],
  exports: [StripeService],
})
export class StripeModule {}
