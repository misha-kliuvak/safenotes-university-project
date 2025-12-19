import { registerAs } from '@nestjs/config';

const GoogleConfig = registerAs('google', () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
}));

export type IGoogleConfig = Awaited<ReturnType<typeof GoogleConfig>>;

export default GoogleConfig;
