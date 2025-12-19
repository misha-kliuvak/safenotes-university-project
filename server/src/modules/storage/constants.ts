import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';

export const ROOT_STORAGE_FOLDER = 'storage';

export const STORAGE_FOLDERS = {
  UNKNOWN: ROOT_STORAGE_FOLDER + '/unknown',
  [UserEntity.name]: ROOT_STORAGE_FOLDER + '/users',
  [SafeNoteEntity.name]: ROOT_STORAGE_FOLDER + '/safe-notes',
  [TermSheetEntity.name]: ROOT_STORAGE_FOLDER + '/term-sheets',
  [CompanyEntity.name]: ROOT_STORAGE_FOLDER + '/companies',
};

export const IMAGE_EXTENSIONS = ['jpg', 'png', 'jpeg', 'svg'];

export const EventModelRemoved = 'eventModelRemoved';
