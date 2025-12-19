import {
  InvestmentReceivedEmailData,
  InvitationToTeamEmailData,
  InviteToPlatformEmailData,
  NewSafeEmailData,
  NewTermSheetEmailData,
  NotificationToPayEmailData,
  NotificationToSignEmailData,
  OtpEmailData,
  PaymentSuccessEmailData,
  RequestCompanyVerificationEmailData,
  RequestInfoEmailData,
  ResetPasswordEmailData,
  SafeSentEmailData,
  ShareSafeEmailData,
  SignedSafeEmailData,
  SignedTermSheetEmailData,
  VerifyEmailData,
  WelcomeEmailData,
  DeletedSafeNoteEmailData,
  ContactAttemptEmailData,
  FeedbackEmailData,
  RequestPermissionEmailData,
} from '../factory.types';

export type RequestInfoEventPayload = RequestInfoEmailData;

export type WelcomeEmailEventPayload = Omit<
  WelcomeEmailData,
  'confirmEmailToken'
>;

export type VerifyEmailEventPayload = Omit<
  VerifyEmailData,
  'confirmEmailToken'
>;

export type ResetPasswordEmailEventPayload = Omit<
  ResetPasswordEmailData,
  'token'
>;

export type InviteToPlatformEmailEventPayload = Omit<
  InviteToPlatformEmailData,
  'signUpToken'
>;

export type InviteToTeamEmailEventPayload = Omit<
  InvitationToTeamEmailData,
  'joinToken'
>;

export interface NewSafeEventPayload
  extends Omit<NewSafeEmailData, 'viewSafeToken'> {
  safeNoteId: string;
}

export interface SafeSentEventPayload extends SafeSentEmailData {
  safeNoteId: string;
}

export interface ShareSafeEventPayload
  extends Omit<ShareSafeEmailData, 'viewSafeToken'> {
  safeNoteId: string;
}

export type SignedSafeEventPayload = SignedSafeEmailData;

export type SignedTermSheetEventPayload = SignedTermSheetEmailData;

export type ContactAttemptEventPayload = ContactAttemptEmailData;

export type SendFeedbackEventPayload = FeedbackEmailData;

export type RequestPermissionEventPayload = RequestPermissionEmailData;

export type DeletedSafeNoteEventPayload = DeletedSafeNoteEmailData;

export type NotificationToSignEventPayload = Omit<
  NotificationToSignEmailData,
  'viewSafeToken'
>;

export type PaymentSuccessEventPayload = PaymentSuccessEmailData;

export type NotificationToPayEventPayload = NotificationToPayEmailData;

export type InvestmentReceivedEmailPayload = InvestmentReceivedEmailData;

export type OtpEmailPayload = OtpEmailData;

export type NewTermSheetEmailPayload = NewTermSheetEmailData;

export type RequestCompanyVerificationEmailPayload =
  RequestCompanyVerificationEmailData;
