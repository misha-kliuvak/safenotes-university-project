import { forwardRef, Module } from '@nestjs/common';

import { SubscriptionController } from '@/modules/subscription/subscription.controller';
import { SubscriptionService } from '@/modules/subscription/service/subscription.service';
import { StripeModule } from '@/modules/stripe/stripe.module';
import { UserModule } from '@/modules/user/user.module';
import { PaymentModule } from '@/modules/payment/payment.module';
import { CompanyModule } from '@/modules/company/company.module';
import { SubscriptionGuardService } from '@/modules/subscription/service/subscription-guard.service';
import { SafeNoteModule } from '@/modules/safe-note/safe-note.module';

@Module({
  imports: [
    StripeModule,
    forwardRef(() => UserModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => SafeNoteModule),
  ],
  providers: [SubscriptionService, SubscriptionGuardService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService, SubscriptionGuardService],
})
export class SubscriptionModule {}
