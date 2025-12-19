import { Injectable } from '@nestjs/common';

import { CompanyPresenter } from '@/modules/company/company.presenter';
import { DataInterceptor } from '@/shared/interceptors/data.interceptor';

@Injectable()
export class CompanyDataInterceptor extends DataInterceptor {
  constructor(private readonly companyPresenter: CompanyPresenter) {
    super(companyPresenter);
  }
}
