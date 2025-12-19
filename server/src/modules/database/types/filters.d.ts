import { Includeable, WhereOptions } from 'sequelize/types/model';

import { BaseFiltersDto } from '@/modules/database/dto/base-filters.dto';

type RepositoryFilters = BaseFiltersDto & Record<string, any>;
type DynamicFilters = Record<string, any>;

type FilterResult = {
  where?: WhereOptions;
  include?: Includeable[];
};

type PredefinedFilterFn = (value: any) => FilterResult;
type PredefinedFilters<T = object> = Partial<
  Record<keyof T, PredefinedFilterFn>
>;
