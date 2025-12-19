import * as _ from 'lodash';
import { Op } from 'sequelize';

import { DatabaseUtils } from '@/modules/database/database.utils';
import { BaseFiltersDto } from '@/modules/database/dto/base-filters.dto';
import {
  DynamicFilters,
  FilterResult,
  PredefinedFilters,
  RepositoryFilters,
  RepositorySource,
} from '@/modules/database/types';
import { Includeable, WhereOptions } from 'sequelize/types/model';

export class FilterHelper {
  private readonly _predefinedFilters = {};

  constructor(
    private readonly model: RepositorySource,
    private readonly predefinedFilters?: PredefinedFilters,
  ) {
    this._predefinedFilters = predefinedFilters || {};
  }

  private getAutoOperation(value: any | any[]) {
    if (Array.isArray(value)) {
      return Op.in;
    }

    return Op.eq;
  }

  private getBaseFilters(filters: BaseFiltersDto) {
    const result: {
      where: WhereOptions;
      include?: Includeable | Includeable[];
      paranoid?: boolean;
      includeDeleted?: boolean;
    } = {
      where: {},
    };

    const modelAttributes = Object.keys(this.model.getAttributes());
    if (modelAttributes.includes('deletedAt')) {
      if (filters?.isDeleted) {
        result.where['deletedAt'] = {
          [Op.not]: null,
        };
        result.paranoid = false;
      } else {
        result.where['deletedAt'] = null;
      }

      if (filters?.includeDeleted) {
        result.paranoid = false;
        result.includeDeleted = true;
      }
    }

    return result;
  }

  private getMainFilters(_filters: RepositoryFilters) {
    const modelAttributes = Object.keys(this.model.getAttributes());

    let result = {
      where: {},
      include: [],
    };

    _.chain(_filters)
      .clone()
      .omit(['isDeleted', 'includeDeleted'])
      .entries()
      .forEach(([key, value]) => {
        if (_.isNil(value)) return;

        const isPredefinedFilter = key in this._predefinedFilters;

        if (isPredefinedFilter) {
          const predefinedFilterValue = this._predefinedFilters[key](value);

          if (!predefinedFilterValue) return;

          result = DatabaseUtils.mergeOptions(result, predefinedFilterValue);
        } else {
          const autoOperation = this.getAutoOperation(value);

          if (modelAttributes.includes(key)) {
            result.where[key] = {
              [autoOperation]: value,
            };
          }
        }
      })
      .value();

    return result;
  }

  public getFilterOptions(filters: RepositoryFilters): FilterResult {
    if (!filters || !Object.keys(filters || {}).length) return {};

    const baseFilters = this.getBaseFilters(filters);
    const sharedFilters = this.getMainFilters(filters);

    return DatabaseUtils.mergeOptions(baseFilters, sharedFilters);
  }

  public getDataWithDynamicFilters(
    data: Array<any>,
    filters: DynamicFilters,
  ): any[] {
    if (!data || !Array.isArray(data)) {
      throw new Error('Unsupported data type. Please provide an array.');
    }

    if (!filters || !Object.keys(filters).length) return data;

    return data.filter((item) => {
      return Object.keys(filters).every((key) => {
        const value = filters[key];

        if (_.isNil(value)) {
          return true;
        }
        return item[key] === value;
      });
    });
  }
}
