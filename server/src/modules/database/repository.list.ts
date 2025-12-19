import { AddressRepository } from '@/modules/address/repository/address.repository';
import { AngelCompanyRepository } from '@/modules/company/repository/angel-company.repository';
import { CompanyPaymentRepository } from '@/modules/company/repository/company-payment.repository';
import { CompanySummaryRepository } from '@/modules/company/repository/company-summary.repository';
import { CompanyUserRepository } from '@/modules/company/repository/company-user.repository';
import { CompanyRepository } from '@/modules/company/repository/company.repository';
import { EntrepreneurCompanyRepository } from '@/modules/company/repository/entrepreneur-company.repository';
import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import { PaymentRepository } from '@/modules/payment/repository/payment.repository';
import { PlaidSettingsRepository } from '@/modules/plaid/repository/plaid-settings.repository';
import { SafeNoteRepository } from '@/modules/safe-note/repository/safe-note.repository';
import { FileRepository } from '@/modules/storage/repository/file.repository';
import { SubscriptionRepository } from '@/modules/subscription/repository/subscription.repository';
import { TermSheetUserRepository } from '@/modules/term-sheet/repository/term-sheet-user.repository';
import { TermSheetRepository } from '@/modules/term-sheet/repository/term-sheet.repository';
import { TokenBlacklistRepository } from '@/modules/token/repository/token-blacklist.repository';
import { UserPasswordRepository } from '@/modules/user/repository/user-password.repository';
import { UserRepository } from '@/modules/user/repository/user.repository';

export const repositoryList = [
  AddressRepository,
  TokenBlacklistRepository,
  NotificationRepository,

  UserRepository,
  UserPasswordRepository,
  SubscriptionRepository,

  CompanyRepository,
  CompanyUserRepository,
  CompanyPaymentRepository,
  CompanySummaryRepository,
  AngelCompanyRepository,
  EntrepreneurCompanyRepository,

  PlaidSettingsRepository,

  SafeNoteRepository,
  PaymentRepository,
  TermSheetRepository,
  TermSheetUserRepository,

  FileRepository,
];
