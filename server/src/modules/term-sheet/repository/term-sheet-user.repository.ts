import { BaseRepository } from '@/modules/database/base.repository';
import { InjectEntity } from '@/modules/database/decorator/inject-entity.decorator';
import { TermSheetUserEntity } from '@/modules/term-sheet/entity/term-sheet-user.entity';

@InjectEntity(TermSheetUserEntity)
export class TermSheetUserRepository extends BaseRepository<TermSheetUserEntity> {}
