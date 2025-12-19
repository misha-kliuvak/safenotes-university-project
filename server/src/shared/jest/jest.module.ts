import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppConfig } from '@/config';
import { SharedModule } from '@/main/shared.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),

    ConfigModule.forRoot({
      load: AppConfig,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
    }),
    SharedModule,
  ],
})
export class JestModule {}
