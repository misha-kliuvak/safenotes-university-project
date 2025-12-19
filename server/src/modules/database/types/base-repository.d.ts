import { Model } from 'sequelize-typescript';

import {
  IFindByIdOptions,
  IFindOptions,
} from '@/modules/database/types/repository';

interface IBaseRepository<T extends Model> {
  readonly getAll: (options?: IFindOptions) => Promise<T[]>;
  readonly getOne: (options?: IFindOptions) => Promise<T | null>;
  readonly getById: (
    id: string,
    options?: IFindByIdOptions,
  ) => Promise<T | null>;

  readonly getOneOrCreate(options: IFindOptions, data?: any): Promise<T | null>;
  readonly count: (options?: IFindOptions) => Promise<number>;

  readonly create: (model: any, options?: ICreateOptions) => Promise<T>;
  readonly update: (values: any, options?: IUpdateOptions) => Promise<T>;
  readonly updateById: (
    id: string,
    values: Partial<T>,
    options?: IUpdateByIdOptions,
  ) => Promise<T>;
  // number of destroyed rows
  delete: (options: IDeleteOptions) => Promise<number>;
  deleteBy: (
    key: string,
    value: string | string[],
    options?: IDeleteOptions,
  ) => Promise<number>;
  deleteById: (id: string, options?: IDeleteByOptions) => Promise<number>;
}
