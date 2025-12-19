import { FileEntity } from '@/modules/storage/entity/file.entity';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { BaseRepository } from '@/modules/database/base.repository';

@InjectEntity(FileEntity)
export class FileRepository extends BaseRepository<FileEntity> {}
