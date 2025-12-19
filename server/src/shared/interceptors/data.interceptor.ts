import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class DataInterceptor implements NestInterceptor {
  constructor(private readonly _presenter: any) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(async (data: any) => {
        if (Array.isArray(data)) {
          return this._presenter.collection(data);
        } else {
          return this._presenter.present(data);
        }
      }),
    );
  }
}
