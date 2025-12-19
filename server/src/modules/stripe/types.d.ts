import { AccountHolderType } from '@/modules/stripe/enums';

export interface CardPaymentMethod {
  number: string;
  expirationMonth: number;
  expirationYear: number;
  cvv: string;
}

export interface BankPaymentMethod {
  accountNumber: string;
  routingNumber: string;
  accountHolderType: AccountHolderType;
  billingDetails: {
    name: string;
    email?: string;
  };
}
