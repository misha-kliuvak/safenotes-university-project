import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      return value.trim();
    } else if (typeof value === 'object') {
      return this.transformObject(value);
    }
    return value;
  }

  private transformObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const transformedObj = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      transformedObj[key] = typeof value === 'string' ? value.trim() : value;
    }
    return transformedObj;
  }
}
