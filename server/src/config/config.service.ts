import { Injectable } from '@nestjs/common';
import { ConfigService as RootConfigService } from '@nestjs/config';

import { IPlaidConfig } from '@/config/app-config/plaid.config';
import { ISentryConfig } from '@/config/app-config/sentry.config';
import { IUrlConfig } from '@/config/app-config/url.config';

import { IAppConfig } from './app-config/app.config';
import { IDatabaseConfig } from './app-config/database.config';
import { IFacebookConfig } from './app-config/facebook.config';
import { IGoogleConfig } from './app-config/google.config';
import { ILinkedinConfig } from './app-config/linkedin.config';
import { IMailConfig } from './app-config/mail.config';
import { IStripeConfig } from './app-config/stripe.config';
import { ITokenConfig } from './app-config/token.config';

export type IConfig = {
  app: IAppConfig;
  database: IDatabaseConfig;
  token: ITokenConfig;
  facebook: IFacebookConfig;
  google: IGoogleConfig;
  linkedin: ILinkedinConfig;
  mail: IMailConfig;
  stripe: IStripeConfig;
  plaid: IPlaidConfig;
  sentry: ISentryConfig;
  url: IUrlConfig;
};

@Injectable()
export class ConfigService {
  constructor(private readonly configService: RootConfigService) {}

  public getAppConfig(): IAppConfig {
    return this.configService.get<IAppConfig>('app');
  }

  public getDatabaseConfig(): IDatabaseConfig {
    return this.configService.get<IDatabaseConfig>('database');
  }

  public getTokenConfig(): ITokenConfig {
    return this.configService.get<ITokenConfig>('token');
  }

  public getFacebookConfig(): IFacebookConfig {
    return this.configService.get<IFacebookConfig>('facebook');
  }

  public getGoogleConfig(): IGoogleConfig {
    return this.configService.get<IGoogleConfig>('google');
  }

  public getLinkedinConfig(): ILinkedinConfig {
    return this.configService.get<ILinkedinConfig>('linkedin');
  }

  public getMailConfig(): IMailConfig {
    return this.configService.get<IMailConfig>('mail');
  }

  public getStripeConfig(): IStripeConfig {
    return this.configService.get<IStripeConfig>('stripe');
  }

  public getPlaidConfig(): IPlaidConfig {
    return this.configService.get<IPlaidConfig>('plaid');
  }

  public getSentryConfig(): ISentryConfig {
    return this.configService.get<ISentryConfig>('sentry');
  }

  public getUrlConfig(): IUrlConfig {
    return this.configService.get<IUrlConfig>('url');
  }

  public getConfig(): IConfig {
    return {
      app: this.getAppConfig(),
      database: this.getDatabaseConfig(),
      token: this.getTokenConfig(),
      facebook: this.getFacebookConfig(),
      google: this.getGoogleConfig(),
      linkedin: this.getLinkedinConfig(),
      mail: this.getMailConfig(),
      stripe: this.getStripeConfig(),
      plaid: this.getPlaidConfig(),
      sentry: this.getSentryConfig(),
      url: this.getUrlConfig(),
    };
  }
}
