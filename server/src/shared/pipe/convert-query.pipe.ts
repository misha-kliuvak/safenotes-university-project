import { BadRequestException, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ValidationFactory } from '@/shared/factories/validation.factory';
import { toBoolean } from '@/shared/utils';

export class ConvertQueryParamPipe implements PipeTransform {
  private readonly _classValidator;

  constructor(classValidator) {
    this._classValidator = classValidator;
  }

  private transformValue(value: any) {
    if (typeof value === 'string') {
      // Check for boolean values
      if (value === 'true' || value === 'false') {
        return toBoolean(value);
      }

      // Check for arrays (comma-separated)
      if (value.includes(',')) {
        return value.split(',');
      }

      // Check for numbers
      if (/^\d+$/.test(value)) {
        return parseFloat(value);
      }
    }

    return value;
  }

  public async transform(value: any) {
    if (typeof value === 'string') {
      return this.transformValue(value);
    }

    const result = {};

    Object.keys(value).forEach((key) => {
      result[key] = this.transformValue(value[key]);
    });

    const dto = plainToInstance(this._classValidator, result);
    const errors = await validate(dto as object, { whitelist: true });

    if (errors.length) {
      throw new BadRequestException(
        ValidationFactory.flattenValidationErrors(errors),
      );
    }

    return dto;
  }
}
