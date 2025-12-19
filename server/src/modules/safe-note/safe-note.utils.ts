import { SignSafeAs } from '@/modules/safe-note/enums';
import { SignatureData } from '@/modules/safe-note/types';

export class SafeNoteUtils {
  /**
   * Calculate fee for mySAFEnotes platform
   * @param amount
   */
  static calculatePlatformFee(amount) {
    if (amount <= 100) return 10;
    if (amount > 100 && amount <= 10_000) return 50;
    return 100;
  }

  static mapSignAsToSignatureData(signAs: SignSafeAs): SignatureData {
    // should match SafeNoteEntity field
    switch (signAs) {
      case SignSafeAs.RECIPIENT:
        return {
          signatureField: 'recipientSignature',
          signDateField: 'recipientSignDate',
          signNameField: 'recipientSignName',
        };
      case SignSafeAs.SENDER:
        return {
          signatureField: 'senderSignature',
          signDateField: 'senderSignDate',
          signNameField: 'senderSignName',
        };
    }
  }
}
