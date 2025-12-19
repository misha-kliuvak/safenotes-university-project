import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

import { ConfigService } from '@/config';
import { Logger } from '@/modules/logger/logger';

@Catch()
export class OAuthFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse<Response>();

    this.logger.error(exception.message, exception.stack);

    const { loginUrl } = this.configService.getUrlConfig();
    response.redirect(301, `${loginUrl}?error=failed_auth`);
  }
}
