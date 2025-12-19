import { PaymentMetadata } from '@/modules/payment/types';
import { PayAs } from '@/modules/safe-note/enums';
import { RecipientDto } from '@/modules/safe-note/dto/recipient.dto';

export interface SafeNotePaymentMetadata extends PaymentMetadata {
  safeNoteId: string;
  payAs: PayAs;
}

export interface SafeNotePermissions {
  canSign: boolean;
}

export interface SignatureData {
  signatureField: string;
  signNameField: string;
  signDateField: string;
}

export interface SafeNoteTerms {
  discountRate: number;
  valuationCap: number;
}

export interface SafeNoteData {
  recipients?: RecipientDto[];
}
