import { registerAs } from '@nestjs/config';
import { toBoolean } from '@/shared/utils';

const DatabaseConfig = registerAs('database', () => ({
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logs: toBoolean(process.env.DB_LOGS || false),
}));

export type IDatabaseConfig = Awaited<ReturnType<typeof DatabaseConfig>>;

export default DatabaseConfig;
