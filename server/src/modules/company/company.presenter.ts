import { Inject, Injectable } from '@nestjs/common';

import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { RequestWithUser } from '@/shared/types';

@Injectable()
export class CompanyPresenter {
  constructor(@Inject('REQUEST') private readonly request: RequestWithUser) {}

  public async present(entity: CompanyEntity) {
    if (!entity || !(entity instanceof CompanyEntity)) return entity;

    const fields: any = entity.toJSON();
    if (!fields?.mainName && fields?.name) {
      fields.mainName = fields.name;
    }

    return fields;
  }

  public async collection(companies: CompanyEntity[]) {
    const result: CompanyEntity[] = [];

    for (const company of companies) {
      result.push(await this.present(company));
    }

    return result;
  }
}
