import { registerAs } from '@nestjs/config';
import { toBoolean } from '@/shared/utils';

const SentryConfig = registerAs('sentry', () => ({
  sentryDsn: process.env.SENTRY_DSN,
  sentryEnabled: toBoolean(process.env.SENTRY_ENABLED),
}));

export type ISentryConfig = Awaited<ReturnType<typeof SentryConfig>>;

export default SentryConfig;
