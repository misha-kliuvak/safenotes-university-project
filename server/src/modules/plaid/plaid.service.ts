import { BadRequestException, Injectable } from '@nestjs/common';
import {
  PlaidApi,
  TransferAuthorizationCreateRequest,
  CountryCode,
  TransferNetwork,
  Products,
  TransferCreateRequest,
  ISOCurrencyCode,
  TransferType,
  ACHClass,
  TransferAuthorizationDecision,
} from 'plaid';

import { ConfigService } from '@/config';
import { Logger } from '@/modules/logger/logger';
import { PaymentMetadata } from '@/modules/payment/types';
import { TransferDto } from '@/modules/plaid/dto/transfer.dto';
import { InjectPlaid } from '@/modules/plaid/plaid.decorator';
import { PlaidSettingsRepository } from '@/modules/plaid/repository/plaid-settings.repository';
import { RawUser } from '@/modules/user/types';
import { UserService } from '@/modules/user/user.service';
import { LinkFactory } from '@/shared/factories/link.factory';

@Injectable()
export class PlaidService {
  private logger: Logger = new Logger(PlaidService.name);

  constructor(
    @InjectPlaid() private readonly plaidClient: PlaidApi,
    private readonly userService: UserService,
    private readonly linkFactory: LinkFactory,
    private readonly plaidSettingsRepository: PlaidSettingsRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a transfer
   *
   * @param fromUserId
   * @param toUserId
   * @param dto
   * @param metadata
   */
  async createTransfer(
    fromUserId: string,
    toUserId: string,
    dto: TransferDto,
    metadata: PaymentMetadata,
  ) {
    const plaidAccessToken = await this.getUserAccessToken(fromUserId);

    const toUser = await this.userService.getUserByID(toUserId, {
      throwNotFound: true,
    });

    const authRequest: TransferAuthorizationCreateRequest = {
      access_token: plaidAccessToken,
      account_id: dto.accountId,
      type: TransferType.Debit,
      network: TransferNetwork.SameDayAch,
      ach_class: ACHClass.Ppd,
      amount: dto.amount.toFixed(2),
      iso_currency_code: ISOCurrencyCode.Usd,
      user_present: true,
      user: {
        legal_name: toUser.fullName,
        email_address: toUser.email,
      },
    };

    const authResponse = await this.plaidClient.transferAuthorizationCreate(
      authRequest,
    );

    if (
      authResponse.data.authorization.decision ===
      TransferAuthorizationDecision.Declined
    ) {
      throw new BadRequestException(
        authResponse.data.authorization.decision_rationale.description,
      );
    }

    const transferAuthId = authResponse.data.authorization.id;

    const transferRequest: TransferCreateRequest = {
      access_token: plaidAccessToken,
      account_id: dto.accountId,
      authorization_id: transferAuthId,
      amount: dto.amount.toFixed(2),
      description: 'Payment',
      metadata,
    };

    const transferResponse = await this.plaidClient.transferCreate(
      transferRequest,
    );

    return transferResponse.data.transfer;
  }

  async validateAccount(accessToken: string, accountId: string) {
    const response = await this.plaidClient.accountsGet({
      access_token: accessToken,
      options: {
        account_ids: [accountId],
      },
    });

    return response.data;
  }

  /**
   * Get transfer details
   *
   * @param transferId
   */
  async getTransfer(transferId: string) {
    const response = await this.plaidClient.transferGet({
      transfer_id: transferId,
    });

    return response.data.transfer;
  }

  async syncTransfer() {
    const settings = await this.plaidSettingsRepository.getPlaidLastEventId();

    const response = await this.plaidClient.transferEventSync({
      after_id: Number(settings?.value) || 0,
    });

    if (response.data.transfer_events.length) {
      const lastEventId = response.data.transfer_events[0].event_id;

      await this.plaidSettingsRepository.setPlaidLastEventId(lastEventId);
    }

    return response.data.transfer_events;
  }

  /**
   * Get user access token
   *
   * @param userId
   */
  async getUserAccessToken(userId: string) {
    const user = await this.userService.getUserByID(userId, {
      throwNotFound: true,
    });

    if (!user.plaidAccessToken) {
      throw new BadRequestException('Plaid access token is missing');
    }

    return user.plaidAccessToken;
  }

  /**
   * Get account details
   *
   * @param userId
   */
  async getAccount(userId: string) {
    const response = await this.plaidClient.accountsGet({
      access_token: await this.getUserAccessToken(userId),
    });

    return response.data;
  }

  /**
   * Get token details
   *
   * @param userId
   */
  async getToken(userId: string) {
    const response = await this.plaidClient.itemGet({
      access_token: await this.getUserAccessToken(userId),
    });

    return response.data;
  }

  /**
   * Create a link token
   *
   * @param user
   */
  async createLinkToken(user: RawUser): Promise<string> {
    const response = await this.plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id,
        email_address: user.email,
      },
      client_name: 'MSN',
      webhook: this.linkFactory.createPlaidWebhook(),
      // redirect_uri: 'MSN',
      products: [Products.Auth, Products.Transactions, Products.Transfer],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return response.data.link_token;
  }

  /**
   * Exchange a public token for an access token
   *
   * @param publicToken
   */
  async exchangePublicTokenToAccess(publicToken: string) {
    const response = await this.plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    return response.data;
  }

  /**
   * Verify Plaid webhook signature
   *
   * @param signature
   * @param requestBody
   */
  async getVerificationKey(key_id: string) {
    const verificationKey = await this.plaidClient.webhookVerificationKeyGet({
      key_id: key_id,
    });

    return verificationKey.data.key;
  }
}
