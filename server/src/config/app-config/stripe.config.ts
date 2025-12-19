import { registerAs } from '@nestjs/config';

const StripeConfig = registerAs('stripe', () => ({
  skKey: process.env.STRIPE_SK_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  devWebhookSecret: process.env.STRIPE_DEV_WEBHOOK_SECRET,
}));

export type IStripeConfig = Awaited<ReturnType<typeof StripeConfig>>;

export default StripeConfig;
