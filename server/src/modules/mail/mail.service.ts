import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';

import { ConfigService } from '@/config';
import { Logger } from '@/modules/logger/logger';
import { SendEmailEvent } from '@/modules/mail/constants';
import { MailFactory } from '@/modules/mail/mail.factory';
import {
  ContactAttemptEventPayload,
  DeletedSafeNoteEventPayload,
  InvestmentReceivedEmailPayload,
  InviteToPlatformEmailEventPayload,
  InviteToTeamEmailEventPayload,
  NewSafeEventPayload,
  NewTermSheetEmailPayload,
  NotificationToPayEventPayload,
  NotificationToSignEventPayload,
  OtpEmailPayload,
  PaymentSuccessEventPayload,
  RequestCompanyVerificationEmailPayload,
  RequestPermissionEventPayload,
  ResetPasswordEmailEventPayload,
  SafeSentEventPayload,
  SendFeedbackEventPayload,
  ShareSafeEventPayload,
  SignedSafeEventPayload,
  SignedTermSheetEventPayload,
  VerifyEmailEventPayload,
  WelcomeEmailEventPayload,
} from '@/modules/mail/types';
import { TokenService } from '@/modules/token/token.service';
import { minifyAndConvertTemplateToHtml } from '@/shared/utils';

import { EmailToSend } from './types';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private mailFactory: MailFactory,
    private configService: ConfigService,
    private tokenService: TokenService,
  ) {}

  private async handler(callback) {
    try {
      await callback();
    } catch (err) {
      this.logger.error('[sendEmail]: ' + err.message, err.stack);
    }
  }

  public async sendEmail(rootOptions: EmailToSend) {
    try {
      const options = rootOptions;

      const {
        mail: { from: mailUser },
      } = this.configService.getConfig();

      if ('template' in options) {
        const html = await minifyAndConvertTemplateToHtml(
          this.configService.getUrlConfig(),
          options.template,
          options.context,
        );

        if (!html) return;

        return await this.mailerService.sendMail({
          to: options.to,
          from: mailUser,
          subject: options.subject,
          html,
        });
      }

      const response = await this.mailerService.sendMail({
        from: mailUser,
        ...options,
      });

      this.logger.log(
        `[sendEmail]: ${options.type}Email was sent to ${options.to}`,
      );

      return response;
    } catch (err) {
      this.logger.error('[sendEmail] ' + err, err.stack);
    }
  }

  @OnEvent(SendEmailEvent.WELCOME)
  public async sendWelcomeEmail(payload: WelcomeEmailEventPayload) {
    await this.handler(async () => {
      const confirmToken = this.tokenService.createServiceToken({
        email: payload.to,
      });

      const welcomeEmail = this.mailFactory.createWelcomeEmail({
        ...payload,
        confirmEmailToken: confirmToken,
      });
      await this.sendEmail(welcomeEmail);
    });
  }

  @OnEvent(SendEmailEvent.VERIFY)
  public async sendVerifyEmail(payload: VerifyEmailEventPayload) {
    await this.handler(async () => {
      const confirmToken = this.tokenService.createServiceToken({
        email: payload.to,
      });

      const verifyEmail = this.mailFactory.createVerifyEmail({
        ...payload,
        confirmEmailToken: confirmToken,
      });
      await this.sendEmail(verifyEmail);
    });
  }

  @OnEvent(SendEmailEvent.CONTACT_ATTEMPT)
  public async contactAttemptEmail(payload: ContactAttemptEventPayload) {
    await this.handler(async () => {
      const contactAttemptEmail =
        this.mailFactory.createContactAttempt(payload);

      await this.sendEmail(contactAttemptEmail);
    });
  }

  @OnEvent(SendEmailEvent.SEND_FEEDBACK)
  public async feedbackEmail(payload: SendFeedbackEventPayload) {
    await this.handler(async () => {
      const contactAttemptEmail = this.mailFactory.createFeedback(payload);

      await this.sendEmail(contactAttemptEmail);
    });
  }

  @OnEvent(SendEmailEvent.REQUEST_PERMISSION)
  public async requestPermissionEmail(payload: RequestPermissionEventPayload) {
    await this.handler(async () => {
      const permissionEmail =
        this.mailFactory.createRequestPermissionEmail(payload);

      await this.sendEmail(permissionEmail);
    });
  }

  @OnEvent(SendEmailEvent.RESET_PASSWORD)
  public async sendResetPasswordEmail(payload: ResetPasswordEmailEventPayload) {
    await this.handler(async () => {
      const token = this.tokenService.createServiceToken({
        email: payload.to,
      });

      const email = this.mailFactory.createResetPasswordEmail({
        ...payload,
        token,
      });
      await this.sendEmail(email);
    });
  }

  @OnEvent(SendEmailEvent.INVITE_TO_PLATFORM)
  public async sendInviteToPlatformEmail(
    payload: InviteToPlatformEmailEventPayload,
  ) {
    const token = this.tokenService.createServiceToken({
      email: payload.to,
      fullName: payload.userName,
    });

    const invitationEmail = this.mailFactory.createInviteToPlatformEmail({
      ...payload,
      signUpToken: token,
    });

    await this.sendEmail(invitationEmail);
  }

  @OnEvent(SendEmailEvent.INVITE_TO_TEAM)
  public async sendInviteToTeamEmail({
    ...payload
  }: InviteToTeamEmailEventPayload) {
    const token = this.tokenService.createServiceToken({
      email: payload.to,
      fullName: payload.userName,
      id: payload.companyId,
      name: payload.companyName,
    });

    const inviteToTeamEmail = this.mailFactory.createInviteToTeamEmail({
      ...payload,

      joinToken: token,
    });

    await this.sendEmail(inviteToTeamEmail);
  }

  @OnEvent(SendEmailEvent.SAFE_SENT)
  public async sendSafeSentEmail({
    safeNoteId,
    ...payload
  }: SafeSentEventPayload) {
    const safeSentEmail = this.mailFactory.createSafeSentEmail({
      ...payload,
      safeNoteId,
    });

    await this.sendEmail(safeSentEmail);
  }

  @OnEvent(SendEmailEvent.NEW_SAFE)
  public async sendNewSafeEmail({
    safeNoteId,
    ...payload
  }: NewSafeEventPayload) {
    const viewSafeToken = this.tokenService.createServiceToken({
      email: payload.to,
      safeNoteId: safeNoteId,
    });

    const newSafeEmail = this.mailFactory.createNewSafeEmail({
      ...payload,
      viewSafeToken,
      safeNoteId,
    });

    await this.sendEmail(newSafeEmail);
  }

  @OnEvent(SendEmailEvent.SHARE_SAFE)
  public async sendShareSafeEmail({
    safeNoteId,
    ...payload
  }: ShareSafeEventPayload) {
    const viewSafeToken = this.tokenService.createServiceToken({
      email: payload.to,
      safeNoteId: safeNoteId,
      shared: true,
    });

    const safeSentEmail = this.mailFactory.createShareSafeEmail({
      ...payload,
      safeNoteId,
      viewSafeToken,
    });

    await this.sendEmail(safeSentEmail);
  }

  @OnEvent(SendEmailEvent.SIGNED_SAFE)
  public async sendSignedSafeEmail(payload: SignedSafeEventPayload) {
    const email = this.mailFactory.createSignedSafeEmail(payload);
    await this.sendEmail(email);
  }

  @OnEvent(SendEmailEvent.SIGNED_TERM_SHEET)
  public async sendSignedTermSheetEmail(payload: SignedTermSheetEventPayload) {
    const email = this.mailFactory.createSignedTermSheetEmail(payload);
    await this.sendEmail(email);
  }

  @OnEvent(SendEmailEvent.DELETE_SAFE)
  public async sendDeleteSafeNoteEmail(payload: DeletedSafeNoteEventPayload) {
    const email = this.mailFactory.createDeleteSafeNoteEmail(payload);
    await this.sendEmail(email);
  }

  @OnEvent(SendEmailEvent.NOTIFICATION_TO_SIGN)
  public async sendNotificationToSignEmail(
    payload: NotificationToSignEventPayload,
  ) {
    const viewSafeToken = this.tokenService.createServiceToken({
      email: payload.to,
      safeNoteId: payload.safeNoteId,
    });

    const email = this.mailFactory.createNotificationToSignEmail({
      ...payload,
      viewSafeToken,
    });
    await this.sendEmail(email);
  }

  @OnEvent(SendEmailEvent.NOTIFICATION_TO_PAY)
  public async sendNotificationToPayEmail(
    payload: NotificationToPayEventPayload,
  ) {
    const email = this.mailFactory.createNotificationToPayEmail(payload);
    await this.sendEmail(email);
  }

  @OnEvent(SendEmailEvent.PAYMENT_SUCCESS)
  public async sendPaymentSuccessEmail(payload: PaymentSuccessEventPayload) {
    const email = this.mailFactory.createPaymentSuccessEmail(payload);
    await this.sendEmail(email);
  }

  @OnEvent(SendEmailEvent.INVESTMENT_RECEIVED)
  public async sendInvestmentReceivedEmail(
    payload: InvestmentReceivedEmailPayload,
  ) {
    const email = this.mailFactory.createInvestmentReceivedEmail(payload);
    await this.sendEmail(email);
  }

  @OnEvent(SendEmailEvent.OTP)
  public async sendOtpEMail(payload: OtpEmailPayload) {
    const email = this.mailFactory.createOtpEmail(payload);
    await this.sendEmail(email);
  }

  @OnEvent(SendEmailEvent.NEW_TERM_SHEET)
  public async sendNewTermSheetEmail(payload: NewTermSheetEmailPayload) {
    // TODO: finish implementation after real email template
    // need to generate token here for view term sheet (if its needed) for user without account
    const email = this.mailFactory.createNewTermSheetEmail(payload);

    await this.sendEmail(email);
  }

  @OnEvent(SendEmailEvent.REQUEST_COMPANY_VERIFICATION)
  public async sendRequestCompanyVerificationEmail(
    payload: RequestCompanyVerificationEmailPayload,
  ) {
    await this.handler(async () => {
      const email =
        this.mailFactory.createRequestCompanyVerificationEmail(payload);

      await this.sendEmail(email);
    });
  }
}
