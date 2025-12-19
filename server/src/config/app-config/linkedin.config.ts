import { registerAs } from '@nestjs/config';

const LinkedinConfig = registerAs('linkedin', () => ({
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
}));

export type ILinkedinConfig = Awaited<ReturnType<typeof LinkedinConfig>>;

export default LinkedinConfig;
