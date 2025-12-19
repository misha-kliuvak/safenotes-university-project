import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';

import { AppConfig } from '@/config';
import { rootDir } from '@/directories';
import { AppService } from '@/main/app.service';
import { SharedModule } from '@/main/shared.module';
import { AddressModule } from '@/modules/address/address.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CompanyModule } from '@/modules/company/company.module';
import { MailModule } from '@/modules/mail/mail.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { PaymentModule } from '@/modules/payment/payment.module';
import { PlaidModule } from '@/modules/plaid/plaid.module';
import { SafeNoteModule } from '@/modules/safe-note/safe-note.module';
import { StorageService } from '@/modules/storage/service/storage.service';
import { StripeModule } from '@/modules/stripe/stripe.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { TermSheetModule } from '@/modules/term-sheet/term-sheet.module';
import { TokenModule } from '@/modules/token/token.module';
import { UserModule } from '@/modules/user/user.module';
import { WebhookModule } from '@/modules/webhook/webhook.module';
import { SentryInterceptor } from '@/shared/interceptors/sentry.interceptor';

import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new SentryInterceptor(),
    },
    AppService,
  ],
  imports: [
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // max 7 calls in 1 second
        limit: 7,
      },
      {
        name: 'medium',
        ttl: 10000, // max 30 calls in 10 seconds
        limit: 30,
      },
      {
        name: 'long',
        ttl: 60000, // max 100 calls in 1 minute
        limit: 100,
      },
    ]),

    // Configurations
    ConfigModule.forRoot({
      load: AppConfig,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(rootDir, 'static'),
      serveRoot: '/static',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(rootDir, 'storage'),
      serveRoot: '/storage',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(rootDir, 'logs'),
      serveRoot: '/__secure__/__internal__/__logs__',
    }),

    SharedModule,

    PlaidModule,
    StripeModule,
    WebhookModule,
    MailModule,
    NotificationModule,
    AuthModule,
    UserModule,
    SubscriptionModule,
    TokenModule,
    AddressModule,
    SafeNoteModule,
    PaymentModule,
    CompanyModule,
    TermSheetModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly storageService: StorageService) {}

  onModuleInit() {
    this.storageService.initStorage();
  }
}
