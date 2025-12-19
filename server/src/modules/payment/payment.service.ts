import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as puppeteer from 'puppeteer';
import { Sequelize } from 'sequelize-typescript';
import Stripe from 'stripe';

import { ICreateOptions, IFindByIdOptions } from '@/modules/database/types';
import { Logger } from '@/modules/logger/logger';
import { SendEmailEvent } from '@/modules/mail/constants';
import { PaymentSuccessEventPayload } from '@/modules/mail/types';
import { CreatePaymentDto } from '@/modules/payment/dto/create-payment.dto';
import { CreateReceiptDto } from '@/modules/payment/dto/create-receipt.dto';
import { PaymentEntity } from '@/modules/payment/entity/payment.entity';
import {
  PaymentProvider,
  PaymentReason,
  PaymentStatus,
} from '@/modules/payment/enums';
import { PaymentRepository } from '@/modules/payment/repository/payment.repository';
import { TransferDto } from '@/modules/plaid/dto/transfer.dto';
import { PlaidService } from '@/modules/plaid/plaid.service';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import { PayAs } from '@/modules/safe-note/enums';
import { SafeNoteUtils } from '@/modules/safe-note/safe-note.utils';
import { SafeNoteService } from '@/modules/safe-note/service/safe-note.service';
import { SafeNotePaymentMetadata } from '@/modules/safe-note/types';
import { StripeService } from '@/modules/stripe/stripe.service';
import { RawUser } from '@/modules/user/types';

import { PaymentEvent } from './enums';
import { PaymentUtils } from './payment.utils';
import {
  HandlePaymentSuccessEventPayload,
  InternalPaymentMetadata,
  PaymentMetadata,
} from './types';

@Injectable()
export class PaymentService {
  private logger: Logger = new Logger(PaymentService.name);

  constructor(
    private readonly sequelizeInstance: Sequelize,
    private readonly paymentRepository: PaymentRepository,
    private readonly stripeService: StripeService,
    private readonly plaidService: PlaidService,
    private readonly safeNoteService: SafeNoteService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async getByPaymentIntentId(
    intentId: string,
    options?: IFindByIdOptions,
  ) {
    return this.paymentRepository.getByPaymentIntent(intentId, options);
  }

  public async create(model: any, options?: ICreateOptions) {
    return await this.paymentRepository.create(model, options);
  }

  public async getById(id: string, options?: IFindByIdOptions) {
    return this.paymentRepository.getById(id, {
      throwNotFound: true,
      ...options,
    });
  }

  private async _createPaymentIntent(
    user: RawUser,
    amount: number,
    paymentMethod: Stripe.PaymentMethod,
    metadata?: PaymentMetadata,
    confirm?: boolean,
  ) {
    const transaction = await this.sequelizeInstance.transaction();
    let customer = await this.stripeService.getCustomerByEmail(user.email);

    if (!customer?.id) {
      customer = await this.stripeService.createCustomer({
        email: user.email,
        name: user.fullName,
      });
    } else if (customer.name != user.fullName) {
      this.stripeService.updateCustomer(customer.id, {
        name: user.fullName,
      });
    }

    try {
      let payment = await this.paymentRepository.create(
        {
          transactionId: PaymentUtils.getTransactionId(),
          amount,
          status: PaymentStatus.CREATED,
          paymentMethodType: paymentMethod.type,
          paymentMethodId: paymentMethod.id,
          provider: PaymentProvider.STRIPE,
        },
        { transaction },
      );

      const paymentIntent = await this.stripeService.createPaymentIntent({
        amount: PaymentUtils.convertToStripeAmount(amount),
        paymentMethodId: paymentMethod.id,
        customerId: customer.id,
        customerEmail: customer.email,
        confirm,
        metadata: {
          ...metadata,
          paymentId: payment.id,
          reason: metadata.reason || PaymentReason.UNKNOWN,
          paymentFor: metadata.paymentFor || 'User',
        } as InternalPaymentMetadata,
      });

      payment = await this.paymentRepository.updateById(
        payment.id,
        {
          paymentIntentId: paymentIntent.id,
        },
        { transaction },
      );

      await transaction.commit();

      return {
        clientSecret: paymentIntent.client_secret,
        payment,
      };
    } catch (err) {
      await transaction.rollback();
      this.logger.error('[createPaymentIntent]', err.stack);
      throw new BadRequestException('Cannot create payment intent');
    }
  }

  public async createPaymentIntent(
    user: RawUser,
    dto: CreatePaymentDto,
    metadata: PaymentMetadata,
  ) {
    const paymentMethod = await this.stripeService.createPaymentMethod(dto);

    return this._createPaymentIntent(
      user,
      dto.amount,
      paymentMethod,
      metadata,
      dto?.confirm,
    );
  }

  private async sendPaymentCompleteEmail(
    paymentIntent: Stripe.PaymentIntent | Stripe.Charge,
    payment: PaymentEntity,
  ) {
    const metadata = paymentIntent.metadata as PaymentMetadata;

    const customer = await this.stripeService.getCustomerById(
      paymentIntent.customer as string,
    );

    // Send payment completed email
    if (customer?.email) {
      const payload: PaymentSuccessEventPayload = {
        to: customer.email,
        userName: customer.name || 'User',
        paymentFor: metadata.paymentFor || 'User',
        amount: PaymentUtils.convertFromStripeAmount(paymentIntent.amount),
        paymentId: payment.id,
      };
      this.eventEmitter.emit(SendEmailEvent.PAYMENT_SUCCESS, payload);
    } else {
      this.logger.error(
        `[updatePaymentByPaymentIntent]: cannot send email to non-exist customer.`,
        { customer },
      );
    }
  }

  public async updatePaymentByPaymentIntent(
    paymentIntent: Stripe.PaymentIntent | Stripe.Charge,
  ) {
    if (!paymentIntent?.id) return;

    let status = PaymentUtils.mapStatusToPaymentStatus(paymentIntent.status);
    const metadata = paymentIntent.metadata as PaymentMetadata & {
      paymentId: string;
    };

    let payment: PaymentEntity = await this.paymentRepository.getById(
      metadata.paymentId,
    );

    if (!payment) return;

    const prevPaymentStatus = payment.status;
    if (
      prevPaymentStatus !== status &&
      status === PaymentStatus.PENDING &&
      prevPaymentStatus !== PaymentStatus.CREATED
    ) {
      status = prevPaymentStatus;
    }

    // update payment status and receipt url
    payment = await this.paymentRepository.updateById(payment.id, {
      ...((paymentIntent as Stripe.Charge)?.receipt_url && {
        receiptUrl: (paymentIntent as Stripe.Charge)?.receipt_url,
      }),
      status,
    });

    if (
      prevPaymentStatus !== PaymentStatus.PAID &&
      prevPaymentStatus !== payment.status &&
      status === PaymentStatus.PAID
    ) {
      await this.sendPaymentCompleteEmail(paymentIntent, payment);

      this.eventEmitter.emit(PaymentEvent.HANDLE_PAYMENT_SUCCESS, {
        reason: metadata.reason,
        payment,
        paymentIntent,
      } as HandlePaymentSuccessEventPayload);
    }
  }

  public async convertReceiptToPdf(paymentId: string): Promise<Buffer> {
    const payment: PaymentEntity = await this.paymentRepository.getById(
      paymentId,
      {
        throwNotFound: true,
      },
    );

    if (!payment.receiptUrl) {
      throw new NotFoundException('Invoice not ready yet');
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(payment.receiptUrl, { waitUntil: 'networkidle0' }); //networkidle2
    const pdfBuffer = await page.pdf();
    await browser.close();

    return pdfBuffer;
  }

  public async processPaymentByProvider(
    provider: PaymentProvider,
    user: RawUser,
    safeNote: SafeNoteEntity,
    dto: CreatePaymentDto | TransferDto | CreateReceiptDto,
    payAs: PayAs = PayAs.ENTREPRENEUR,
  ) {
    if (safeNote.paid) {
      throw new BadRequestException('Safe note has already been paid!');
    }

    if (safeNote.paymentId) {
      throw new BadRequestException(
        'Safe note has already payment in progress!',
      );
    }

    dto.amount = safeNote.safeAmount;

    const userFor =
      payAs === PayAs.ENTREPRENEUR
        ? safeNote?.recipient
        : safeNote?.senderCompany?.owner;

    const metadata: SafeNotePaymentMetadata = {
      paymentFor: userFor?.fullName,
      reason: PaymentReason.SAFE_NOTE,
      safeNoteId: safeNote.id,
      payAs: payAs || PayAs.ENTREPRENEUR,
    };

    switch (provider) {
      case PaymentProvider.PLAID:
        const plaidTransfer = await this.plaidService.createTransfer(
          user.id,
          userFor.id,
          dto as TransferDto,
          metadata,
        );

        const payment = await this.paymentRepository.create({
          transactionId: plaidTransfer.id,
          amount: plaidTransfer.amount,
          status: PaymentUtils.mapStatusToPaymentStatus(plaidTransfer.status),
          paymentMethodType: 'account',
          paymentMethodId: plaidTransfer.account_id,
          provider: PaymentProvider.PLAID,
        });

        this.eventEmitter.emit(PaymentEvent.HANDLE_PAYMENT_SUCCESS, {
          payment,
          reason: PaymentReason.SAFE_NOTE,
          paymentIntent: { metadata },
        });

        return {
          payment,
          clientSecret: null,
        };

      case PaymentProvider.STRIPE:
        const fee =
          PaymentUtils.calculateStripeFee(dto.amount) +
          SafeNoteUtils.calculatePlatformFee(dto.amount);

        dto.amount = dto.amount + fee;
        return this.createPaymentIntent(
          user,
          dto as CreatePaymentDto,
          metadata,
        );

      case PaymentProvider.RECEIPT:
        const receipt = await this.paymentRepository.create({
          amount: dto.amount,
          status: PaymentStatus.PENDING,
          provider: PaymentProvider.RECEIPT,
        });

        this.eventEmitter.emit(PaymentEvent.HANDLE_PAYMENT_PENDING, {
          payment: receipt,
          reason: PaymentReason.SAFE_NOTE,
          paymentIntent: { metadata },
        });

        return {
          payment: receipt,
          clientSecret: null,
        };
      default:
        throw new BadRequestException('Invalid payment provider');
    }
  }

  public async markPaymentAsPaid(safeNote: SafeNoteEntity) {
    if (safeNote.paid) {
      throw new BadRequestException('Safe note has already been paid!');
    }

    if (!safeNote.paymentId) {
      throw new BadRequestException('Safe don`t have payment!');
    }

    const payment = await this.paymentRepository.updateById(
      safeNote.paymentId,
      { status: PaymentStatus.PAID },
    );

    const metadata: SafeNotePaymentMetadata = {
      paymentFor: safeNote.senderCompany.owner.fullName,
      reason: PaymentReason.SAFE_NOTE,
      safeNoteId: safeNote.id,
      payAs: PayAs.ANGEL,
    };

    this.eventEmitter.emit(PaymentEvent.HANDLE_PAYMENT_SUCCESS, {
      payment,
      reason: PaymentReason.SAFE_NOTE,
      paymentIntent: { metadata },
    });
  }

  public async handleFailedPayment(transactionId: string) {
    const payment = await this.paymentRepository.getOne({
      where: {
        transactionId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Payment is already paid');
    }

    await this.paymentRepository.updateById(payment.id, {
      status: PaymentStatus.CANCELED,
    });

    this.eventEmitter.emit(PaymentEvent.HANDLE_PAYMENT_FAILED, {
      payment,
      reason: PaymentReason.SAFE_NOTE,
    });
  }

  public async handleRefundPayment(transactionId: string) {
    const payment = await this.paymentRepository.getOne({
      where: {
        transactionId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException(
        'Payment is not paid yet, nothing to refund',
      );
    }

    await this.paymentRepository.updateById(payment.id, {
      status: PaymentStatus.CANCELED,
    });

    this.eventEmitter.emit(PaymentEvent.HANDLE_PAYMENT_REFUNDED, {
      payment,
      reason: PaymentReason.SAFE_NOTE,
    });
  }
}
