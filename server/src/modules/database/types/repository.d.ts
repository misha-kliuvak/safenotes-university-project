import { CreateOptions, Transaction as SequelizeTransaction } from 'sequelize';
import {
  DestroyOptions,
  FindOptions,
  Includeable,
  UpdateOptions,
} from 'sequelize/types/model';
import { Model } from 'sequelize-typescript';

import {
  DynamicFilters,
  RepositoryFilters,
} from '@/modules/database/types/filters';
import { RepositorySorting } from '@/modules/database/types/sorting';

type Transaction = SequelizeTransaction;
type RepositorySource<T = any> = { new (): T } & typeof Model;

interface IRepositoryMethodOptions {
  filters?: RepositoryFilters;
  pagination?: RepositoryPagination;
  sorting?: RepositorySorting;
  dynamicFilters?: DynamicFilters;
  throwNotFound?: boolean;
  toJson?: boolean;
  transaction?: Transaction;
  include?: Includeable[];
}

interface IFindOptions
  extends Omit<FindOptions, 'include'>,
    IRepositoryMethodOptions {}

type IFindByIdOptions = IFindOptions;

interface ICreateOptions
  extends Omit<CreateOptions, 'include'>,
    Pick<IRepositoryMethodOptions, 'include'> {}

interface IUpdateOptions extends UpdateOptions {
  throwNotFound?: boolean;
}

interface IUpdateByIdOptions
  extends Omit<IUpdateOptions, 'where'>,
    IFindByIdOptions {}

interface IDeleteOptions extends DestroyOptions {
  throwNotFound?: boolean;
}

interface IDeleteByOptions {
  throwNotFound?: boolean;
  transaction?: Transaction;
  force?: boolean;
}

interface TransactionOptions {
  transaction?: Transaction;
}
