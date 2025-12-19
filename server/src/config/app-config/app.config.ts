import { registerAs } from '@nestjs/config';

const AppConfig = registerAs('app', () => ({
  appName: process.env.APP_NAME,
  nodeEnv: process.env.NODE_ENV || 'local',
  port: process.env.PORT || 2000,
  maxBodySize: process.env.MAX_BODY_SIZE,
  requestInfoRecipient: process.env.REQUEST_INFO_RECIPIENT,
}));

export type IAppConfig = Awaited<ReturnType<typeof AppConfig>>;

export default AppConfig;
