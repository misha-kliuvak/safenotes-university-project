import { forwardRef, Module } from '@nestjs/common';

import { AddressModule } from '@/modules/address/address.module';
import { CompanyPresenter } from '@/modules/company/company.presenter';
import { CompanyGuardHelper } from '@/modules/company/helper/company-guard.helper';
import { CompanyHelper } from '@/modules/company/helper/company.helper';
import { CompanySummaryService } from '@/modules/company/service/company-summary.service';
import { CompanyUserService } from '@/modules/company/service/company-user.service';
import { TeamMemberModule } from '@/modules/team-member/team-member.module';
import { UserModule } from '@/modules/user/user.module';

import { CompanyController } from './company.controller';
import { CompanyService } from './service/company.service';
import { SafeNoteModule } from '@/modules/safe-note/safe-note.module';
import { PaymentModule } from '@/modules/payment/payment.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';

@Module({
  imports: [
    AddressModule,
    TeamMemberModule,
    forwardRef(() => UserModule),
    forwardRef(() => SafeNoteModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [CompanyController],
  providers: [
    CompanyService,
    CompanyUserService,
    CompanyPresenter,
    CompanyHelper,
    CompanyGuardHelper,
    CompanySummaryService,
  ],
  exports: [
    CompanyService,
    CompanyUserService,
    CompanyGuardHelper,
    CompanySummaryService,
  ],
})
export class CompanyModule {}
