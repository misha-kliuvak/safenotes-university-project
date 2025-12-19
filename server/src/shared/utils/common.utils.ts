import { TransformFnParams } from 'class-transformer/types/interfaces';
import * as _ from 'lodash';
import { v4 } from 'uuid';

// TODO make class with static properties
export function generateShortId() {
  const uuid = v4();
  if (uuid.includes('-')) {
    return uuid.split('-').splice(0, 2).join('');
  }
  return uuid.slice(0, uuid.length / 3);
}

export function convertTimeFromMsToSeconds(num: number): number {
  return Math.floor(num / 1000);
}

export function secondsToMilliseconds(sec: number): number {
  return sec * 1000;
}

export function isValidNumber(num: number | string) {
  return !_.isNil(num);
}

export function compose(...functions: any[]) {
  return (value: string | TransformFnParams) => {
    return functions.reduce((result, fn) => {
      return fn(result);
    }, value);
  };
}
