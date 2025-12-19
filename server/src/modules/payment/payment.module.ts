import { forwardRef, Module } from '@nestjs/common';

import { PlaidModule } from '@/modules/plaid/plaid.module';
import { SafeNoteModule } from '@/modules/safe-note/safe-note.module';
import { StripeModule } from '@/modules/stripe/stripe.module';
import { UserModule } from '@/modules/user/user.module';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    StripeModule,
    PlaidModule,
    forwardRef(() => UserModule),
    forwardRef(() => SafeNoteModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
