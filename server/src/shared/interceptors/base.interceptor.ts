import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Model } from 'sequelize-typescript';

@Injectable()
export class BaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const toJSON = (data) => (data instanceof Model ? data.toJSON() : data);

    return next.handle().pipe(
      map(async (data: any) => {
        if (Array.isArray(data)) {
          return data.map(toJSON);
        } else {
          return toJSON(data);
        }
      }),
    );
  }
}
