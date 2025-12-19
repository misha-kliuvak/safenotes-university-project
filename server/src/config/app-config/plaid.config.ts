import { registerAs } from '@nestjs/config';

import { toBoolean } from '@/shared/utils';

const PlaidConfig = registerAs('plaid', () => ({
  clientId: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
  sandbox: toBoolean(process.env.PLAID_SANDBOX || true),
}));

export type IPlaidConfig = Awaited<ReturnType<typeof PlaidConfig>>;

export default PlaidConfig;
