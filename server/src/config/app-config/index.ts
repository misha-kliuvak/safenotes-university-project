import AppConfig from './app.config';
import DatabaseConfig from './database.config';
import FacebookConfig from './facebook.config';
import GoogleConfig from './google.config';
import LinkedinConfig from './linkedin.config';
import MailConfig from './mail.config';
import PlaidConfig from './plaid.config';
import SentryConfig from './sentry.config';
import StripeConfig from './stripe.config';
import TokenConfig from './token.config';
import UrlConfig from './url.config';

export default [
  AppConfig,
  TokenConfig,
  DatabaseConfig,
  FacebookConfig,
  GoogleConfig,
  LinkedinConfig,
  MailConfig,
  StripeConfig,
  PlaidConfig,
  SentryConfig,
  UrlConfig,
];
