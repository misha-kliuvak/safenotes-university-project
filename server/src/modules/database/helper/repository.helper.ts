import * as _ from 'lodash';

import { DatabaseUtils } from '@/modules/database/database.utils';
import { FilterHelper } from '@/modules/database/helper/filter.helper';
import { PaginationHelper } from '@/modules/database/helper/pagination.helper';
import { SortingHelper } from '@/modules/database/helper/sorting.helper';
import {
  DynamicFilters,
  IFindOptions,
  RepositorySource,
} from '@/modules/database/types';

export class RepositoryHelper {
  private readonly filterHelper: FilterHelper;
  private readonly paginationHelper: PaginationHelper;
  private readonly sortingHelper: SortingHelper;

  constructor(
    private readonly model: RepositorySource,
    private readonly predefinedFilters,
  ) {
    this.filterHelper = new FilterHelper(model, predefinedFilters);
    this.paginationHelper = new PaginationHelper(model);
    this.sortingHelper = new SortingHelper(model);
  }

  private withFilter(options: IFindOptions) {
    const newOptions = _.clone(options);

    const filterOptions = this.filterHelper.getFilterOptions(options?.filters);

    delete newOptions?.filters;

    return DatabaseUtils.mergeOptions(newOptions, filterOptions);
  }

  private withPagination(options: IFindOptions) {
    const newOptions = _.clone(options);

    const paginationOptions = this.paginationHelper.getPaginationOptions(
      options?.pagination,
    );

    delete newOptions?.pagination;

    return DatabaseUtils.mergeOptions(newOptions, paginationOptions);
  }

  private withSorting(options: IFindOptions) {
    const sortingOptions = this.sortingHelper.getSortingOptions(
      options?.sorting,
    );

    delete options?.sorting;

    return DatabaseUtils.mergeOptions(_.clone(options), sortingOptions);
  }

  private withDynamicFilters(data: any, filters: DynamicFilters) {
    if (!filters || !Object.keys(filters).length) return data;

    return this.filterHelper.getDataWithDynamicFilters(data, filters);
  }

  public enhanceOptions(options: IFindOptions) {
    const fns = [this.withFilter, this.withPagination, this.withSorting];
    const enhanceOptions = fns.reduce(
      (result, func) => func.bind(this)(result),
      options,
    );

    if (
      enhanceOptions?.includeDeleted &&
      enhanceOptions?.where?.deletedAt !== undefined
    ) {
      delete enhanceOptions.where.deletedAt;
    }

    return enhanceOptions;
  }

  public async complexGetAll(options: IFindOptions) {
    const response = await this.model.findAll(this.enhanceOptions(options));

    if (this.paginationHelper.isPaginationActive(options)) {
      return {
        data: this.withDynamicFilters(response, options?.dynamicFilters),
        metadata: await this.paginationHelper.getMetadata(options),
      };
    }

    return this.withDynamicFilters(response, options?.dynamicFilters);
  }
}
