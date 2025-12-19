import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TransactionParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.transaction) {
      throw new Error(
        'In order to use @TransactionParam, TransactionInterceptor must be enabled for request',
      );
    }
    return request.transaction;
  },
);
