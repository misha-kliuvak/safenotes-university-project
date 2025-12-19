import { Global, Module } from '@nestjs/common';

import { FileService } from '@/modules/storage/service/file.service';
import { StorageService } from '@/modules/storage/service/storage.service';
import { FileController } from '@/modules/storage/file.controller';

@Global()
@Module({
  controllers: [FileController],
  providers: [StorageService, FileService],
  exports: [StorageService, FileService],
})
export class StorageModule {}
