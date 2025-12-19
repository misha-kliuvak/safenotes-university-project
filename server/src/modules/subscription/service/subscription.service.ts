import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { BaseServiceImpl } from '@/modules/database/base.service';
import { IUpdateByIdOptions } from '@/modules/database/types';
import { SubscriptionRepository } from '@/modules/subscription/repository/subscription.repository';
import { SubscriptionEntity } from '@/modules/subscription/entity/subscription.entity';
import { UserService } from '@/modules/user/user.service';
import { StripeService } from '@/modules/stripe/stripe.service';
import {
  SubscriptionPeriod,
  SubscriptionStatus,
} from '@/modules/subscription/enums';
import { SUBSCRIBE_PRICES } from '@/modules/subscription/constants';
import Stripe from 'stripe';
import { PaymentUtils } from '@/modules/payment/payment.utils';
import { CreatePaymentDto } from '@/modules/payment/dto/create-payment.dto';
import { PaymentReason, PaymentStatus } from '@/modules/payment/enums';
import { PaymentMetadata } from '@/modules/payment/types';
import { PaymentService } from '@/modules/payment/payment.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Op } from 'sequelize';

@Injectable()
export class SubscriptionService extends BaseServiceImpl<SubscriptionEntity> {
  constructor(
    private readonly sequelizeInstance: Sequelize,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly userService: UserService,
    private readonly stripeService: StripeService,
    private readonly paymentService: PaymentService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(subscriptionRepository);
  }

  async createSubscription(
    userId: string,
    period: SubscriptionPeriod,
    dto: CreatePaymentDto,
    options?: IUpdateByIdOptions,
  ) {
    const activeSubscription =
      await this.subscriptionRepository.getActiveByUserId(userId);
    if (activeSubscription) {
      throw new BadRequestException(
        'The user already has an active subscription!',
      );
    }

    if (!SUBSCRIBE_PRICES[period] || SUBSCRIBE_PRICES[period] != dto.amount) {
      throw new BadRequestException('Wrong amount for selected subscription');
    }

    const user = await this.userService.getUserByID(userId);
    const paymentMethod = await this.stripeService.createPaymentMethod(dto);

    let stripeCustomer: Stripe.Customer;
    try {
      stripeCustomer = await this.stripeService.getCustomerByEmail(user.email);
      if (!stripeCustomer) {
        throw new NotFoundException('not found');
      }
      await this.stripeService.paymentMethodAttach(
        paymentMethod.id,
        stripeCustomer.id,
      );
    } catch (e) {
      stripeCustomer = await this.stripeService.createCustomer({
        email: user.email,
        name: user.fullName,
        payment_method: paymentMethod.id,
      });
    }

    let price: Stripe.Price;
    const productName = `MySAFEnotes+ ${period}`;

    try {
      const prices = await this.stripeService.searchPrice({
        query: `product:"${productName}"`,
      });

      if (!prices?.data?.length) {
        throw new NotFoundException('not found');
      }

      price = prices.data.shift();
    } catch (e) {
      price = await this.stripeService.createPrice({
        currency: 'usd',
        unit_amount: PaymentUtils.convertToStripeAmount(
          SUBSCRIBE_PRICES[period],
        ),
        recurring: {
          interval: period,
        },
        product_data: {
          name: productName,
        },
      });
    }

    const stripeSubscription = await this.stripeService.createSubscription(
      stripeCustomer.id,
      price.id,
      paymentMethod.id,
      {
        reason: PaymentReason.SUBSCRIPTION,
        userId: user.id,
      } as PaymentMetadata,
      ['latest_invoice.payment_intent'],
    );
    const invoice = stripeSubscription.latest_invoice as Stripe.Invoice & {
      payment_intent: Stripe.PaymentIntent;
    };

    const subscription = await this.subscriptionRepository.create({
      userId: user.id,
      stripeLatestInvoiceId: invoice.id,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      startAt: new Date(stripeSubscription.current_period_start * 1000),
      endAt: new Date(stripeSubscription.current_period_end * 1000),
    });

    return {
      clientSecret: invoice.payment_intent.client_secret,
      subscription,
    };
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.subscriptionRepository.getById(
      subscriptionId,
      { throwNotFound: true },
    );

    await this.stripeService.cancelSubscription(
      subscription.stripeSubscriptionId,
    );

    subscription.status = SubscriptionStatus.CANCELED;
    await subscription.save();

    return subscription;
  }

  async upgradeSubscription(
    subscriptionId: string,
    period: SubscriptionPeriod,
  ) {
    const subscription = await this.subscriptionRepository.getById(
      subscriptionId,
      { throwNotFound: true },
    );

    let price: Stripe.Price;
    const productName = `MySAFEnotes+ ${period}`;

    try {
      const prices = await this.stripeService.searchPrice({
        query: `product:"${productName}"`,
      });

      if (!prices?.data?.length) {
        throw new NotFoundException('not found');
      }

      price = prices.data.shift();
    } catch (e) {
      price = await this.stripeService.createPrice({
        currency: 'usd',
        unit_amount: PaymentUtils.convertToStripeAmount(
          SUBSCRIBE_PRICES[period],
        ),
        recurring: {
          interval: period,
        },
        product_data: {
          name: productName,
        },
      });
    }

    const updatedSubscription = await this.stripeService.updateSubscription(
      subscription.stripeSubscriptionId,
      price.id,
    );

    await subscription.update({
      status: updatedSubscription.status,
      startAt: new Date(updatedSubscription.current_period_start * 1000),
      endAt: new Date(updatedSubscription.current_period_end * 1000),
    });

    return subscription;
  }

  public async updateSubscriptionByInvoice(invoice: Stripe.Invoice) {
    if (!invoice?.id) return;

    let status = PaymentUtils.mapStatusToPaymentStatus(invoice.status);
    const metadata = invoice.subscription_details.metadata as PaymentMetadata;

    let subscription =
      await this.subscriptionRepository.getByStripeSubscriptionId(
        (invoice?.subscription as Stripe.Subscription)?.id ||
          (invoice?.subscription as string),
      );

    if (!subscription) return;

    const stripeSubscription = await this.stripeService.getSubscription(
      subscription.stripeSubscriptionId,
    );

    await subscription.update({
      status: stripeSubscription.status,
      latestInvoice: stripeSubscription.latest_invoice,
      startAt: new Date(stripeSubscription.current_period_start * 1000),
      endAt: new Date(stripeSubscription.current_period_end * 1000),
    });

    if (status === PaymentStatus.PAID) {
      //todo email for subscription
      // await this.sendPaymentCompleteEmail(invoice, payment);
    }
  }

  async getAllByUserId(userId: string) {
    return this.subscriptionRepository.getAll({
      where: { userId },
    });
  }

  async getActiveByUserId(userId: string) {
    const currentDate = new Date();
    return this.subscriptionRepository.getOne({
      where: {
        userId,
        startAt: { [Op.lte]: currentDate },
        endAt: { [Op.gte]: currentDate },
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }
}
