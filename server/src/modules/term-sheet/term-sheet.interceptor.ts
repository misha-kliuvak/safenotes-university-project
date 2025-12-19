import { Injectable } from '@nestjs/common';

import { TermSheetPresenter } from '@/modules/term-sheet/term-sheet.presenter';
import { DataInterceptor } from '@/shared/interceptors/data.interceptor';

@Injectable()
export class TermSheetDataInterceptor extends DataInterceptor {
  constructor(private readonly presenter: TermSheetPresenter) {
    super(presenter);
  }
}
