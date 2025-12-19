import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailFactory } from '@/modules/mail/mail.factory';
import { TokenModule } from '@/modules/token/token.module';
import { LinkFactory } from '@/shared/factories/link.factory';

import { MailService } from './mail.service';

@Module({
  imports: [
    TokenModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get('mail.host'),
            secure: configService.get('mail.secure'),
            port: +configService.get('mail.port'),
            auth: {
              type: configService.get('mail.authType'),
              user: configService.get('mail.user'),
              pass: configService.get('mail.pass'),
              clientId: configService.get('mail.clientId'),
              clientSecret: configService.get('mail.clientSecret'),
              refreshToken: configService.get('mail.refreshToken'),
            },
          },
          preview: true,
          defaults: {
            from: configService.get('mail.from'),
          },
        };
      },
    }),
  ],
  providers: [LinkFactory, MailService, MailFactory],
  exports: [MailService],
})
export class MailModule {}
