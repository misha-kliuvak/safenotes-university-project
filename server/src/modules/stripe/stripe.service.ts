import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

import { ConfigService } from '@/config';
import { Logger } from '@/modules/logger/logger';
import { CreatePaymentIntentDto } from '@/modules/stripe/dto/create-payment-intent.dto';
import { BankPaymentMethod, CardPaymentMethod } from '@/modules/stripe/types';
import { PlatformUtils } from '@/shared/utils';

import { InjectStripe } from './stripe.decorator';
import { CreatePayment, PaymentMetadata } from '@/modules/payment/types';
import { PaymentType } from '@/modules/payment/enums';
import { CreatePaymentDto } from '@/modules/payment/dto/create-payment.dto';
import { CardPaymentDataDto } from '@/modules/payment/dto/card-payment-data.dto';
import { BankPaymentDataDto } from '@/modules/payment/dto/bank-payment-data.dto';

@Injectable()
export class StripeService {
  private logger: Logger = new Logger(StripeService.name);

  constructor(
    @InjectStripe() private readonly stripe: Stripe,
    private readonly configService: ConfigService,
  ) {}

  public async handleWebhook(payload: string | Buffer, signature: string) {
    const { webhookSecret, devWebhookSecret } =
      this.configService.getStripeConfig();

    let secret = webhookSecret;
    if (PlatformUtils.isLocalEnv()) {
      secret = devWebhookSecret;
      if (signature === 't=test') {
        signature = this.stripe.webhooks.generateTestHeaderString({
          payload: `${payload}`,
          secret,
        });
      }
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      secret,
    );

    return event.data.object as any;
  }

  public async getCustomerByEmail(email: string) {
    try {
      const result = await this.stripe.customers.search({
        query: `email: "${email}"`,
      });
      return result?.data?.[0] || null;
    } catch (err) {
      this.logger.error('searchCustomerByEmail', err);
      throw new InternalServerErrorException('Cannot search customer');
    }
  }

  public async getCustomerById(id: string): Promise<Stripe.Customer | null> {
    if (!id) return null;

    try {
      const customer = await this.stripe.customers.retrieve(id);
      return customer as Stripe.Customer;
    } catch (err) {
      this.logger.error('getCustomerById', err);
      throw new InternalServerErrorException('Cannot search customer');
    }
  }

  public async createCustomer(data: Stripe.CustomerCreateParams) {
    try {
      return await this.stripe.customers.create(data);
    } catch (err) {
      this.logger.error('[createCustomer]', err);
      throw new InternalServerErrorException('Cannot create customer');
    }
  }

  public async updateCustomer(id: string, data: Stripe.CustomerUpdateParams) {
    try {
      return await this.stripe.customers.update(id, data);
    } catch (err) {
      this.logger.error('[updateCustomer]', err);
      throw new InternalServerErrorException('Cannot update customer');
    }
  }

  public async getPaymentMethodById(id: string) {
    if (!id) return null;
    return this.stripe.paymentMethods.retrieve(id);
  }

  public async createPaymentMethod(dto: CreatePaymentDto) {
    let data: CreatePayment;
    switch (dto.type) {
      case PaymentType.CARD:
        data = dto.data as CardPaymentDataDto;
        return this.createCardPaymentMethod({
          number: data.cardNumber,
          expirationMonth: data.expirationMonth,
          expirationYear: data.expirationYear,
          cvv: String(data.cvv),
        });
      case PaymentType.BANK_TRANSFER:
        data = dto.data as BankPaymentDataDto;
        return this.createBankPaymentMethod({
          accountHolderType: data.accountHolderType,
          routingNumber: data.routingNumber,
          accountNumber: data.accountNumber,
          billingDetails: data.billingDetails,
        });
      default:
        return undefined;
    }
  }

  public async createCardPaymentMethod(
    data: CardPaymentMethod,
  ): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: data.number,
          exp_month: data.expirationMonth,
          exp_year: data.expirationYear,
          cvc: data.cvv,
        },
      });
    } catch (err) {
      this.logger.error('createPaymentMethod', err);
      throw new InternalServerErrorException('Cannot create payment method');
    }
  }

  public async createBankPaymentMethod(data: BankPaymentMethod) {
    try {
      return await this.stripe.paymentMethods.create({
        type: 'us_bank_account',
        us_bank_account: {
          account_number: data.accountNumber,
          account_holder_type: data.accountHolderType,
          routing_number: data.routingNumber,
        },
        billing_details: data.billingDetails,
      });
    } catch (err) {
      this.logger.error('createBankPaymentMethod', err);
      throw new InternalServerErrorException(
        'Cannot create bank payment method',
      );
    }
  }

  public async createPaymentIntent({
    customerId,
    currency = 'usd',
    paymentMethodId,
    amount,
    metadata,
    customerEmail,
    confirm = false,
  }: CreatePaymentIntentDto) {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      customer: customerId,
      confirm,
      payment_method_types: ['card', 'us_bank_account'],
      metadata,
      receipt_email: customerEmail,
    });
  }

  public async getPaymentIntentById(id: string) {
    if (!id) return null;
    return this.stripe.paymentIntents.retrieve(id);
  }

  public async paymentMethodAttach(paymentId: string, customerId: string) {
    try {
      return this.stripe.paymentMethods.attach(paymentId, {
        customer: customerId,
      });
    } catch (err) {
      this.logger.error('[paymentMethodAttach]', err);
      throw new InternalServerErrorException(
        'Cannot attach paymentMethod to customer',
      );
    }
  }

  public async createSubscription(
    customerId: string,
    priceId: string,
    paymentId?: string,
    metadata?: PaymentMetadata,
    expand?: string[],
  ) {
    try {
      return this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        default_payment_method: paymentId,
        metadata,
        expand,
      });
    } catch (err) {
      this.logger.error('[createSubscription]', err);
      throw new InternalServerErrorException('Cannot create subscription');
    }
  }

  public async cancelSubscription(stripeSubscriptionId: string) {
    try {
      return this.stripe.subscriptions.cancel(stripeSubscriptionId);
    } catch (err) {
      this.logger.error('[deleteSubscription]', err);
      throw new InternalServerErrorException('Cannot cancel subscription');
    }
  }

  public async updateSubscription(
    stripeSubscriptionId: string,
    priceId: string,
    metadata?: any,
  ) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(
        stripeSubscriptionId,
      );
      const item = subscription.items.data.shift();
      return this.stripe.subscriptions.update(stripeSubscriptionId, {
        items: [{ id: item.id, price: priceId }],
        metadata,
      });
    } catch (err) {
      this.logger.error('[deleteSubscription]', err);
      throw new InternalServerErrorException('Cannot cancel subscription');
    }
  }

  public async getSubscription(stripeSubscriptionId: string) {
    try {
      return this.stripe.subscriptions.retrieve(stripeSubscriptionId);
    } catch (err) {
      this.logger.error('[getSubscription]', err);
      throw new InternalServerErrorException('Cannot found subscription');
    }
  }

  public async createPrice(params: Stripe.PriceCreateParams) {
    try {
      return this.stripe.prices.create(params);
    } catch (err) {
      this.logger.error('[createPlan]', err);
      throw new InternalServerErrorException('Cannot create Price');
    }
  }

  public async updatePrice(priceId: string, params: Stripe.PriceUpdateParams) {
    try {
      return this.stripe.prices.update(priceId, params);
    } catch (err) {
      this.logger.error('[updatePrice]', err);
      throw new InternalServerErrorException('Cannot update Price');
    }
  }

  public async searchPrice(params: Stripe.PriceSearchParams) {
    try {
      return this.stripe.prices.search(params);
    } catch (err) {
      this.logger.error('[searchPrice]', err);
      throw new InternalServerErrorException('Cannot find Price');
    }
  }
}
