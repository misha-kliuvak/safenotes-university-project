import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

import { RequestData } from '@/modules/logger/types';
import { RequestWithUser } from '@/shared/types';

export class CustomException {
  private readonly exception: HttpException;
  private readonly host: ArgumentsHost;

  constructor(exception?, host?) {
    this.exception = exception;
    this.host = host;
  }

  private getRequest(): RequestWithUser {
    const ctx = this.host.switchToHttp();
    return ctx.getRequest<RequestWithUser>();
  }

  private getErrorDetails() {
    const exception = this.exception;
    const request = this.getRequest();

    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    return {
      statusCode: status as number,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };
  }

  private getDataFromRequest(): RequestData {
    const request = this.getRequest();

    const clientIp = request.clientIp;
    const userAgent = request?.headers['user-agent'];
    const authorization = request?.headers['authorization'];

    return {
      clientIp,
      userAgent,
      authorization,
    };
  }

  public simpleOutput(stack) {
    if (!stack) return;

    const timestamp = new Date().toISOString();

    const print = [
      '==============================\n',
      `Time: ${timestamp}`,
      '\n\n',
      stack,
      '\n\n',
    ];

    return print.join('');
  }

  public detailOutput() {
    if (!this.host) {
      console.error('<host> was not provided, cannot use detailOutput');
      return;
    }

    if (!this.exception) {
      console.error('<exception> was not provided, cannot use detailOutput');
      return;
    }

    const { user } = this.getRequest();
    const { statusCode, path, method, timestamp } = this.getErrorDetails();
    const { clientIp, userAgent, authorization } = this.getDataFromRequest();

    const isHttpException = this.exception instanceof HttpException;

    const exceptionResponse = isHttpException
      ? this.exception.getResponse()
      : '';

    const print = [
      '==============================\n',
      `Response code: ${statusCode} - Method: ${method} - URL: ${path}`,
      '\n',

      `IP: ${clientIp} - User Agent: ${userAgent} - Time: ${timestamp}`,
      '\n',

      `Authorization: ${authorization}`,
      '\n\n',

      `User: ${JSON.stringify(user || 'Not signed in')}`,
      '\n\n',

      JSON.stringify(exceptionResponse),
      '\n\n',

      this.exception?.stack || this.exception || 'No error stack found',
      '\n\n',
    ];

    return print.join('');
  }
}
