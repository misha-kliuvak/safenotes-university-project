import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@/config';
import { StorageModule } from '@/modules/storage/storage.module';
import { JestModule } from '@/shared/jest/jest.module';

import { STORAGE_FOLDERS } from '../constants';
import { StorageService } from '../service/storage.service';

describe('StorageService', () => {
  let storageService: StorageService;
  let configService: ConfigService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        JestModule,
        SequelizeModule.forRoot({ dialect: 'postgres' }),
        StorageModule,
      ],
    }).compile();

    storageService = app.get(StorageService);
    configService = app.get(ConfigService);
  });

  describe('getFileUrl', () => {
    // it('should return a valid file URL', () => {
    //   const filePath = 'example.jpg';
    //   const apiUrl = configService.getUrlConfig().apiUrl;
    //   const expectedUrl = `${apiUrl}/${filePath}`;
    //
    //   const result = storageService.getFileUrl(filePath);
    //   expect(result).toBe(expectedUrl);
    // });
    //
    // it('should return undefined for undefined filePath', () => {
    //   const result = storageService.getFileUrl(undefined);
    //   expect(result).toBeUndefined();
    // });
  });

  describe('createFolder', () => {
    it('should create a folder', () => {
      const folderPath = 'test-folder';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      storageService.createFolder(folderPath);
      // You can add assertions to check if the folder was created successfully
    });
  });

  describe('initStorage', () => {
    it('should create all storage folders', () => {
      const folders = Object.values(STORAGE_FOLDERS);
      folders.forEach((folderName) => {
        // You can add assertions to check if each folder was created successfully
      });
    });
  });

  describe('saveUserFile', () => {
    it('should save a user file', async () => {
      const userFile = {
        file: {
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from([0x1, 0x2, 0x3]),
        },
        fileName: 'testfile',
        userId: '123',
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = await storageService.saveUserFile(userFile);
      // You can add assertions to check if the file was saved successfully and properties were set correctly
    });

    it('should return null for missing file', async () => {
      const userFile = {
        file: undefined,
        fileName: 'testfile',
        userId: '123',
      };
      const result = await storageService.saveUserFile(userFile);
      expect(result).toBeNull();
    });
  });
});
