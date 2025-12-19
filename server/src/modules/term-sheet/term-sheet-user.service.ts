import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CompanyType } from '@/modules/company/enums';
import { CompanyUserService } from '@/modules/company/service/company-user.service';
import { CompanyService } from '@/modules/company/service/company.service';
import { TxService } from '@/modules/database/tx.service';
import { IUpdateByIdOptions, Transaction } from '@/modules/database/types';
import { SendEmailEvent } from '@/modules/mail/constants';
import {
  NewTermSheetEmailPayload,
  SignedTermSheetEventPayload,
} from '@/modules/mail/types';
import { CreateTermSheetDto } from '@/modules/term-sheet/dto/create-term-sheet.dto';
import { UpdateTermSheetUserDto } from '@/modules/term-sheet/dto/update-term-sheet-user.dto';
import { TermSheetUserRepository } from '@/modules/term-sheet/repository/term-sheet-user.repository';
import { TermSheetService } from '@/modules/term-sheet/term-sheet.service';
import { UserService } from '@/modules/user/user.service';
import { UserUtils } from '@/modules/user/user.utils';
import { InviteStatus, Role } from '@/shared/enums';
import { TermSheetStatus } from '@/modules/term-sheet/enums';
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { camelCaseToDashCase } from '@/shared/utils';
import { SignTermSheetDto } from '@/modules/term-sheet/dto/sign-term-sheet.dto';
import { StorageService } from '@/modules/storage/service/storage.service';
import { AngelCompanyEntity } from '@/modules/company/entity/angel-company.entity';
import { EntrepreneurCompanyEntity } from '@/modules/company/entity/entrepreneur-company.entity';
import { CompanyUserEntity } from '@/modules/company/entity/company-user.entity';
import { SHARED_USER_ATTRIBUTES } from '@/modules/user/attributes';

@Injectable()
export class TermSheetUserService {
  constructor(
    private readonly userService: UserService,
    private readonly txService: TxService,
    private readonly termSheetService: TermSheetService,
    private readonly companyUserService: CompanyUserService,
    private readonly companyService: CompanyService,
    private readonly eventEmitter: EventEmitter2,
    private readonly termSheetUserRepository: TermSheetUserRepository,
    private readonly storageService: StorageService,
  ) {}

  private async bindRecipientToCompany(
    companyId: string,
    userId: string,
    transaction: Transaction,
  ) {
    const isUserTiedToCompany =
      await this.companyUserService.getCompanyUserByRole(
        companyId,
        userId,
        Role.TERM_SHEET_RECIPIENT,
      );

    if (!isUserTiedToCompany) {
      await this.companyUserService.create(
        {
          companyId: companyId,
          userId,
          role: Role.TERM_SHEET_RECIPIENT,
          inviteStatus: InviteStatus.ACCEPTED,
        },
        { transaction },
      );
    }
  }

  public async createTermSheet(creatorId: string, data: CreateTermSheetDto) {
    return this.txService.transaction(async (transaction) => {
      const { recipients, ...restData } = data;

      const company = await this.companyService.getById(data.senderCompanyId, {
        toJson: true,
      });

      const termSheet = await this.termSheetService.create(restData);

      for (const email of recipients) {
        const recipient = await this.userService.getByEmailOrCreate(
          {
            email: email,
            fullName: UserUtils.extractNameFromEmail(email),
          },
          { transaction },
        );

        await this.termSheetUserRepository.create(
          {
            userId: recipient.id,
            termSheetId: termSheet.id,
          },
          { transaction },
        );

        await this.bindRecipientToCompany(
          data.senderCompanyId,
          recipient.id,
          transaction,
        );

        // send email about new term sheet to recipient
        this.eventEmitter.emit(SendEmailEvent.NEW_TERM_SHEET, {
          to: email,
          recipientName: UserUtils.extractNameFromEmail(email),
          mfn: termSheet.mfn,
          valuationCap: termSheet.valuationCap,
          discountRate: termSheet.discountRate,
          company: company.name,
          senderName: company.owner.fullName,
          roundAmount: termSheet.roundAmount,
        } as NewTermSheetEmailPayload);
      }

      return this.termSheetService.getById(termSheet.id, { transaction });
    });
  }

  public async update(
    termSheetId: string,
    userId: string,
    dto: UpdateTermSheetUserDto,
    options?: IUpdateByIdOptions,
  ) {
    await this.termSheetService.isExist(termSheetId);

    if (dto.companyId) {
      const company = await this.companyService.getById(dto.companyId, {
        toJson: true,
      });

      if (company?.type !== CompanyType.ANGEL) {
        throw new BadRequestException(
          `Invalid company type: <${company.type}>. Term Sheet can only be assigned with <${CompanyType.ANGEL}> company`,
        );
      }
    }

    const result = await this.termSheetUserRepository.update(
      {
        ...dto,
        userCompanyId: dto.companyId,
      },
      {
        ...options,
        where: {
          termSheetId,
          userId,
        },
        throwNotFound: true,
      },
    );

    return this.termSheetUserRepository.getById(result.id);
  }

  public async delete(termSheetId: string, userId: string) {
    await this.termSheetUserRepository.delete({
      where: {
        termSheetId,
        userId,
      },
      throwNotFound: true,
    });
  }

  public async sendReminder(termSheetId: string, userId: string) {
    const termSheetUser = await this.termSheetUserRepository.getOne({
      include: [TermSheetEntity, UserEntity],
      where: {
        termSheetId,
        userId,
      },
      throwNotFound: true,
    });

    if (termSheetUser.status !== TermSheetStatus.PENDING) {
      throw new ForbiddenException('You can not send reminder');
    }

    const termSheet = termSheetUser.termSheet;
    const user = termSheetUser.user;

    const company = await this.companyService.getById(
      termSheet.senderCompanyId,
      {
        toJson: true,
      },
    );

    // send email about new term sheet to recipient
    return this.eventEmitter.emit(SendEmailEvent.NEW_TERM_SHEET, {
      to: user.email,
      recipientName: UserUtils.extractNameFromEmail(user.email),
      mfn: termSheet.mfn,
      valuationCap: termSheet.valuationCap,
      discountRate: termSheet.discountRate,
      company: company.name,
      senderName: company.owner.fullName,
      roundAmount: termSheet.roundAmount,
    } as NewTermSheetEmailPayload);
  }

  public async changeRecipient(
    termSheetId: string,
    userId: string,
    email: string,
  ) {
    const termSheetUser = await this.termSheetUserRepository.getOne({
      include: [TermSheetEntity, UserEntity],
      where: {
        termSheetId,
        userId,
      },
      throwNotFound: true,
    });

    const user = termSheetUser.user;

    if (
      termSheetUser.status !== TermSheetStatus.PENDING ||
      user.email === email
    ) {
      throw new ForbiddenException('You can not change email');
    }

    const termSheet = termSheetUser.termSheet;

    const company = await this.companyService.getById(
      termSheet.senderCompanyId,
      {
        toJson: true,
      },
    );

    return this.txService.transaction(async (transaction) => {
      const recipient = await this.userService.getByEmailOrCreate(
        {
          email: email,
          fullName: UserUtils.extractNameFromEmail(email),
        },
        { transaction },
      );

      await termSheetUser.update({ userId: recipient.id }, { transaction });

      await this.bindRecipientToCompany(
        termSheet.senderCompanyId,
        recipient.id,
        transaction,
      );

      // send email about new term sheet to recipient
      this.eventEmitter.emit(SendEmailEvent.NEW_TERM_SHEET, {
        to: email,
        recipientName: UserUtils.extractNameFromEmail(email),
        mfn: termSheet.mfn,
        valuationCap: termSheet.valuationCap,
        discountRate: termSheet.discountRate,
        company: company.name,
        senderName: company.owner.fullName,
        roundAmount: termSheet.roundAmount,
      } as NewTermSheetEmailPayload);

      return this.termSheetUserRepository.getById(termSheetUser.id, {
        include: [UserEntity, CompanyEntity],
        transaction,
      });
    });
  }

  async addSignature(
    termSheetId: string,
    userId: string,
    dto: SignTermSheetDto,
    transaction?: Transaction,
  ) {
    const termSheetUser = await this.termSheetUserRepository.getOne({
      include: [
        {
          model: TermSheetEntity,
          include: [
            {
              model: CompanyEntity,
              as: 'senderCompany',
              include: [
                AngelCompanyEntity,
                EntrepreneurCompanyEntity,
                {
                  model: CompanyUserEntity,
                  as: 'companyUsers',
                  include: [
                    {
                      model: UserEntity,
                      attributes: SHARED_USER_ATTRIBUTES,
                    },
                  ],
                },
              ],
              where: {
                deletedAt: null,
              },
            },
          ],
        },
        UserEntity,
      ],
      where: {
        termSheetId,
        userId,
      },
      throwNotFound: true,
      transaction,
    });

    if (!!termSheetUser.signature) {
      throw new BadRequestException('Term Sheet already signed!');
    }

    const signature = await this.storageService.saveTermSheetFile({
      file: dto.signature,
      fileName: camelCaseToDashCase(`signature-${userId}`),
      termSheetId,
    });

    if (signature) {
      this.eventEmitter.emit(SendEmailEvent.SIGNED_TERM_SHEET, {
        termSheetId,
        to: termSheetUser.termSheet.senderCompany.owner.email,
        userName: termSheetUser.termSheet.senderCompany.owner.fullName,
      } as SignedTermSheetEventPayload);
    }

    return await this.termSheetUserRepository.update(
      {
        signature: signature.url,
        sign_name: dto.name,
        sign_date: new Date(),
      },
      {
        where: {
          termSheetId,
          userId,
        },
        throwNotFound: true,
        transaction,
      },
    );
  }
}
