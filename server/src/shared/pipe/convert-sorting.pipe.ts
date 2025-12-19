import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { ORDER_BY } from '@/modules/database/enums';

@Injectable()
export class ConvertSortingQueryPipe implements PipeTransform {
  transform(value: string): Record<string, ORDER_BY> {
    if (!value) {
      return {};
    }

    // Split the string by semicolon to separate sorting fields
    const sortingFields = value.split(',');
    const sortingObject: Record<string, ORDER_BY> = {};

    // Loop through the sorting fields and parse them
    sortingFields.forEach((field) => {
      const [key, direction] = field.split(':');

      const isNotASC = direction?.toUpperCase() !== ORDER_BY.ASC;
      const isNotDESC = direction?.toUpperCase() !== ORDER_BY.DESC;

      if (!key || !direction || (isNotASC && isNotDESC)) {
        throw new BadRequestException('Invalid sorting format');
      }
      sortingObject[key] = direction.toUpperCase() as ORDER_BY;
    });

    return sortingObject;
  }
}
