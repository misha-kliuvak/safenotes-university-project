import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as _ from 'lodash';

import { ConvertQueryParamPipe } from '@/shared/pipe/convert-query.pipe';
import { ConvertSortingQueryPipe } from '@/shared/pipe/convert-sorting.pipe';

const decorator = (innerKey?: string) =>
  createParamDecorator((id: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (innerKey) return request.query[innerKey];
    return request.query;
  });

export const Filters = (dto) => {
  return decorator()(new ConvertQueryParamPipe(dto));
};

export const Sorting = () => {
  return decorator('sort')(new ConvertSortingQueryPipe());
};

export const Pagination = () => {
  return createParamDecorator((id: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const page = request.query?.page;
    const limit = request.query?.limit;

    if (_.isNil(page) && _.isNil(limit)) {
      return {};
    }

    return {
      page,
      limit,
    };
  })();
};
