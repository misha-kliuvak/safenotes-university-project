import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'body-parser';
import { urlencoded } from 'express';
import * as hbs from 'express-handlebars';
import * as morgan from 'morgan';
import { join } from 'path';
import * as requestIp from 'request-ip';

import { ConfigService } from '@/config';
import { JwtAuthGuard } from '@/modules/auth/auth.guard';
import { AuthService } from '@/modules/auth/service/auth.service';
import { GlobalExceptionFilter } from '@/modules/logger/exception.filter';
import { TokenService } from '@/modules/token/token.service';
import { UserService } from '@/modules/user/user.service';
import { HandlebarOperators } from '@/shared/common/hbs.operators';
import { BaseInterceptor } from '@/shared/interceptors/base.interceptor';
import { RawBodyMiddleware } from '@/shared/middlewares/raw-body.middleware';

const hbsCore = hbs.create({
  defaultLayout: '',
  extname: 'hbs',
  helpers: HandlebarOperators,
});

export function setupApp(app: NestExpressApplication) {
  // getting config
  const {
    app: { maxBodySize },
  } = app.get(ConfigService).getConfig();

  // getting needed services and classes
  const reflector = app.get(Reflector);
  const tokenService = app.get(TokenService);
  const authService = app.get(AuthService);
  const userService = app.get(UserService);

  // Enabling versioning for app
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_NEUTRAL, '1'],
  });

  // Setup HBS
  app.engine('hbs', hbsCore.engine);
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', 'templates'));

  // Global usage
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalGuards(
    new JwtAuthGuard(reflector, tokenService, authService, userService),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new BaseInterceptor());

  // Middlewares
  app.use(RawBodyMiddleware());

  // Security
  // app.use(helmet());
  app.enableCors({
    origin: '*',
    // credentials: true,
  });

  // Other
  app.use(json({ limit: maxBodySize }));
  app.use(
    urlencoded({
      extended: true,
      limit: maxBodySize,
    }),
  );
  app.use(requestIp.mw());
  app.use(morgan('dev'));

  return app.getHttpServer();
}
