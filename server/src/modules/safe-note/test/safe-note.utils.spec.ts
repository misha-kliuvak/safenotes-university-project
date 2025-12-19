import { SignSafeAs } from '@/modules/safe-note/enums';
import { SafeNoteUtils } from '@/modules/safe-note/safe-note.utils';

describe('safe-note utils', () => {
  describe('calculatePlatformFee', () => {
    it.each([100, 50, 0])(
      'should return 10 for amounts less than or equal to 100',
      (amount) => {
        expect(SafeNoteUtils.calculatePlatformFee(amount)).toEqual(10);
      },
    );

    it.each([1001, 5000, 10_000])(
      'should return 50 for amounts between 100 and 10,000',
      (amount) => {
        expect(SafeNoteUtils.calculatePlatformFee(amount)).toEqual(50);
      },
    );

    it.each([10_001, 20_000])(
      'should return 100 for amounts greater than 10,000',
      (amount) => {
        expect(SafeNoteUtils.calculatePlatformFee(amount)).toEqual(100);
      },
    );

    it.each([
      {
        amount: 100,
        result: 10,
      },
      {
        amount: 1,
        result: 10,
      },
      {
        amount: 101,
        result: 50,
      },
      {
        amount: 5443,
        result: 50,
      },
      {
        amount: 10_000,
        result: 50,
      },
      {
        amount: 43343,
        result: 100,
      },
      {
        amount: 523432432,
        result: 100,
      },
    ])('should return $result if amount is $amount', ({ amount, result }) => {
      const fee = SafeNoteUtils.calculatePlatformFee(amount);
      expect(fee).toEqual(result);
    });
  });

  describe('calculateValuationCap', () => {
    it.each([
      [0, 100], // 0 - allowance, 1 - allocation
      [100, 0],
      [0, 0],
    ])('should return null if allocation or allowance is zero', (item) => {
      const allowance = item[0];
      const allocation = item[1];

      expect(
        SafeNoteUtils.calculateValuationCap(allowance, allocation),
      ).toBeNull();
    });

    it('should calculate the valuation cap correctly', () => {
      expect(SafeNoteUtils.calculateValuationCap(100, 50)).toEqual(200);
      expect(SafeNoteUtils.calculateValuationCap(200, 25)).toEqual(800);
    });
  });

  describe('mapSignAsToSignatureData', () => {
    it('should map SignSafeAs.RECIPIENT to recipient signature data', () => {
      const result = SafeNoteUtils.mapSignAsToSignatureData(
        SignSafeAs.RECIPIENT,
      );
      expect(result).toEqual({
        signatureField: 'recipientSignature',
        signDateField: 'recipientSignDate',
        signNameField: 'recipientSignName',
      });
    });

    it('should map SignSafeAs.SENDER to sender signature data', () => {
      const result = SafeNoteUtils.mapSignAsToSignatureData(SignSafeAs.SENDER);
      expect(result).toEqual({
        signatureField: 'senderSignature',
        signDateField: 'senderSignDate',
        signNameField: 'senderSignName',
      });
    });
  });
});
