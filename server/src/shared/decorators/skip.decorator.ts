import { SetMetadata } from '@nestjs/common';

export type SkipGuardValue = string[] | boolean;

export const SKIP_GUARD_DECORATOR_KEY = 'skipGuard';
export const SkipGuard = (...guards: any) => {
  let clsNames = true;

  if (guards?.length) {
    clsNames = guards.map((i: any) => i.name);
  }

  return SetMetadata(SKIP_GUARD_DECORATOR_KEY, clsNames as SkipGuardValue);
};
