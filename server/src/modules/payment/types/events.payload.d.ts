import Stripe from 'stripe';

import { PaymentEntity } from '@/modules/payment/entity/payment.entity';
import { PaymentReason } from '@/modules/payment/enums';

export interface HandlePaymentSuccessEventPayload {
  reason: PaymentReason;
  payment: PaymentEntity;
  paymentIntent: Stripe.PaymentIntent | Stripe.Charge;
}

export interface HandlePaymentPendingEventPayload {
  reason: PaymentReason;
  payment: PaymentEntity;
  paymentIntent: Stripe.PaymentIntent | Stripe.Charge;
}

export interface HandlePaymentFailedEventPayload {
  reason: PaymentReason;
  payment: PaymentEntity;
}

export interface HandlePaymentRefundEventPayload {
  reason: PaymentReason;
  payment: PaymentEntity;
}
