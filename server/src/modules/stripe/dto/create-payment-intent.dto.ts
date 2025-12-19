import { Dictionary } from '@/shared/types';

export class CreatePaymentIntentDto {
  customerId: string;
  customerEmail: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
  metadata?: Dictionary;
  confirm?: boolean;
}
