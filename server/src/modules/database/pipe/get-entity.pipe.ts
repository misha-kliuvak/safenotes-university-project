import { PipeTransform } from '@nestjs/common';

import { BaseRepository } from '@/modules/database/base.repository';
import { GetEntityPipeOptions } from '@/modules/database/types';

export class GetEntity<T = any> implements PipeTransform {
  private readonly Repository: any;

  private readonly throwNotFound: boolean = true;
  private readonly raw: boolean = false;
  private readonly validateOnly: boolean = false;
  private readonly includeDeleted: boolean = false;

  constructor(Repository: any, options: GetEntityPipeOptions = {}) {
    this.Repository = Repository;

    Object.assign(this, options);
  }

  private extractId(value: any) {
    if (!value) return;

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object' && 'id' in value) {
      return value.id;
    }

    return null;
  }

  public async transform(value: any): Promise<T | string> {
    const id = this.extractId(value);

    if (!id) return null;

    const repository: BaseRepository<any> = new this.Repository(
      this.Repository.Entity,
    );

    const rawOptions = {
      include: [],
    };

    const result = await repository.getById(id, {
      throwNotFound: this.throwNotFound,
      ...(this.raw && rawOptions),
      filters: {
        includeDeleted: this.includeDeleted,
      },
    });

    if (this.validateOnly) {
      return id;
    }

    return result;
  }
}
