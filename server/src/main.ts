import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';

import { ConfigService } from '@/config';
import { Logger } from '@/modules/logger/logger';
import { appOptions, httpsOptions } from '@/options';
import { setupApp } from '@/setup';

import { AppModule } from './main/app.module';
import { PlatformUtils } from './shared/utils';

const logger = new Logger('Main');

async function bootstrap() {
  let app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    appOptions,
  );

  // Expose local certificates if development to works with https
  if (PlatformUtils.isLocalEnv()) {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      httpsOptions,
      ...appOptions,
    });
  }

  // getting config
  const {
    app: { nodeEnv, port },
    sentry: { sentryDsn, sentryEnabled },
  } = app.get(ConfigService).getConfig();

  // init Sentry
  Sentry.init({
    dsn: sentryDsn,
    enabled: sentryEnabled,
    environment: nodeEnv,
  });

  // init Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MySAFEnotes API')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  setupApp(app);

  await app.listen(port);

  logger.verbose(`Server has started on ${port}`);

  process.on('uncaughtException', (error: Error) => {
    logger.error(`[uncaughtException]:`, error.stack);
  });

  process.on('unhandledRejection', (error: Error) => {
    logger.error(`[unhandledRejection]:`, error.stack);
  });
}

bootstrap();
