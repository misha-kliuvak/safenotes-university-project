import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as puppeteer from 'puppeteer';
import { Transaction } from 'sequelize';

import { ConfigService } from '@/config';
import { BaseServiceImpl } from '@/modules/database/base.service';
import { TxService } from '@/modules/database/tx.service';
import {
  ServiceQueryOptions,
  TransactionOptions,
} from '@/modules/database/types';
import { Logger } from '@/modules/logger/logger';
import { SendEmailEvent } from '@/modules/mail/constants';
import { MailService } from '@/modules/mail/mail.service';
import {
  InvestmentReceivedEmailPayload,
  NotificationToSignEventPayload,
  SignedSafeEventPayload,
} from '@/modules/mail/types';
import { SendNotificationEvent } from '@/modules/notification/constants';
import { PayedSafeNotificationDto } from '@/modules/notification/dto/payed-safe-note.dto';
import { SignedSafeNotificationDto } from '@/modules/notification/dto/signed-safe.dto';
import { PaymentEvent, PaymentReason } from '@/modules/payment/enums';
import {
  HandlePaymentSuccessEventPayload,
  HandlePaymentPendingEventPayload,
  HandlePaymentFailedEventPayload,
  HandlePaymentRefundEventPayload,
} from '@/modules/payment/types';
import { CreateSafeDto } from '@/modules/safe-note/dto/create-safe.dto';
import { SignSafeDto } from '@/modules/safe-note/dto/sign-safe.dto';
import { UpdateSafeDto } from '@/modules/safe-note/dto/update-safe.dto';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import { PayAs, SafeNoteStatus, SignSafeAs } from '@/modules/safe-note/enums';
import { SafeNoteUtils } from '@/modules/safe-note/safe-note.utils';
import {
  SafeNoteData,
  SafeNotePaymentMetadata,
  SafeNoteTerms,
} from '@/modules/safe-note/types';
import { StorageService } from '@/modules/storage/service/storage.service';
import { TokenService } from '@/modules/token/token.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { UserService } from '@/modules/user/user.service';
import { Role } from '@/shared/enums';
import { CommonHelper } from '@/shared/helpers/common.helper';
import { MulterFile } from '@/shared/types';
import {
  camelCaseToDashCase,
  minifyAndConvertTemplateToHtml,
} from '@/shared/utils';

import { SafeNoteRepository } from '../repository/safe-note.repository';

@Injectable()
export class SafeNoteService extends BaseServiceImpl<SafeNoteEntity> {
  private logger: Logger = new Logger(SafeNoteService.name);

  constructor(
    private readonly safeNoteRepository: SafeNoteRepository,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
    private readonly commonHelper: CommonHelper,
    private readonly txService: TxService,
  ) {
    super(safeNoteRepository);
  }

  public async getAllForUser(userId: string, options?: ServiceQueryOptions) {
    // to not show all the safe notes if filter is not set
    if (!options?.filters || Object.keys(options?.filters).length === 0) {
      return [];
    }

    return this.safeNoteRepository.getAll(options);
  }

  async getWithToken(token: string) {
    const tokenResult = await this.tokenService.validateServiceToken(token);

    if (tokenResult.valid && 'safeNoteId' in (tokenResult?.data || {})) {
      const safeNote = await this.getById(tokenResult.data.safeNoteId, {
        throwNotFound: true,
      });

      // replace signatures for preview mode
      safeNote.senderSignature = safeNote.senderSignature
        ? this.commonHelper.getStaticImage('signature')
        : null;
      safeNote.recipientSignature = safeNote.recipientSignature
        ? this.commonHelper.getStaticImage('signature')
        : null;

      return safeNote;
    }

    throw new BadRequestException(
      'Cannot fetch the SAFE note, token is invalid!',
    );
  }

  public async getCompanyIdsFromReceivedSafes(
    userId: string,
    angelCompanyId: string,
    options?: ServiceQueryOptions,
  ) {
    return (
      await this.safeNoteRepository.getAllReceived(userId, angelCompanyId, {
        include: [],
        attributes: ['senderCompanyId'],
        ...options,
      })
    ).map((safe: SafeNoteEntity) => safe.senderCompanyId);
  }

  public async getPendingSafes(userId: string) {
    return this.safeNoteRepository.getPendingSafes(userId);
  }

  public async getMaxTerms(companyId: string): Promise<SafeNoteTerms> {
    return this.safeNoteRepository.getMaxTerms(companyId);
  }

  async addSignature(
    id: string,
    file: MulterFile,
    dto: SignSafeDto,
    transaction?: Transaction,
  ) {
    const safeNote = await this.safeNoteRepository.getById(id, { transaction });

    const { signatureField, signNameField, signDateField } =
      SafeNoteUtils.mapSignAsToSignatureData(dto.signAs);

    const isSignatureExist = !!safeNote[signatureField];
    if (isSignatureExist) {
      throw new BadRequestException('Safe note already signed!');
    }

    const signature = await this.storageService.saveSafeNoteFile({
      file: file,
      fileName: camelCaseToDashCase(signatureField),
      safeNoteId: safeNote.id,
    });

    if (signature && dto.signAs === SignSafeAs.RECIPIENT) {
      this.eventEmitter.emit(SendEmailEvent.SIGNED_SAFE, {
        safeNoteId: safeNote.id,
        to: safeNote.senderCompany.owner.email,
        userName: safeNote.senderCompany.owner.fullName,
      } as SignedSafeEventPayload);

      for (const member of safeNote.senderCompany.companyUsers.filter((user) =>
        [Role.OWNER, Role.TEAM_MEMBER].includes(user.role),
      )) {
        this.eventEmitter.emit(SendNotificationEvent.SIGNED_SAFE_NOTE, {
          userId: member.userId,
          companyId: safeNote.senderCompanyId,
          payload: {
            companyImage: safeNote.senderCompany.image,
            companyName: safeNote.senderCompany.name,
            senderImage: safeNote.recipient.image,
            senderName: safeNote.recipient.fullName,
          },
        } as SignedSafeNotificationDto);
      }
    }

    return this.safeNoteRepository.updateById(
      safeNote.id,
      {
        [signatureField]: signature.url,
        [signNameField]: dto.name,
        [signDateField]: new Date(),
        ...(dto.signAs === SignSafeAs.RECIPIENT && {
          status: SafeNoteStatus.SIGNED,
        }),
      },
      { transaction },
    );
  }

  async create(
    data: CreateSafeDto & { data?: SafeNoteData; safeAmount?: number },
    recipientId?: string,
    options?: TransactionOptions,
  ) {
    const { senderCompanyId, senderSignature, ...rest } = data;

    // Clear discount if a mfn is true
    if (data.mfn === true) {
      rest.discountRate = null;
      rest.valuationCap = null;
    }

    return this.txService.transaction(async (transaction) => {
      const safeNote = await this.safeNoteRepository.create(
        {
          senderCompanyId,
          recipientId,
          paymentId: rest.paymentId,
          status: data.draft ? SafeNoteStatus.DRAFT : SafeNoteStatus.SENT,
          ...rest,
        },
        { transaction },
      );

      if (senderSignature && safeNote?.id) {
        await this.addSignature(
          safeNote.id,
          senderSignature,
          {
            signAs: SignSafeAs.SENDER,
            name: data.senderSignName,
          },
          transaction,
        );
      }

      return safeNote;
    }, options?.transaction);
  }

  async update(safeNoteId: string, data: UpdateSafeDto) {
    return this.safeNoteRepository.updateById(safeNoteId, data);
  }

  async assignAngelCompany(safeNoteId: string, companyId: string) {
    return this.safeNoteRepository.updateById(safeNoteId, {
      recipientCompanyId: companyId,
    });
  }

  async declineSafeNote(safeNoteId: string) {
    return this.safeNoteRepository.updateById(safeNoteId, {
      status: SafeNoteStatus.DECLINED,
    });
  }

  async notifyToSign(id: string, reminderMessage?: string) {
    const safeNote = await this.getById(id);

    const payload: NotificationToSignEventPayload = {
      to: safeNote?.recipient?.email,
      safeNoteId: safeNote.id,
      userName: safeNote?.recipient?.fullName,
      requestBy: safeNote?.senderCompany?.owner?.fullName,
      isUserActive: safeNote?.recipient?.active,
      customMessage: reminderMessage,
    };

    this.eventEmitter.emit(SendEmailEvent.NOTIFICATION_TO_SIGN, payload);
  }

  @OnEvent(PaymentEvent.HANDLE_PAYMENT_SUCCESS)
  public async handlePaymentSuccess({
    payment,
    paymentIntent,
    reason,
  }: HandlePaymentSuccessEventPayload) {
    if (reason !== PaymentReason.SAFE_NOTE) return;

    const metadata = paymentIntent?.metadata as SafeNotePaymentMetadata;

    const safeNoteId = metadata?.safeNoteId;
    if (!safeNoteId) return;

    const safeNote = await this.getById(safeNoteId);

    if (safeNote) {
      await this.safeNoteRepository.updateById(safeNoteId, {
        paid: true,
        status: SafeNoteStatus.SIGNED,
        paymentId: payment.id,
      });
    }

    // Send email to entrepreneur, the one who give the safe to the angel
    if (metadata.payAs === PayAs.ANGEL) {
      const payload: InvestmentReceivedEmailPayload = {
        to: safeNote.senderCompany.owner.email,
        userName: safeNote.senderCompany.owner.fullName,
        amount: payment.amount,
        transactionId: payment.transactionId,
        paymentFrom: safeNote.recipient.fullName,
      };
      this.eventEmitter.emit(SendEmailEvent.INVESTMENT_RECEIVED, payload);

      this.eventEmitter.emit(SendNotificationEvent.PAYED_SAFE_NOTE, {
        userId: safeNote.senderCompany.owner.id,
        companyId: safeNote.senderCompanyId,
        payload: {
          safeNoteId: safeNote.id,
          senderImage: safeNote.recipient.image,
          senderName: safeNote.recipient.fullName,
          companyName: safeNote.senderCompany.name,
          companyImage: safeNote.senderCompany.image,
          amount: payment.amount,
        },
      } as PayedSafeNotificationDto);
    }
  }

  @OnEvent(PaymentEvent.HANDLE_PAYMENT_PENDING)
  public async handlePaymentPending({
    payment,
    paymentIntent,
    reason,
  }: HandlePaymentPendingEventPayload) {
    if (reason !== PaymentReason.SAFE_NOTE) return;

    const metadata = paymentIntent?.metadata as SafeNotePaymentMetadata;

    const safeNoteId = metadata?.safeNoteId;

    if (!safeNoteId) return;

    const safeNote = await this.getById(safeNoteId);

    if (safeNote) {
      await this.safeNoteRepository.updateById(safeNoteId, {
        paid: false,
        status: SafeNoteStatus.SIGNED,
        paymentId: payment.id,
      });
    }
  }

  @OnEvent(PaymentEvent.HANDLE_PAYMENT_FAILED)
  public async handlePaymentFailed({
    payment,
    reason,
  }: HandlePaymentFailedEventPayload) {
    if (reason !== PaymentReason.SAFE_NOTE) return;

    if (!payment) return;

    const safeNote = await this.getOne({
      where: { paymentId: payment.id },
    });

    if (safeNote) {
      await this.safeNoteRepository.updateById(safeNote.id, {
        paid: false,
        status: SafeNoteStatus.SIGNED,
        paymentId: null,
      });
    }

    this.logger.debug('Payment failed for safe note');

    // Send email about failed payment ???
  }

  @OnEvent(PaymentEvent.HANDLE_PAYMENT_REFUNDED)
  public async handlePaymentRefunded({
    payment,
    reason,
  }: HandlePaymentRefundEventPayload) {
    if (reason !== PaymentReason.SAFE_NOTE) return;

    if (!payment) return;

    const safeNote = await this.getOne({
      where: { paymentId: payment.id },
    });

    if (safeNote) {
      await this.safeNoteRepository.updateById(safeNote.id, {
        paid: false,
        status: SafeNoteStatus.SIGNED,
        paymentId: null,
      });

      this.logger.debug('Payment refunded for safe note');
    }

    // Send email about refunded payment ???
  }

  async share(
    id: string,
    sender: UserEntity,
    recipient: UserEntity,
    message?: string,
  ) {
    await this.mailService.sendShareSafeEmail({
      to: recipient.email,
      safeNoteId: id,
      userName: recipient.fullName,
      senderName: sender.fullName,
      senderPhoto: sender.image,
      message,
    });

    return null;
  }

  public async generatePdf(safeNote: SafeNoteEntity) {
    const terms = {
      valuationCap: safeNote.valuationCap,
      discountRate: safeNote.discountRate,
    };

    // if (safeNote.mfn) {
    //   const maxTerms = await this.safeNoteRepository.getMaxTerms(
    //     safeNote.senderCompanyId,
    //   );
    //
    //   terms.valuationCap = maxTerms.valuationCap;
    //   terms.discountRate = maxTerms.discountRate;
    // }

    const html = await minifyAndConvertTemplateToHtml(
      this.configService.getUrlConfig(),
      'safe-note',
      {
        safeNote: {
          ...safeNote.toJSON(),
          discountRate: !!terms.discountRate
            ? 100 - (terms.discountRate || 0)
            : null,
          valuationCap: terms.valuationCap,
        },
        valuationAndDiscount: !!(terms.valuationCap && terms.discountRate),
      },
    );

    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true,
      // ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setContent(html, {
      waitUntil: 'networkidle2',
    });

    const pdfBuffer = await page.pdf({
      format: 'a4',
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '20mm',
        right: '20mm',
      },
      printBackground: true,
    });

    await browser.close();

    return pdfBuffer;
  }
}
