import { BaseRepository } from '@/modules/database/base.repository';
import { repositoryList } from '@/modules/database/repository.list';

export const databaseEntities = repositoryList.map(
  (Repository: typeof BaseRepository) => Repository.Entity,
);
