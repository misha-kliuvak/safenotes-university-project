import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

import { ConfigService } from '@/config';
import { rootDir } from '@/directories';
import { Logger } from '@/modules/logger/logger';
import {
  CompanyFile,
  FileWithDestination,
  SafeNoteFile,
  StorageFile,
  TermSheetFile,
  UserFile,
} from '@/modules/storage/types';

import { STORAGE_FOLDERS } from '../constants';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import * as _ from 'lodash';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly configService: ConfigService) {}

  protected getFileUrl(filePath) {
    if (!filePath) return;
    const apiUrl = this.configService.getUrlConfig().apiUrl;
    return `${apiUrl}/${filePath}`;
  }

  private createFolder(folderPath: string) {
    try {
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  public initStorage() {
    const folders: string[] = Object.values(STORAGE_FOLDERS);

    for (const folderName of folders) {
      this.createFolder(folderName);
    }
  }

  public async saveFile(
    options: FileWithDestination,
  ): Promise<StorageFile | null> {
    const DEFAULT_FILE_NAME = Date.now().toString();

    const { destination, file, fileName = DEFAULT_FILE_NAME } = options;

    if (!file) return Promise.resolve(null);

    const fileExt = extname(file.originalname) || '.jpg';
    const originalFileNameWithoutExt = file.originalname.replace(fileExt, '');

    const finalDestination = destination || STORAGE_FOLDERS.UNKNOWN;
    const finalFileName = fileName
      ? `${fileName}${fileExt}`
      : `${originalFileNameWithoutExt}-${Date.now()}${fileExt}`;

    const relativePath = join(finalDestination, finalFileName);
    const absolutePath = join(rootDir, relativePath);

    try {
      mkdirSync(finalDestination, { recursive: true });

      // TODO figure this out, why sharp save images to long

      /*     if (file.mimetype === 'image/png') {
            await sharp(file.buffer).png({ quality: 15 }).toFile(absolutePath);
          } else if (file.mimetype === 'image/jpeg') {
            await sharp(file.buffer).jpeg({ quality: 15 }).toFile(absolutePath);
          } else {
            writeFileSync(relativePath, file.buffer);
          } */

      writeFileSync(relativePath, file.buffer);

      const finalFile = _.clone(file);
      delete finalFile.buffer;

      const url = this.getFileUrl(relativePath);

      finalFile['relativePath'] = relativePath;
      finalFile['absolutePath'] = absolutePath;
      finalFile['fileName'] = finalFileName;
      finalFile['url'] = url;

      return finalFile as StorageFile;
    } catch (err) {
      this.logger.error(err);
    }
  }

  public async saveUserFile({ file, fileName, userId }: UserFile) {
    const destination = join(STORAGE_FOLDERS[UserEntity.name], userId);

    return this.saveFile({
      file,
      fileName,
      destination,
    });
  }

  public async saveTermSheetFile({
    file,
    fileName,
    termSheetId,
  }: TermSheetFile) {
    const destination = join(
      STORAGE_FOLDERS[TermSheetEntity.name],
      termSheetId,
    );

    return this.saveFile({
      file,
      fileName,
      destination,
    });
  }

  public async saveSafeNoteFile({ file, fileName, safeNoteId }: SafeNoteFile) {
    const destination = join(STORAGE_FOLDERS[SafeNoteEntity.name], safeNoteId);

    return this.saveFile({
      file,
      fileName,
      destination,
    });
  }

  public async saveCompanyFile({ file, fileName, companyId }: CompanyFile) {
    if (!file || !companyId) return;

    const destination = join(STORAGE_FOLDERS[CompanyEntity.name], companyId);

    return this.saveFile({
      file,
      fileName,
      destination,
    });
  }
}
