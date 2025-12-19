import { registerAs } from '@nestjs/config';

import { toBoolean } from '@/shared/utils';

const MailConfig = registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: toBoolean(process.env.MAIL_SECURE || true),
  authType: process.env.MAIL_AUTH_TYPE,
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  from: process.env.MAIL_FROM,
  clientId: process.env.MAIL_CLIENT_ID,
  clientSecret: process.env.MAIL_CLIENT_SECRET,
  refreshToken: process.env.MAIL_REFRESH_TOKEN,
}));

export type IMailConfig = Awaited<ReturnType<typeof MailConfig>>;

export default MailConfig;
