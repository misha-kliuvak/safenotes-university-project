import Stripe from 'stripe';

import { BankPaymentDataDto } from '@/modules/payment/dto/bank-payment-data.dto';
import { CardPaymentDataDto } from '@/modules/payment/dto/card-payment-data.dto';
import { PaymentReason } from '@/modules/payment/enums';
import { Dictionary } from '@/shared/types';

export interface PaymentMetadata extends Dictionary {
  reason: PaymentReason;
  paymentFor?: string;
}

export interface InternalPaymentMetadata extends PaymentMetadata {
  paymentId: string;
}

export type PaymentIntent = Stripe.PaymentIntent;

export type CreatePayment = CardPaymentDataDto | BankPaymentDataDto;
