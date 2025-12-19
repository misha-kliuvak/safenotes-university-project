import { MulterFile } from '@/shared/types';
import { Model } from 'sequelize-typescript';

export interface StorageFile extends MulterFile {
  absolutePath: string;
  relativePath: string;
  url: string;
}

interface File {
  file: MulterFile;
  fileName?: string;
}

export interface FileWithDestination extends File {
  destination?: string;
}

export interface UserFile extends File {
  userId: string;
}

export interface TermSheetFile extends File {
  termSheetId: string;
}

export interface SafeNoteFile extends File {
  safeNoteId: string;
}

export interface CompanyFile extends File {
  companyId: string;
}

export interface ModelFile extends File {
  model: Model;
}
