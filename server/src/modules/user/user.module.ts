import { Module } from '@nestjs/common';

import { AddressModule } from '@/modules/address/address.module';
import { MailModule } from '@/modules/mail/mail.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { UserHelper } from '@/modules/user/user.helper';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';

@Module({
  imports: [AddressModule, MailModule, StorageModule, SubscriptionModule],
  providers: [UserService, UserHelper],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
