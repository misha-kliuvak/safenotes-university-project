import { BaseRepository } from '@/modules/database/base.repository';
import { repositoryList } from '@/modules/database/repository.list';

export const entityProviders = [];
export const repositoryProviders = [];

repositoryList.forEach((Repository: typeof BaseRepository) => {
  // add database entity for injection
  entityProviders.push({
    provide: Repository.Entity,
    useValue: Repository.Entity,
  });

  // add repository for injection
  repositoryProviders.push({
    provide: Repository,
    useValue: new Repository(Repository.Entity),
  });
});
