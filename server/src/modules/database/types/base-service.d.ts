import {
  IDeleteByOptions,
  IDeleteOptions,
  IFindByIdOptions,
  IFindOptions,
} from '@/modules/database/types/index';

interface BaseService<T = any> {
  getAll?: (options?: IFindOptions) => Promise<T[]>;

  getById?: (id: string, options?: IFindByIdOptions) => Promise<T>;

  getRawById(id: string, options?: IFindByIdOptions): Promise<T>;

  delete?: (options?: IDeleteOptions) => Promise<number>;

  deleteById?: (id: string, options?: IDeleteByOptions) => Promise<number>;

  deleteBy?: (
    key: string,
    value: string | string[],
    options?: IDeleteByOptions,
  ) => Promise<number>;

  deleteWhere?: (
    where: Record<string, any>,
    options?: IDeleteOptions,
  ) => Promise<number>;
}
