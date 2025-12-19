import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly sequelize: Sequelize) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const transaction: Transaction = await this.sequelize.transaction();

    req.transaction = transaction;

    return next.handle().pipe(
      map(async (data) => {
        await transaction.commit();

        return data;
      }),
      catchError(async (err) => {
        await transaction.rollback();

        throw err;
      }),
    );
  }
}
