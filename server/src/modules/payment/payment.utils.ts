import { STRIPE_FEE } from '@/modules/payment/constants';
import { PaymentStatus } from '@/modules/payment/enums';
import { generateShortId, roundTo2Decimal } from '@/shared/utils';

export class PaymentUtils {
  static getTransactionId() {
    return 'TRX' + generateShortId();
  }

  static mapStatusToPaymentStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case 'paid':
      case 'succeeded':
      case 'posted': // Plaid status
      case 'settled': // Plaid status
      case 'funds_available': // Plaid status
        return PaymentStatus.PAID;
      case 'draft':
      case 'open':
      case 'pending':
      case 'processing':
      case 'requires_payment_method':
        return PaymentStatus.PENDING;
      case 'expired':
      case 'failed':
      case 'canceled':
      case 'cancelled': // Plaid status
      case 'returned': // Plaid status
      case 'payment_failed':
      case 'uncollectible':
      case 'void':
        return PaymentStatus.CANCELED;
      default:
        return PaymentStatus.UNPAID;
    }
  }

  static convertFromStripeAmount(amount: number) {
    return amount / 100;
  }

  static convertToStripeAmount(amount: number) {
    return amount * 100;
  }

  static calculateStripeFee(amount) {
    return roundTo2Decimal((amount * STRIPE_FEE) / 100);
  }
}
