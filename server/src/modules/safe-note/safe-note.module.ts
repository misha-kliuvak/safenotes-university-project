import { forwardRef, Module } from '@nestjs/common';

import { CompanyModule } from '@/modules/company/company.module';
import { MailModule } from '@/modules/mail/mail.module';
import { PaymentModule } from '@/modules/payment/payment.module';
import { SafeNotePresenter } from '@/modules/safe-note/safe-note.presenter';
import { SafeNoteUserService } from '@/modules/safe-note/service/safe-note-user.service';
import { StorageModule } from '@/modules/storage/storage.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { TermSheetModule } from '@/modules/term-sheet/term-sheet.module';
import { UserModule } from '@/modules/user/user.module';

import { SafeNoteController } from './safe-note.controller';
import { SafeNoteService } from './service/safe-note.service';

@Module({
  imports: [
    StorageModule,
    MailModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => UserModule),
    forwardRef(() => TermSheetModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [SafeNoteController],
  providers: [SafeNoteService, SafeNotePresenter, SafeNoteUserService],
  exports: [SafeNoteService, SafeNoteUserService, SafeNotePresenter],
})
export class SafeNoteModule {}
