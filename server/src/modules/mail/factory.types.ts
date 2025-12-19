import {
  InvestmentReceivedEmailContext,
  InviteToPlatformEmailContext,
  InviteToTeamEmailContext,
  NewSafeEmailContext,
  NewTermSheetEmailContext,
  NotifyToPayEmailContext,
  NotifyToSignEmailContext,
  PaymentSuccessEmailContext,
  ResetPasswordEmailContext,
  SafeSentEmailContext,
  DeletedSafeNoteEmailContext,
  ShareSafeEmailContext,
  SignedSafeEmailContext,
  VerificationRequestEmailContext,
  VerifyEmailContext,
  WelcomeEmailContext,
  RequestPermissionEmailContext,
} from '@lib/email-templates';

import { BaseEmail } from '@/modules/mail/types';

export interface WelcomeEmailData
  extends BaseEmail,
    Omit<WelcomeEmailContext, 'verificationUrl'> {
  confirmEmailToken: string;
}

export interface VerifyEmailData
  extends BaseEmail,
    Omit<VerifyEmailContext, 'verificationUrl'> {
  confirmEmailToken: string;
}

export interface ResetPasswordEmailData
  extends BaseEmail,
    Omit<ResetPasswordEmailContext, 'resetPasswordUrl'> {
  token: string;
}

export interface InviteToPlatformEmailData
  extends BaseEmail,
    Omit<InviteToPlatformEmailContext, 'signUpUrl'> {
  signUpToken: string;
}

export interface InvitationToTeamEmailData
  extends BaseEmail,
    Omit<InviteToTeamEmailContext, 'actionUrl'> {
  joinToken: string;
  companyId: string;
}

export interface RequestPermissionEmailData
  extends BaseEmail,
    Omit<RequestPermissionEmailContext, 'dashboardUrl' | 'companyUrl'> {
  companyId: string;
}

export interface RequestInfoEmailData extends BaseEmail {
  name: string;
  email: string;
}

export interface SafeSentEmailData
  extends BaseEmail,
    Omit<SafeSentEmailContext, 'viewSafeUrl'> {
  safeNoteId: string;
}

export interface NewSafeEmailData
  extends BaseEmail,
    Omit<NewSafeEmailContext, 'viewSafeUrl'> {
  isUserActive: boolean;
  viewSafeToken: string;
  safeNoteId: string;
}

export interface SignedSafeEmailData
  extends BaseEmail,
    Omit<SignedSafeEmailContext, 'viewSafeUrl'> {
  safeNoteId: string;
}

export interface SignedTermSheetEmailData
  extends BaseEmail,
    Omit<SignedSafeEmailContext, 'viewSafeUrl'> {
  termSheetId: string;
}

export interface NotificationToSignEmailData
  extends BaseEmail,
    Omit<NotifyToSignEmailContext, 'signSafeUrl'> {
  safeNoteId: string;
  isUserActive: boolean;
  viewSafeToken: string;
  customMessage?: string;
}

export interface ShareSafeEmailData
  extends BaseEmail,
    Omit<ShareSafeEmailContext, 'viewSafeUrl'> {
  safeNoteId: string;
  viewSafeToken: string;
}

export interface DeletedSafeNoteEmailData
  extends BaseEmail,
    Omit<DeletedSafeNoteEmailContext, 'dashboardUrl'> {}

export interface PaymentSuccessEmailData
  extends BaseEmail,
    Omit<PaymentSuccessEmailContext, 'dashboardUrl'> {
  paymentId: string;
}

export interface NotificationToPayEmailData
  extends BaseEmail,
    Omit<NotifyToPayEmailContext, 'goToPaymentUrl'> {
  safeNoteId: string;
}

export interface InvestmentReceivedEmailData
  extends BaseEmail,
    Omit<InvestmentReceivedEmailContext, 'dashboardUrl'> {}

// data could be different in real email template
export interface OtpEmailData extends BaseEmail {
  userName: string;
  code: string;
}

export interface ContactAttemptEmailData extends BaseEmail {
  topic: string;
  message: string;
  senderEmail: string;
}

export interface FeedbackEmailData extends BaseEmail {
  feedback: string;
  rating: number;
  senderEmail: string;
}

export interface NewTermSheetEmailData
  extends BaseEmail,
    Omit<NewTermSheetEmailContext, 'viewTermsUrl'> {
  termSheetId: string;
  viewTermSheetToken: string;
}

export interface RequestCompanyVerificationEmailData
  extends BaseEmail,
    Omit<VerificationRequestEmailContext, 'dashboardUrl'> {}
