import { Injectable } from '@nestjs/common';

import { SafeNotePresenter } from '@/modules/safe-note/safe-note.presenter';
import { DataInterceptor } from '@/shared/interceptors/data.interceptor';

@Injectable()
export class SafeNoteDataInterceptor extends DataInterceptor {
  constructor(private readonly presenter: SafeNotePresenter) {
    super(presenter);
  }
}
