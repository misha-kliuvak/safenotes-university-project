import { forwardRef, Module } from '@nestjs/common';

import { CompanyModule } from '@/modules/company/company.module';
import { SafeNoteModule } from '@/modules/safe-note/safe-note.module';
import { TermSheetUserService } from '@/modules/term-sheet/term-sheet-user.service';
import { TermSheetPresenter } from '@/modules/term-sheet/term-sheet.presenter';
import { UserModule } from '@/modules/user/user.module';

import { TermSheetController } from './term-sheet.controller';
import { TermSheetService } from './term-sheet.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => SafeNoteModule),
  ],
  controllers: [TermSheetController],
  providers: [TermSheetService, TermSheetUserService, TermSheetPresenter],
  exports: [TermSheetService, TermSheetUserService],
})
export class TermSheetModule {}
