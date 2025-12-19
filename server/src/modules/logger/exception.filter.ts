import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { Logger } from '@/modules/logger/logger';
import { ErrorDetails } from '@/modules/logger/types';
import { RequestWithUser } from '@/shared/types';
import { PlatformUtils } from '@/shared/utils';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  private DEFAULT_ERROR = 'Internal Server Error!';
  private DEFAULT_MESSAGE = 'Critical internal server error occurred!';

  public getErrorDetails(exception, request): ErrorDetails {
    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = this.DEFAULT_ERROR;
    let message = this.DEFAULT_MESSAGE;

    if (exception instanceof HttpException) {
      const exceptionResponse: any = exception.getResponse();

      status = exception.getStatus();
      error = exceptionResponse?.error || exception?.message;
      message = exceptionResponse?.message || exceptionResponse;
    }

    if (exception.code === 'ENOENT') {
      status = HttpStatus.NOT_FOUND;
      error = 'Not found';
      message = 'File not found';
    }

    return {
      statusCode: status as number,
      message,
      error,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithUser>();
    const response = ctx.getResponse<Response>();

    const statusCode: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const allowedStatusNumbersPrefix = ['4', '5'];
    const saveToFileCondition = allowedStatusNumbersPrefix.includes(
      String(statusCode)[0],
    );

    this.logger.error(exception.message, exception.stack, {
      printToConsole: PlatformUtils.isLocalEnv(),
      saveToFile: saveToFileCondition && !PlatformUtils.isTestEnv(),
      host,
      exception,
    });

    const errorDetails = this.getErrorDetails(exception, request);
    response.status(errorDetails.statusCode).json(errorDetails);
  }
}
