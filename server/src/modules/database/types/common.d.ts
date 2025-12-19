import {
  DynamicFilters,
  RepositoryFilters,
} from '@/modules/database/types/filters';
import { RepositorySorting } from '@/modules/database/types/sorting';

interface ServiceQueryOptions<T extends RepositoryFilters = RepositoryFilters> {
  filters?: T;
  dynamicFilters?: DynamicFilters;
  pagination?: RepositoryPagination;
  sorting?: RepositorySorting;
}

type QueryOptions<T = RepositoryFilters> = Omit<
  ServiceQueryOptions<T>,
  'dynamicFilters'
>;

interface ParamDecoratorOptions {
  parseUUID?: boolean;
  optionalUUID?: boolean;
}

interface GetEntityPipeOptions {
  throwNotFound?: boolean;
  raw?: boolean;
  validateOnly?: boolean;
  includeDeleted?: boolean;
}
