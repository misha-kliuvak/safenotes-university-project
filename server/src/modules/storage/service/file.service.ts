import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'path';

import { Logger } from '@/modules/logger/logger';
import { FileRepository } from '@/modules/storage/repository/file.repository';
import { BaseServiceImpl } from '@/modules/database/base.service';
import { FileEntity } from '@/modules/storage/entity/file.entity';
import { MulterFile } from '@/shared/types';
import {
  EventModelRemoved,
  STORAGE_FOLDERS,
} from '@/modules/storage/constants';
import { StorageService } from '@/modules/storage/service/storage.service';
import { ICreateOptions } from '@/modules/database/types';
import { Model } from 'sequelize-typescript';
import { unlink } from 'fs/promises';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class FileService extends BaseServiceImpl<FileEntity> {
  private logger: Logger = new Logger(FileService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly storageService: StorageService,
  ) {
    super(fileRepository);
  }

  async getOneByModel(model: Model, collectionName?: string) {
    return this.fileRepository.getOne({
      where: {
        modelId: model.id,
        modelClassname: model.constructor.name,
        collectionName,
      },
    });
  }

  async getAllByModel(model: Model, collectionName?: string) {
    return this.fileRepository.getAll({
      where: {
        modelId: model.id,
        modelClassname: model.constructor.name,
        collectionName,
      },
    });
  }

  @OnEvent(EventModelRemoved)
  async deleteByModel(model: Model): Promise<void> {
    const files = await this.getAllByModel(model);
    for (const file of files) {
      this.deleteByID(file.id);
    }
  }

  async deleteByID(id: string): Promise<void> {
    const file = await this.fileRepository.getById(id);
    await this.fileRepository.deleteById(id);
    unlink(file.absolutePath);
  }

  public async saveModelFile(
    model: Model,
    file: MulterFile,
    collectionName?: string,
    options?: ICreateOptions,
  ) {
    if (!file) {
      throw new BadRequestException('File should be presented');
    }

    if (!model) {
      throw new BadRequestException('Linked object should be presented');
    }

    let STORAGE_FOLDER = STORAGE_FOLDERS[model.constructor.name];
    if (collectionName) {
      STORAGE_FOLDER = join(STORAGE_FOLDER, collectionName);
    }

    const destination = join(STORAGE_FOLDER, model.id);

    const savedFile = await this.storageService.saveFile({
      file,
      destination,
    });

    return this.fileRepository.create(
      {
        ...savedFile,
        originalName: savedFile.originalname,
        modelId: model.id,
        modelClassname: model.constructor.name,
        collectionName,
      },
      options,
    );
  }
}
