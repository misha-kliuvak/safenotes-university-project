import { Inject } from '@nestjs/common';

import { PaymentProvider } from '@/modules/payment/enums';

export function InjectStripe() {
  return Inject(PaymentProvider.STRIPE);
}
