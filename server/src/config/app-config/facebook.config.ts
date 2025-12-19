import { registerAs } from '@nestjs/config';

const FacebookConfig = registerAs('facebook', () => ({
  clientId: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
}));

export type IFacebookConfig = Awaited<ReturnType<typeof FacebookConfig>>;

export default FacebookConfig;
