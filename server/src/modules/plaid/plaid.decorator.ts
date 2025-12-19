import { Inject } from '@nestjs/common';

import { PaymentProvider } from '@/modules/payment/enums';

export function InjectPlaid() {
  return Inject(PaymentProvider.PLAID);
}
