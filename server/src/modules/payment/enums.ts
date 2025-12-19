export enum PaymentType {
  CARD = 'card',
  BANK_TRANSFER = 'bankTransfer',
}

export enum PaymentStatus {
  CREATED = 'created',
  PAID = 'paid',
  PENDING = 'pending',
  UNPAID = 'unpaid',
  CANCELED = 'canceled',
}

export enum PaymentReason {
  UNKNOWN = 'unknown',
  SAFE_NOTE = 'safeNote',
  VERIFY_COMPANY = 'verifyCompany',
  SUBSCRIPTION = 'subscription',
}

export enum PaymentEvent {
  HANDLE_PAYMENT_SUCCESS = 'HANDLE_PAYMENT_SUCCESS',
  HANDLE_PAYMENT_PENDING = 'HANDLE_PAYMENT_PENDING',
  HANDLE_PAYMENT_FAILED = 'HANDLE_PAYMENT_FAILED',
  HANDLE_PAYMENT_REFUNDED = 'HANDLE_PAYMENT_REFUNDED',
}

export enum PaymentProvider {
  STRIPE = 'Stripe',
  PLAID = 'PLAID',
  RECEIPT = 'RECEIPT',
}
