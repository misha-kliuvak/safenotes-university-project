import { ConfigService } from '@nestjs/config';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

import { PaymentProvider } from '@/modules/payment/enums';

export class PlaidProvider {
  static forRoot() {
    return {
      provide: PaymentProvider.PLAID,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return new PlaidApi(
          new Configuration({
            basePath: configService.get('plaid.sandbox')
              ? PlaidEnvironments.sandbox
              : PlaidEnvironments.production,
            baseOptions: {
              headers: {
                'PLAID-CLIENT-ID': configService.get('plaid.clientId'),
                'PLAID-SECRET': configService.get('plaid.secret'),
              },
            },
          }),
        );
      },
    };
  }
}
