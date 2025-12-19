import {
  createParamDecorator,
  ExecutionContext,
  ParseUUIDPipe,
  PipeTransform,
} from '@nestjs/common';

import { ParamDecoratorOptions } from '../types/common';

const decorator = (requestKey: 'params' | 'query') =>
  createParamDecorator(async (paramKey: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request[requestKey]?.[paramKey];
  });

export const Param = (key: string, ...pipes: PipeTransform[]) => {
  return decorator('params')(key, new ParseUUIDPipe(), ...pipes);
};

export const ParamWithOptions = (
  key: string,
  options?: ParamDecoratorOptions,
  ...pipes: PipeTransform[]
) => {
  const { parseUUID = true, optionalUUID = false } = options || {};

  return decorator('params')(
    key,
    parseUUID && new ParseUUIDPipe({ optional: optionalUUID }),
    ...pipes,
  );
};
