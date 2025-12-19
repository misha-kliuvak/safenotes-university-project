import { TransformFnParams } from 'class-transformer/types/interfaces';

export function trim(val: string | TransformFnParams): string {
  let value: string = val as string;

  if (typeof val === 'object') {
    value = val?.value;
  }

  if (!value) return value;

  if (typeof val === 'string') {
    return val.trim();
  }

  return value;
}

export function toLowerCase(val: string | TransformFnParams): string {
  let value: string = val as string;

  if (typeof val === 'object') {
    value = val?.value;
  }

  if (!value) return value;

  if (typeof val === 'string') {
    return val.toLowerCase();
  }

  return value;
}
