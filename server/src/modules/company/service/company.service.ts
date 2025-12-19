import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as archiver from 'archiver';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as fs from 'fs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Sequelize } from 'sequelize-typescript';

import { AddressService } from '@/modules/address/address.service';
import { CreateAngelCompanyDto } from '@/modules/company/dto/create-angel-company.dto';
import { CreateEntrepreneurCompanyDto } from '@/modules/company/dto/create-entrepreneur-company.dto';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { VerificationStatus } from '@/modules/company/enums';
import { CompanyHelper } from '@/modules/company/helper/company.helper';
import { CompanyPaymentRepository } from '@/modules/company/repository/company-payment.repository';
import { CompanyUserRepository } from '@/modules/company/repository/company-user.repository';
import { CompanyRepository } from '@/modules/company/repository/company.repository';
import { CompanySummaryService } from '@/modules/company/service/company-summary.service';
import { UpdateCompanyDto } from '@/modules/company/types';
import { BaseServiceImpl } from '@/modules/database/base.service';
import { TxService } from '@/modules/database/tx.service';
import {
  IFindByIdOptions,
  IFindOptions,
  IUpdateByIdOptions,
  ServiceQueryOptions,
  Transaction,
  TransactionOptions,
} from '@/modules/database/types';
import { Logger } from '@/modules/logger/logger';
import { SendEmailEvent } from '@/modules/mail/constants';
import { RequestCompanyVerificationEmailPayload } from '@/modules/mail/types';
import { VERIFY_COMPANY_PRICE } from '@/modules/payment/constants';
import { CreatePaymentDto } from '@/modules/payment/dto/create-payment.dto';
import { PaymentEntity } from '@/modules/payment/entity/payment.entity';
import {
  PaymentEvent,
  PaymentReason,
  PaymentStatus,
} from '@/modules/payment/enums';
import { PaymentService } from '@/modules/payment/payment.service';
import {
  HandlePaymentSuccessEventPayload,
  PaymentMetadata,
} from '@/modules/payment/types';
import { SafeNoteService } from '@/modules/safe-note/service/safe-note.service';
import { SafeNotePaymentMetadata } from '@/modules/safe-note/types';
import { STORAGE_FOLDERS } from '@/modules/storage/constants';
import { StorageService } from '@/modules/storage/service/storage.service';
import { UserService } from '@/modules/user/user.service';
import { InviteStatus, Role } from '@/shared/enums';
import { ValidationFactory } from '@/shared/factories/validation.factory';
import { MulterFile } from '@/shared/types';

@Injectable()
export class CompanyService extends BaseServiceImpl<CompanyEntity> {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly sequelizeInstance: Sequelize,
    private readonly companyRepository: CompanyRepository,
    private readonly companyUserRepository: CompanyUserRepository,
    private readonly companyPaymentRepository: CompanyPaymentRepository,
    private readonly userService: UserService,
    private readonly safeNoteService: SafeNoteService,
    private readonly companySummaryService: CompanySummaryService,
    private readonly storageService: StorageService,
    private readonly companyHelper: CompanyHelper,
    private readonly addressService: AddressService,
    private readonly paymentService: PaymentService,
    private readonly txService: TxService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(companyRepository);
  }

  public async getAll(options?: IFindOptions) {
    return this.companyRepository.getAll(options);
  }

  public async getAllByUser(userId: string, options?: IFindOptions) {
    return this.companyRepository.getAllByUser(userId, options);
  }

  public async getByIdForUser(
    companyId: string,
    userId: string,
    options?: IFindByIdOptions,
  ) {
    return this.companyRepository.getByIdForUser(companyId, userId, {
      throwNotFound: true,
      ...options,
    });
  }

  public async getMfnHolders(companyId: string, options?: IFindByIdOptions) {
    return this.companyRepository.getMfnHolders(companyId, options);
  }

  public async saveCompanyImage(
    companyId: string,
    image: string | MulterFile,
    transaction?: Transaction,
  ) {
    if (!companyId || !image) return;

    if (typeof image === 'string') {
      await this.updateById(
        companyId,
        { image },
        {
          transaction,
        },
      );
      return;
    }

    const file = await this.storageService.saveCompanyFile({
      file: image,
      companyId,
      fileName: 'company-image',
    });

    await this.updateById(
      companyId,
      { image: file?.url },
      {
        transaction,
      },
    );
  }

  public async create(
    ownerId: string,
    dto: CreateAngelCompanyDto | CreateEntrepreneurCompanyDto,
    options?: TransactionOptions,
  ): Promise<CompanyEntity> {
    const {
      name,
      ownerPosition,
      goal,
      address: addressData,
      image,
      ...childCompanyData
    } = dto;

    return this.txService.transaction(async (transaction) => {
      const addressId = (
        await this.addressService.create(addressData, { transaction })
      )?.id;

      const parentCompany = await this.companyRepository.create(
        {
          name,
          goal,
          addressId,
        },
        { transaction },
      );

      const childCompanyRepository = this.companyHelper.getRepositoryForCompany(
        dto.type,
      );

      // child company
      await childCompanyRepository.create(
        {
          parentId: parentCompany.id,
          ...childCompanyData,
        },
        { transaction },
      );

      await this.companyUserRepository.create(
        {
          companyId: parentCompany.id,
          userId: ownerId,
          role: Role.OWNER,
          position: ownerPosition,
          inviteStatus: InviteStatus.ACCEPTED,
        },
        { transaction },
      );

      await this.userService.updateById(
        ownerId,
        {
          isOnboardingComplete: true,
        },
        { transaction },
      );

      await this.saveCompanyImage(parentCompany.id, image, transaction);

      return this.companyRepository.getByIdForUser(parentCompany.id, ownerId, {
        transaction,
      });
    }, options?.transaction);
  }

  public async deleteCompany(id: string) {
    const { summary } = await this.companySummaryService.getById(id);

    if (summary?.signedCount) {
      throw new BadRequestException('You cannot delete a non-empty company.');
    }

    return this.deleteById(id);
  }

  public async update(
    id: string,
    dto: UpdateCompanyDto,
    options?: IUpdateByIdOptions,
  ) {
    const company = await this.getById(id);

    const {
      name,
      goal,
      ownerPosition,
      address: addressData,
      image,
      ...childCompanyData
    } = dto;

    return this.txService.transaction(async (transaction) => {
      const address = await this.addressService.updateOrCreate(
        company.addressId,
        addressData,
        { transaction },
      );

      const childCompanyRepository = this.companyHelper.getRepositoryForCompany(
        company.type,
      );

      const parentCompany = await this.companyRepository.updateById(
        company.id,
        {
          name,
          goal,
          addressId: address?.id,
        },
        { transaction },
      );

      // child company
      await childCompanyRepository.update(childCompanyData, {
        transaction,
        where: { parentId: parentCompany.id },
      });

      await this.companyUserRepository.update(
        {
          companyId: company.id,
          position: ownerPosition,
        },
        {
          transaction,
          where: {
            companyId: company.id,
          },
        },
      );

      await this.saveCompanyImage(parentCompany.id, image, transaction);

      return this.companyRepository.getById(parentCompany.id, { transaction });
    }, options?.transaction);
  }

  public async pendingVerification(company: CompanyEntity, status?: string) {
    await this.companyRepository.updateById(company.id, {
      verificationStatus: status || VerificationStatus.PENDING,
    });

    const payload: RequestCompanyVerificationEmailPayload = {
      to: company.owner.email,
      companyName: company.name,
    };
    this.eventEmitter.emit(
      SendEmailEvent.REQUEST_COMPANY_VERIFICATION,
      payload,
    );
  }

  @OnEvent(PaymentEvent.HANDLE_PAYMENT_SUCCESS)
  public async handlePaymentSuccess({
    payment,
    paymentIntent,
    reason,
  }: HandlePaymentSuccessEventPayload) {
    if (reason !== PaymentReason.VERIFY_COMPANY) return;

    const metadata = paymentIntent?.metadata as SafeNotePaymentMetadata;

    const companyId = metadata?.companyId;
    if (!companyId) return;

    const company = await this.getById(companyId);

    return this.pendingVerification(company);
  }

  public async getPayments(companyId: string) {
    const company = await this.companyRepository.getById(companyId, {
      include: [PaymentEntity],
    });

    return company?.payments;
  }

  public async verifyCompany(
    companyId: string,
    userId: string,
    dto: CreatePaymentDto,
  ) {
    const company = await this.getById(companyId);
    const user = await this.userService.getUserByID(userId);
    if (user.activeSubscription) {
      await company.update({
        verificationEndAt: user.activeSubscription.endAt,
      });
    } else {
      try {
        const currentDate = new Date();
        if (
          !company.verificationEndAt ||
          company.verificationEndAt < currentDate
        ) {
          throw new NotAcceptableException('payment required');
        }

        const companyPayments = await this.companyPaymentRepository.getAll({
          where: { companyId: company.id },
          include: [PaymentEntity],
        });

        currentDate.setFullYear(currentDate.getFullYear() - 1);
        let free_verification = false;
        for (const companyPayment of companyPayments) {
          if (companyPayment.payment.status !== PaymentStatus.PAID) {
            continue;
          }

          if (companyPayment.payment.createdAt < currentDate) {
            continue;
          }

          free_verification = true;
          break;
        }

        if (!free_verification) {
          throw new NotAcceptableException('payment required');
        }
      } catch (e) {
        const errors = await validate(plainToInstance(CreatePaymentDto, dto), {
          whitelist: true,
        });

        if (errors.length) {
          throw new BadRequestException(
            ValidationFactory.flattenValidationErrors(errors),
          );
        }

        if (VERIFY_COMPANY_PRICE != dto.amount) {
          throw new BadRequestException('amount has wrong value');
        }

        const paymentIntent = await this.paymentService.createPaymentIntent(
          user,
          dto,
          {
            reason: PaymentReason.VERIFY_COMPANY,
            companyId: company.id,
          } as PaymentMetadata,
        );

        await this.companyPaymentRepository.create({
          paymentId: paymentIntent.payment.id,
          companyId: company.id,
        });

        const verificationEndAt = new Date();
        verificationEndAt.setFullYear(verificationEndAt.getFullYear() + 1);
        await company.update({
          verificationEndAt,
        });

        if (paymentIntent.payment.status !== PaymentStatus.PAID) {
          return paymentIntent;
        }
      }
    }

    return this.pendingVerification(company);
  }

  public async restoreById(id: string) {
    const repo = await this.companyRepository.getDeletedById(id, {
      throwNotFound: true,
    });

    await repo.restore();

    return this.getById(id);
  }

  public async getSafesFilesByCompany(
    company: CompanyEntity,
    safeNoteIds: string[],
  ) {
    const safeNotes = await this.safeNoteService.getAll({
      entrepreneurCompanyId: company.id,
    } as ServiceQueryOptions);

    const destination = join(STORAGE_FOLDERS[CompanyEntity.name], 'tmp');
    mkdirSync(destination, { recursive: true });

    for (const safeNote of safeNotes) {
      if (safeNoteIds && !safeNoteIds.includes(safeNote.id)) {
        continue;
      }
      const pdf = await this.safeNoteService.generatePdf(safeNote);
      writeFileSync(join(destination, `${safeNote.id}.pdf`), pdf);
    }

    return new Promise<Buffer>((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk) => {
        chunks.push(chunk);
      });

      archive.on('end', () => {
        fs.rmdir(destination, { recursive: true }, (error) => {
          if (error) {
            this.logger.error(`Error removing directory: ${error.message}`);
          }
        });
        resolve(Buffer.concat(chunks));
      });

      archive.on('error', (error) => {
        reject(error);
      });

      archive.directory(destination, false);
      archive.finalize();
    });
  }
}
