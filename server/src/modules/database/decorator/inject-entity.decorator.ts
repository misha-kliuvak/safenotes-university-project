import { RepositorySource } from '@/modules/database/types';

export function InjectEntity<E>(Entity: RepositorySource<E>) {
  return function (target: any) {
    if (!Entity) {
      throw new SyntaxError(`Entity is not provided to ${target.name}.`);
    }

    target.Entity = Entity;
  };
}
