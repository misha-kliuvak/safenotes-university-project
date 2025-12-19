import { Logger as NestLogger } from '@nestjs/common';
import { createLogger } from 'winston';

import { CustomException } from '@/modules/logger/custom.exception';
import { getFileTransport } from '@/modules/logger/transport';
import { BaseErrorMetadata, LoggerMetadata } from '@/modules/logger/types';

export class Logger {
  private readonly context: string;
  private readonly logger: NestLogger;

  constructor(context?: string) {
    this.context = context;
    this.logger = new NestLogger(context);
  }

  public get winston() {
    return createLogger({
      transports: [getFileTransport('error')],
    });
  }

  public error(
    message: string,
    stack?: any,
    metadata?: LoggerMetadata & BaseErrorMetadata,
  ) {
    const printToConsole = metadata?.printToConsole ?? true;
    const saveToFile = metadata?.saveToFile ?? true;

    delete metadata?.printToConsole;
    delete metadata?.saveToFile;

    if (saveToFile) {
      const exception = new CustomException(
        metadata?.exception,
        metadata?.host,
      );

      const _message = metadata?.host
        ? exception.detailOutput()
        : exception.simpleOutput(stack);

      if (_message) {
        this.winston.error(_message);
      }
    }

    if (printToConsole) {
      this.logger.error(message, stack);
    }
  }

  public log(message: string) {
    this.logger.log(message);
  }

  public warn(message: any, ...optionalParams) {
    this.logger.warn(message, ...optionalParams);
  }

  public debug(message: any, ...optionalParams) {
    this.logger.debug(message, ...optionalParams);
  }

  public verbose(message: any, ...optionalParams) {
    this.logger.verbose(message, ...optionalParams);
  }
}
