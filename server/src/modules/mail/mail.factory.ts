import {
  GetDeletedSafeNoteEmail,
  GetInvestmentReceivedEmail,
  GetInviteToPlatformEmail,
  GetInviteToTeamEmail,
  GetNewSafeEmail,
  GetNewTermSheetEmail,
  GetNewVerificationRequestEmail,
  GetNotifyToPayEmail,
  GetNotifyToSignEmail,
  GetPaymentSuccessEmail,
  GetResetPasswordEmail,
  GetSafeSentEmail,
  GetShareSafeEmail,
  GetSignedSafeEmail,
  GetVerifyEmail,
  GetWelcomeEmail,
  GetRequestPermissionEmail,
} from '@lib/email-templates';
import { Injectable } from '@nestjs/common';

import { ConfigService } from '@/config';
import {
  ContactAttemptEmailData,
  DeletedSafeNoteEmailData,
  FeedbackEmailData,
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
  RequestPermissionEmailData,
} from '@/modules/mail/factory.types';
import { LinkFactory } from '@/shared/factories/link.factory';

import { EmailType } from './constants';
import { EmailToSend } from './types';

@Injectable()
export class MailFactory {
  private readonly apiUrl;
  private readonly clientUrl;
  private readonly dashboardUrl;
  private readonly staticFolderUrl;

  constructor(
    private readonly linkFactory: LinkFactory,
    private readonly configService: ConfigService,
  ) {
    const { apiUrl, clientUrl, staticFolderUrl, dashboardUrl } =
      this.configService.getUrlConfig();

    this.apiUrl = apiUrl;
    this.clientUrl = clientUrl;
    this.dashboardUrl = dashboardUrl;
    this.staticFolderUrl = staticFolderUrl;
  }

  createWelcomeEmail({
    to,
    confirmEmailToken,
    userName,
  }: WelcomeEmailData): EmailToSend {
    const verificationUrl =
      this.linkFactory.createConfirmEmailLink(confirmEmailToken);

    return {
      type: EmailType.WELCOME,
      to,
      subject: 'Welcome to MySAFEnotes!',
      html: GetWelcomeEmail({
        userName,
        verificationUrl,
      }),
    };
  }

  createVerifyEmail({
    to,
    confirmEmailToken,
    userName,
  }: VerifyEmailData): EmailToSend {
    const verificationUrl =
      this.linkFactory.createConfirmEmailLink(confirmEmailToken);

    return {
      type: EmailType.VERIFY,
      to,
      subject: 'Verify you email!',
      html: GetVerifyEmail({
        userName,
        verificationUrl,
      }),
    };
  }

  createResetPasswordEmail({ to, token }: ResetPasswordEmailData) {
    const resetPasswordUrl = this.linkFactory.createResetPasswordLink(token);

    return {
      type: EmailType.RESET_PASSWORD,
      to,
      subject: 'Reset your password!',
      html: GetResetPasswordEmail({
        resetPasswordUrl,
      }),
    };
  }

  createRequestInfoEmail({
    to,
    name,
    email,
  }: RequestInfoEmailData): EmailToSend {
    return {
      type: EmailType.REQUEST_INFO,
      to,
      subject: `Request Information`,
      html: `
        <b>${name}</b> requested info about MySAFEnotes.
        Their email: <b>${email}</b>
      `,
    };
  }

  createInviteToPlatformEmail({
    to,
    signUpToken,
    ...rest
  }: InviteToPlatformEmailData): EmailToSend {
    const signUpUrl = this.linkFactory.createSignUpLink(signUpToken);

    return {
      type: EmailType.INVITE_TO_PLATFORM,
      to,
      subject: 'Your were invited to MySAFEnotes!',
      html: GetInviteToPlatformEmail({
        ...rest,
        signUpUrl,
      }),
    };
  }

  createDeleteSafeNoteEmail({
    to,
    ...rest
  }: DeletedSafeNoteEmailData): EmailToSend {
    return {
      type: EmailType.DELETE_SAFE,
      to,
      subject: 'Your SAFE was deleted!',
      html: GetDeletedSafeNoteEmail({
        ...rest,
        dashboardUrl: this.dashboardUrl,
      }),
    };
  }

  createInviteToTeamEmail({
    to,
    joinToken,
    companyImage,
    ...rest
  }: InvitationToTeamEmailData): EmailToSend {
    const invitationUrl = this.linkFactory.createSignUpLink(joinToken);

    return {
      type: EmailType.INVITE_TO_TEAM,
      to,
      subject: `Your were invited to the team!`,
      html: GetInviteToTeamEmail({
        ...rest,
        companyImage: companyImage || undefined,
        actionUrl: rest.isUserActive ? this.dashboardUrl : invitationUrl,
      }),
    };
  }

  createNewSafeEmail({
    to,
    isUserActive,
    safeNoteId,
    viewSafeToken,
    ...rest
  }: NewSafeEmailData): EmailToSend {
    const viewSafeUrl = isUserActive
      ? this.linkFactory.createSafeNoteViewLink(safeNoteId)
      : this.linkFactory.createSafeNotePreviewLink(viewSafeToken);

    return {
      type: EmailType.NEW_SAFE,
      to,
      subject: 'New SAFE note!',
      html: GetNewSafeEmail({
        ...rest,
        viewSafeUrl,
      }),
    };
  }

  createSafeSentEmail({
    to,
    safeNoteId,
    ...rest
  }: SafeSentEmailData): EmailToSend {
    const viewSafeUrl = this.linkFactory.createSafeNoteViewLink(safeNoteId);

    return {
      type: EmailType.SAFE_SENT,
      to,
      subject: 'SAFE note has been sent!',
      html: GetSafeSentEmail({
        ...rest,
        viewSafeUrl,
      }),
    };
  }

  createRequestPermissionEmail({
    to,
    companyId,
    ...rest
  }: RequestPermissionEmailData): EmailToSend {
    const companyUrl = this.linkFactory.createCompanyDashboardLink(companyId);

    return {
      type: EmailType.REQUEST_PERMISSION,
      to,
      subject: 'Request for new permission',
      html: GetRequestPermissionEmail({
        ...rest,
        companyUrl,
        dashboardUrl: this.dashboardUrl,
      }),
    };
  }

  createShareSafeEmail({
    to,
    viewSafeToken,
    ...rest
  }: ShareSafeEmailData): EmailToSend {
    const viewSafeUrl =
      this.linkFactory.createSafeNotePreviewLink(viewSafeToken);

    return {
      type: EmailType.SHARE_SAFE,
      to,
      subject: `${rest.senderName} shared a SAFE note with you!`,
      html: GetShareSafeEmail({
        ...rest,
        viewSafeUrl,
      }),
    };
  }

  createSignedSafeEmail({
    to,
    safeNoteId,
    ...rest
  }: SignedSafeEmailData): EmailToSend {
    const viewSafeUrl = this.linkFactory.createSafeNoteViewLink(safeNoteId);

    return {
      type: EmailType.SIGNED_SAFE,
      to,
      subject: 'Your SAFE was signed!',
      html: GetSignedSafeEmail({
        ...rest,
        viewSafeUrl,
      }),
    };
  }

  createSignedTermSheetEmail({
    to,
    termSheetId,
    ...rest
  }: SignedTermSheetEmailData): EmailToSend {
    const viewSafeUrl = this.linkFactory.createTermSheetViewLink(termSheetId);
    // todo: change to TermSheet email template
    return {
      type: EmailType.SIGNED_TERM_SHEET,
      to,
      subject: 'Your Term Sheet was signed!',
      html: GetSignedSafeEmail({
        ...rest,
        viewSafeUrl,
      }),
    };
  }

  createNotificationToSignEmail({
    to,
    safeNoteId,
    isUserActive,
    viewSafeToken,
    ...rest
  }: NotificationToSignEmailData): EmailToSend {
    const signSafeUrl = isUserActive
      ? this.linkFactory.createSafeNoteViewLink(safeNoteId)
      : this.linkFactory.createSafeNotePreviewLink(viewSafeToken);

    return {
      type: EmailType.NOTIFICATION_TO_SIGN,
      to,
      subject: 'Notification to sign!',
      html: GetNotifyToSignEmail({
        ...rest,
        signSafeUrl,
      }),
    };
  }

  createNotificationToPayEmail({
    to,
    safeNoteId,
    ...rest
  }: NotificationToPayEmailData): EmailToSend {
    const paymentUrl = this.linkFactory.createSafeNoteViewLink(safeNoteId);

    return {
      type: EmailType.NOTIFICATION_TO_PAY,
      to,
      subject: 'Notification to pay!',
      html: GetNotifyToPayEmail({
        ...rest,
        goToPaymentUrl: paymentUrl,
      }),
    };
  }

  createPaymentSuccessEmail({
    to,
    paymentId,
    ...rest
  }: PaymentSuccessEmailData): EmailToSend {
    const invoiceUrl = this.linkFactory.createReceiptUrl(paymentId);

    return {
      type: EmailType.PAYMENT_SUCCESS,
      to,
      subject: 'Payment was completed!',
      html: GetPaymentSuccessEmail({
        ...rest,
        dashboardUrl: this.dashboardUrl,
        invoiceUrl: invoiceUrl,
      }),
    };
  }

  createInvestmentReceivedEmail({
    to,
    ...rest
  }: InvestmentReceivedEmailData): EmailToSend {
    return {
      type: EmailType.INVESTMENT_RECEIVED,
      to,
      subject: 'Investment received!',
      html: GetInvestmentReceivedEmail({
        ...rest,
        dashboardUrl: this.dashboardUrl,
      }),
    };
  }

  createOtpEmail({ to, userName, code }: OtpEmailData): EmailToSend {
    // todo this is just raw email template, should be changed to real one
    return {
      type: EmailType.OTP,
      to,
      subject: 'Your one-time password (OTP) code',

      html: `
        <h1>Dear ${userName}</h1>,
        
       <p>
       We have received a request for changing email or authentication on MySAFEnotes.
        To complete the process, please use the following OTP code:
        </p>
        
        <h2>Your OTp Code: ${code}</h2>
        
        <p>The code valid only for 10min</p>
        
        <p>
          If you have any questions or need assistance, please contact our support team at help@mysafenotes.com.
        </p>
      `,
    };
  }

  createContactAttempt({
    to,
    topic,
    message,
    senderEmail,
  }: ContactAttemptEmailData): EmailToSend {
    return {
      type: EmailType.OTP,
      to,
      subject: 'Contact Us Request Received',
      html: `
      <h3>
        You have received a new message from the contact form on your website.
      </h3>
  
      <p><strong>Topic:</strong> ${topic}</p>
  
      <p><strong>Message:</strong></p>
      <p>${message}</p>
  
      <p><strong>Sender Email:</strong> ${senderEmail}</p>
  
      <p>
        Please reach out to the sender if any follow-up is needed.
      </p>
  
      <p>
        Best regards,<br />
        MySAFEnotes Team
      </p>
      `,
    };
  }

  createFeedback({
    to,
    rating,
    feedback,
    senderEmail,
  }: FeedbackEmailData): EmailToSend {
    return {
      type: EmailType.OTP,
      to,
      subject: `User Feedback Submitted – Rating: ${rating}/5`,
      html: `
      <h3>
        You have received new feedback from a user on MySAFEnotes.
      </h3>
  
      <p><strong>Rating:</strong> ${rating} / 5</p>
  
      <p><strong>Feedback:</strong></p>
      <p>${feedback}</p>
  
      <p><strong>Sender Email:</strong> ${senderEmail}</p>
  
      <p>
        Please take this feedback into account and follow up if needed.
      </p>
  
      <p>
        Best regards,<br />
        MySAFEnotes Team
      </p>
      `,
    };
  }

  createNewTermSheetEmail({ to, ...rest }: NewTermSheetEmailData): EmailToSend {
    const viewTermsUrl = 'https://mysafenotes.com';

    return {
      type: EmailType.NEW_TERM_SHEET,
      to,
      subject: 'New term sheet',
      html: GetNewTermSheetEmail({
        ...rest,
        viewTermsUrl,
      }),
    };
  }

  createRequestCompanyVerificationEmail({
    to,
    ...rest
  }: RequestCompanyVerificationEmailData): EmailToSend {
    return {
      type: EmailType.REQUEST_COMPANY_VERIFICATION,
      to,
      subject: 'New company verification request',
      html: GetNewVerificationRequestEmail({
        ...rest,
        dashboardUrl: this.dashboardUrl,
      }),
    };
  }
}
