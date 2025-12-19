import { Global, Module } from '@nestjs/common';

import { ConfigService } from '@/config';
import { DatabaseModule } from '@/modules/database/database.module';
import { OtpModule } from '@/modules/otp/otp.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { CommonHelper } from '@/shared/helpers/common.helper';

@Global()
@Module({
  imports: [StorageModule, DatabaseModule, OtpModule],
  providers: [ConfigService, CommonHelper],
  exports: [ConfigService, CommonHelper],
})
export class SharedModule {}
