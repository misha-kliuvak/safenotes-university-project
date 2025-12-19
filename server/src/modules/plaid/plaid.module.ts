import { forwardRef, Module } from '@nestjs/common';

import { PlaidController } from '@/modules/plaid/plaid.controller';
import { UserModule } from '@/modules/user/user.module';
import { LinkFactory } from '@/shared/factories/link.factory';

import { PlaidProvider } from './plaid.provider';
import { PlaidService } from './plaid.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [PlaidController],
  providers: [LinkFactory, PlaidProvider.forRoot(), PlaidService],
  exports: [PlaidService],
})
export class PlaidModule {}
