import { Model } from 'sequelize-typescript';

import { BaseRepository } from '@/modules/database/base.repository';
import {
  IDeleteByOptions,
  IDeleteOptions,
  IFindByIdOptions,
  IFindOptions,
  IUpdateByIdOptions,
  IUpdateOptions,
} from '@/modules/database/types';
import { BaseService } from '@/modules/database/types/base-service';

export abstract class BaseServiceImpl<T extends Model>
  implements BaseService<T>
{
  private readonly _repository: BaseRepository<T>;

  protected constructor(repository: BaseRepository<T>) {
    this._repository = repository;
  }

  /**
   * To check if entity exits in database
   * @param id
   * @param throwNotFound
   */
  public async isExist(id: string, throwNotFound = true): Promise<boolean> {
    const entity = await this._repository.getOne({
      where: { id },
      throwNotFound,
    });

    if (!entity && !throwNotFound) {
      return false;
    }

    return !!entity?.id;
  }

  public async getAll(options?: IFindOptions): Promise<T[]> {
    return this._repository.getAll(options);
  }

  /**
   * Get entity with options
   * @param options
   */
  public async getOne(options?: IFindOptions): Promise<T> {
    return this._repository.getOne(options);
  }

  /**
   * Get entity by id.
   * Throw not found by default if entity is null
   * @param id
   * @param options
   */
  public async getById(id: string, options?: IFindByIdOptions): Promise<T> {
    return this._repository.getById(id, {
      throwNotFound: true,
      ...options,
    });
  }

  /**
   * Throw not found by default if entity is null
   * @param id
   * @param options
   */
  public async getRawById(id: string, options?: IFindByIdOptions): Promise<T> {
    return this._repository.getOne({
      where: { id },
      throwNotFound: true,
      ...options,
    });
  }

  public async update(id: string, values: any, options?: IUpdateOptions) {
    return this._repository.update(values, {
      ...options,
    });
  }

  public async updateById(
    id: string,
    values: any,
    options?: IUpdateByIdOptions,
  ) {
    return this._repository.updateById(id, values, {
      throwNotFound: true,
      ...options,
    });
  }

  public async delete(options?: IDeleteOptions) {
    return this._repository.delete(options);
  }

  public async deleteById(id: string, options?: IDeleteByOptions) {
    return this._repository.deleteById(id, {
      throwNotFound: true,
      ...options,
    });
  }

  public async deleteBy(
    key: string,
    value: string | string[],
    options?: IDeleteByOptions,
  ) {
    return this._repository.deleteBy(key, value, options);
  }

  public async deleteWhere(
    where: Record<string, any>,
    options?: IDeleteOptions,
  ) {
    return this.delete({ where, ...options });
  }
}
