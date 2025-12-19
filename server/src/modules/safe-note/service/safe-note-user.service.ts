import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Sequelize } from 'sequelize-typescript';

import { CompanyType, VerificationStatus } from '@/modules/company/enums';
import { CompanyUserService } from '@/modules/company/service/company-user.service';
import { CompanyService } from '@/modules/company/service/company.service';
import { TxService } from '@/modules/database/tx.service';
import {
  IUpdateByIdOptions,
  TransactionOptions,
} from '@/modules/database/types';
import { SendEmailEvent } from '@/modules/mail/constants';
import { MailService } from '@/modules/mail/mail.service';
import {
  NewSafeEventPayload,
  SafeSentEventPayload,
  DeletedSafeNoteEventPayload,
} from '@/modules/mail/types';
import { SendNotificationEvent } from '@/modules/notification/constants';
import { IncomingSafeNotificationDto } from '@/modules/notification/dto/incoming-safe.dto';
import { CreateSafeByRecipientsDto } from '@/modules/safe-note/dto/create-safe-by-recipients.dto';
import { CreateSafeDto } from '@/modules/safe-note/dto/create-safe.dto';
import { ShareSafeDto } from '@/modules/safe-note/dto/share-safe.dto';
import { SignSafeDto } from '@/modules/safe-note/dto/sign-safe.dto';
import { UpdateDraftRecipientDto } from '@/modules/safe-note/dto/update-draft-recipient.dto';
import { UpdateSafeDto } from '@/modules/safe-note/dto/update-safe.dto';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import {
  SafeNoteEvents,
  SafeNoteStatus,
  SignSafeAs,
} from '@/modules/safe-note/enums';
import { SafeNoteRepository } from '@/modules/safe-note/repository/safe-note.repository';
import { SafeNoteService } from '@/modules/safe-note/service/safe-note.service';
import { UpdateSafeForMfnHoldersEventPayload } from '@/modules/safe-note/types';
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';
import { TermSheetService } from '@/modules/term-sheet/term-sheet.service';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { RawUser } from '@/modules/user/types';
import { UserService } from '@/modules/user/user.service';
import { UserUtils } from '@/modules/user/user.utils';
import { InviteStatus, Role } from '@/shared/enums';

@Injectable()
export class SafeNoteUserService {
  private readonly logger = new Logger(SafeNoteUserService.name);

  constructor(
    private readonly sequelizeInstance: Sequelize,
    private readonly userService: UserService,
    private readonly safeNoteService: SafeNoteService,
    private readonly eventEmitter: EventEmitter2,
    private readonly companyService: CompanyService,
    private readonly companyUserService: CompanyUserService,
    private readonly safeNoteRepository: SafeNoteRepository,
    private readonly termSheetService: TermSheetService,
    private readonly txService: TxService,
    private readonly mailService: MailService,
  ) {}

  public sendEmailNotificationToOwner(
    owner: UserEntity,
    recipients: SafeSentEventPayload['recipients'],
    safeNote: SafeNoteEntity,
  ) {
    const ownerEmailPayload: SafeSentEventPayload = {
      to: owner.email,
      recipientName: owner.fullName,
      recipients,
      safeNoteId: safeNote.id,
      discountRate: safeNote.discountRate,
      valuationCap: safeNote.valuationCap,
      isMfn: safeNote.mfn,
    };

    // send safe note email to sender
    this.eventEmitter.emit(SendEmailEvent.SAFE_SENT, ownerEmailPayload);
  }

  public sendEmailNotificationToRecipient(
    owner: UserEntity,
    recipient: UserEntity,
    safeNote: SafeNoteEntity,
    recipientSafeAmount: number,
  ) {
    const recipientEmailPayload: NewSafeEventPayload = {
      to: recipient.email,
      recipientName: recipient.fullName,
      safeSenderName: owner.fullName,
      safeAmount: recipientSafeAmount,
      safeNoteId: safeNote.id,
      isUserActive: recipient?.active,
      discountRate: safeNote.discountRate,
      valuationCap: safeNote.valuationCap,
      isMfn: safeNote.mfn,
      companyName: safeNote.senderCompany.name,
      companyLogo: safeNote.senderCompany.image,
      companyVerified:
        safeNote.senderCompany.verificationStatus ===
        VerificationStatus.VERIFIED,
    };

    // send safe note email to recipient
    this.eventEmitter.emit(SendEmailEvent.NEW_SAFE, recipientEmailPayload);
  }

  public sendNotificationToRecipient(
    owner: UserEntity,
    recipient: UserEntity,
    safeNote: SafeNoteEntity,
  ) {
    const notification: IncomingSafeNotificationDto = {
      userId: recipient.id,
      payload: {
        senderName: owner.fullName,
        senderImage: owner.image,
        safeNoteId: safeNote.id,
        companyName: safeNote.senderCompany.name,
        companyImage: safeNote.senderCompany.image,
      },
    };

    // send safe note notification to recipient
    this.eventEmitter.emit(
      SendNotificationEvent.INCOMING_SAFE_NOTE,
      notification,
    );
  }

  @OnEvent(SafeNoteEvents.UPDATE_SAFE_FOR_MFN_HOLDERS)
  public async updateSafeNotesForMfnHolders(
    payload: UpdateSafeForMfnHoldersEventPayload,
  ) {
    const company = await this.companyService.getById(payload.companyId, {
      throwNotFound: true,
    });

    const mfnHolders = await this.companyService.getMfnHolders(company.id);
    const maxTerms = await this.safeNoteRepository.getMaxTerms(company.id);

    // send email to mfn holders
    // no need to update all their safes, as it could be done with presenter
    // just checking which safe has mfn = true and update their terms with
    // max terms from
  }

  public async bindRecipientToCompany(
    companyId: string,
    userId: string,
    options?: TransactionOptions,
  ) {
    const isUserTiedToCompany =
      await this.companyUserService.getCompanyUserByRole(
        companyId,
        userId,
        Role.SAFE_RECIPIENT,
      );

    if (!isUserTiedToCompany) {
      await this.companyUserService.create(
        {
          companyId: companyId,
          userId,
          role: Role.SAFE_RECIPIENT,
          inviteStatus: InviteStatus.ACCEPTED,
        },
        { transaction: options.transaction },
      );
    }
  }

  public async create(user: RawUser, data: CreateSafeDto) {
    if (!user.emailVerified) {
      throw new BadRequestException(
        'Cannot create a safe until email is not verified',
      );
    }

    const company = await this.companyService.getById(data.senderCompanyId, {
      throwNotFound: true,
      toJson: true,
    });

    if (![CompanyType.ENTREPRENEUR, CompanyType.ANGEL].includes(company.type)) {
      throw new BadRequestException(
        'Only Entrepreneur and Angel can create a SAFE note',
      );
    }

    const owner = await this.userService.getById(company.owner.id);

    if (!owner.emailVerified) {
      throw new BadRequestException(
        'Cannot create a safe until owner email is not verified',
      );
    }

    if (data.draft) {
      const safeNote = await this.safeNoteService.create({
        ...data,
        ...(data?.recipients && {
          data: { recipients: data.recipients },
        }),
      });

      // update safes for mfn holder
      this.eventEmitter.emit(SafeNoteEvents.UPDATE_SAFE_FOR_MFN_HOLDERS, {
        companyId: company.id,
      } as UpdateSafeForMfnHoldersEventPayload);

      return safeNote;
    }

    return this.txService.transaction(async (transaction) => {
      const termSheetId = data?.termSheetId;

      const emailRecipients = [];

      let safeNote: SafeNoteEntity;
      for (const recipientDto of data.recipients) {
        data.termSheetId = termSheetId;
        if (data.termSheetId) {
          // check if term sheet exist
          const termSheet = await this.termSheetService.getById(
            data.termSheetId,
          );

          // ignore term sheet if safe recipient is not included in term sheet
          const isRecipientExistInTermSheet = termSheet.recipients.findIndex(
            (p) => p.user.email === recipientDto.email,
          );

          if (isRecipientExistInTermSheet === -1) {
            delete data.termSheetId;
          }
        }

        const recipient = await this.userService.getOrCreateOrUpdate(
          {
            email: recipientDto.email,
            fullName:
              recipientDto?.name ||
              UserUtils.extractNameFromEmail(recipientDto.email),
          },
          { transaction },
        );

        emailRecipients.push({
          name: recipient.fullName,
          email: recipient.email,
          amount: recipientDto.amount,
        });

        safeNote = await this.safeNoteService.create(
          {
            ...data,
            safeAmount: recipientDto.amount,
          },
          recipient.id,
          { transaction },
        );

        await this.bindRecipientToCompany(company.id, recipient.id, {
          transaction,
        });

        transaction.afterCommit(() => {
          try {
            console.log('sending email to recipient');
            this.sendEmailNotificationToRecipient(
              owner,
              recipient,
              safeNote,
              recipientDto.amount,
            );
          } catch (err) {
            this.logger.error(
              '[create] cannot sent email to recipient and owner',
              err.stack,
            );
          }

          try {
            this.sendNotificationToRecipient(owner, recipient, safeNote);
          } catch (err) {
            this.logger.error(
              '[create] cannot sent notification to recipient',
              err.stack,
            );
          }

          // update safes for mfn holder
          this.eventEmitter.emit(SafeNoteEvents.UPDATE_SAFE_FOR_MFN_HOLDERS, {
            companyId: company.id,
          } as UpdateSafeForMfnHoldersEventPayload);
        });
      }

      this.sendEmailNotificationToOwner(owner, emailRecipients, safeNote);
    });
  }

  public async createByRecipients(
    safeNote: SafeNoteEntity,
    user: RawUser,
    data: CreateSafeByRecipientsDto,
  ) {
    if (!user.emailVerified) {
      throw new BadRequestException(
        'Cannot create a safe until email is not verified',
      );
    }

    const company = await this.companyService.getById(
      safeNote.senderCompanyId,
      {
        throwNotFound: true,
        toJson: true,
      },
    );

    if (![CompanyType.ENTREPRENEUR, CompanyType.ANGEL].includes(company.type)) {
      throw new BadRequestException(
        'Only Entrepreneur and Angel can create a SAFE note',
      );
    }

    const owner = await this.userService.getById(company.owner.id);

    let termSheet: TermSheetEntity;
    if (safeNote.termSheetId) {
      // check if term sheet exist
      termSheet = await this.termSheetService.getById(safeNote.termSheetId);
    }

    const status = data.draft ? SafeNoteStatus.DRAFT : SafeNoteStatus.SENT;

    return this.txService.transaction(async (transaction) => {
      for (const recipientDto of data.recipients) {
        let termSheetId = safeNote.termSheetId;
        if (termSheet) {
          // ignore term sheet if safe recipient is not included in term sheet
          const isRecipientExistInTermSheet = termSheet.recipients.findIndex(
            (p) => p.user.email === recipientDto.email,
          );

          if (isRecipientExistInTermSheet === -1) {
            termSheetId = null;
          }
        }

        const recipient = await this.userService.getOrCreateOrUpdate(
          {
            email: recipientDto.email,
            fullName:
              recipientDto?.name ||
              UserUtils.extractNameFromEmail(recipientDto.email),
          },
          { transaction },
        );

        let newSafeNote: SafeNoteEntity;
        if (!safeNote.recipientId) {
          newSafeNote = await safeNote.update({
            recipientId: recipient.id,
            termSheetId,
            status,
            safeAmount: recipientDto.amount,
          });
        } else {
          newSafeNote = await this.safeNoteRepository.create(
            {
              recipientId: recipient.id,
              termSheetId,
              status,
              safeAmount: recipientDto.amount,
              senderCompanyId: safeNote.senderCompanyId,
              safeFor: safeNote.safeFor,
              discountRate: safeNote.discountRate,
              valuationCap: safeNote.valuationCap,
              mfn: safeNote.mfn,
              senderSignName: safeNote.senderSignName,
              senderSignature: safeNote.senderSignature,
              senderSignDate: safeNote.senderSignDate,
            },
            { transaction },
          );
        }

        await this.bindRecipientToCompany(company.id, recipient.id, {
          transaction,
        });

        transaction.afterCommit(() => {
          // no need to send emails if it is a draft safe
          if (newSafeNote.status === SafeNoteStatus.SENT) {
            try {
              this.sendEmailNotificationToOwner(
                owner,
                data.recipients,
                newSafeNote,
              );
              this.sendEmailNotificationToRecipient(
                owner,
                recipient,
                newSafeNote,
                recipientDto.amount,
              );
            } catch (err) {
              this.logger.error(
                '[create] cannot sent email to recipient and owner',
                err.stack,
              );
            }
          }

          // update safes for mfn holder
          this.eventEmitter.emit(SafeNoteEvents.UPDATE_SAFE_FOR_MFN_HOLDERS, {
            companyId: company.id,
          } as UpdateSafeForMfnHoldersEventPayload);
        });
      }
    });
  }

  public async update(safeNoteId: string, data: UpdateSafeDto) {
    const safeNote = await this.safeNoteService.getById(safeNoteId);
    const owner = await this.userService.getById(safeNote.sender.id);

    // mean user want to make draft the safe which was already sent
    if (data.draft && safeNote.status !== SafeNoteStatus.DRAFT) {
      throw new BadRequestException(
        'SAFE note was already sent. You cannot make it draft',
      );
    }

    const notDraftAnymore =
      !data.draft && safeNote.status === SafeNoteStatus.DRAFT;

    if (notDraftAnymore && !safeNote?.recipient?.id) {
      throw new BadRequestException(
        "The SAFE note can't be finalized without creating the recipient.",
      );
    }
    await this.safeNoteService.update(safeNote.id, {
      ...data,
      ...(notDraftAnymore && { status: SafeNoteStatus.SENT }),
    });

    if (notDraftAnymore) {
      const recipient = await this.userService.getById(safeNote.recipient.id);
      // send emails

      // TODO fix email when changing from draft
      // this.sendEmailNotificationToOwner(owner, recipient, safeNote);
      // this.sendEmailNotificationToRecipient(owner, recipient, safeNote);
    }

    return this.safeNoteService.getById(safeNote.id);
  }

  public async sign(
    currentUserId: string,
    safeNoteId: string,
    { signature: file, ...dto }: SignSafeDto,
  ) {
    const safeNote = await this.safeNoteService.getById(safeNoteId, {
      throwNotFound: true,
    });

    const isSender = safeNote.senderCompany.owner.id === currentUserId;
    const isRecipient = safeNote.recipientId === currentUserId;

    const signAsSender = dto.signAs === SignSafeAs.SENDER;
    const signAsRecipient = dto.signAs === SignSafeAs.RECIPIENT;

    // disable signing for the other side or not for sender/recipient
    if (
      (!isSender && !isRecipient) ||
      (isSender && signAsRecipient) ||
      (isRecipient && signAsSender)
    ) {
      throw new ForbiddenException();
    }

    return this.safeNoteService.addSignature(safeNote.id, file, dto);
  }

  public async share(senderId: string, safeNoteId: string, data: ShareSafeDto) {
    const sender = await this.userService.getById(senderId);

    const target = await this.userService.getOrCreateOrUpdate({
      email: data.recipientEmail,
      fullName: data?.recipientName,
    });

    return this.safeNoteService.share(safeNoteId, sender, target, data.message);
  }

  public async deleteSafe(
    userId: string,
    safeNoteId: string,
    customMessage?: string,
  ) {
    const safeNote = await this.safeNoteService.getById(safeNoteId, {
      throwNotFound: true,
    });

    if (safeNote.status === SafeNoteStatus.DRAFT) {
      return await this.safeNoteService.deleteById(safeNoteId);
    }

    const sender = await this.userService.getById(userId, {
      throwNotFound: true,
    });

    const recipientEmailPayload: DeletedSafeNoteEventPayload = {
      userName: sender.fullName,
      userImg: sender.image,
      companyName: safeNote.senderCompany.name,
      companyImg: safeNote.senderCompany.image,
      amount: safeNote.safeAmount,
      discountRate: safeNote.discountRate,
      isMfn: safeNote.mfn,
      valuationCap: safeNote.valuationCap,
      customMessage,
      companyVerified:
        safeNote.senderCompany.verificationStatus ===
        VerificationStatus.VERIFIED,
      deleteDate: new Date(),
      to: safeNote.recipient.email,
    };

    await this.safeNoteService.deleteById(safeNoteId);

    return this.eventEmitter.emit(
      SendEmailEvent.DELETE_SAFE,
      recipientEmailPayload,
    );
  }

  public async updateDraftRecipient(
    { userId, fullName, email, safeId }: UpdateDraftRecipientDto,
    options?: IUpdateByIdOptions,
  ): Promise<{
    owner: UserEntity;
    recipient: UserEntity;
    safeNote: SafeNoteEntity;
    recipientSafeAmount: number;
  }> {
    const user = await this.userService.getById(userId);

    if (user.active || user.emailVerified) {
      throw new ForbiddenException('You cannot change active user data');
    }

    if (user.email === email) {
      throw new ForbiddenException('You cannot change to your email');
    }

    return this.txService.transaction(async (transaction) => {
      const candidate = await this.userService.getByEmail(email);

      let newRecipient: UserEntity;

      if (candidate) {
        newRecipient = candidate;
      } else {
        newRecipient = await this.userService.create({ email, fullName });
      }

      const safeNote = await this.safeNoteRepository.updateById(safeId, {
        recipientId: newRecipient.id,
        transaction,
      });

      await this.bindRecipientToCompany(
        safeNote.senderCompanyId,
        newRecipient.id,
        { transaction },
      );

      const owner = await this.userService.getById(safeNote.sender.id);

      this.sendEmailNotificationToRecipient(
        owner,
        newRecipient,
        safeNote,
        safeNote.safeAmount,
      );

      return newRecipient;
    }, options?.transaction);
  }
}
