export enum AccountHolderType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

export enum StripeWebhookEnum {
  PaymentIntentCreated = 'payment_intent.created',
  PaymentIntentFailed = 'payment_intent.failed',
  PaymentIntentSucceeded = 'payment_intent.succeeded',
  ChargeSucceeded = 'charge.succeeded',
}
