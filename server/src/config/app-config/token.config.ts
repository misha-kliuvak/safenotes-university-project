import { registerAs } from '@nestjs/config';

const TokenConfig = registerAs('token', () => ({
  user: {
    tokenSecretKey: process.env.USER_ACCESS_TOKEN_SECRET,
    tokenExpiresIn: process.env.USER_ACCESS_TOKEN_EXPIRES_IN || 1000,
  },
  service: {
    tokenSecretKey: process.env.SERVICE_TOKEN_SECRET,
    tokenExpiresIn: process.env.SERVICE_TOKEN_EXPIRES_IN || 1000,
  },
}));

export type ITokenConfig = Awaited<ReturnType<typeof TokenConfig>>;

export default TokenConfig;
