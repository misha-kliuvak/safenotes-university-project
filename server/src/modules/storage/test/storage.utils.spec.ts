import { StorageUtils } from '../storage.utils';

describe('StorageUtils', () => {
  describe('convertFileSizeToBytes', () => {
    it('should convert 1 MB to bytes correctly', () => {
      const mbSize = 1;
      const expectedBytes = 1024 * 1024;
      const result = StorageUtils.convertFileSizeToBytes(mbSize);
      expect(result).toEqual(expectedBytes);
    });

    it('should convert 0.5 MB to bytes correctly', () => {
      const mbSize = 0.5;
      const expectedBytes = 0.5 * 1024 * 1024;
      const result = StorageUtils.convertFileSizeToBytes(mbSize);
      expect(result).toEqual(expectedBytes);
    });

    it('should convert 0 MB to 0 bytes', () => {
      const mbSize = 0;
      const expectedBytes = 0;
      const result = StorageUtils.convertFileSizeToBytes(mbSize);
      expect(result).toEqual(expectedBytes);
    });

    it('should handle negative input by returning 0 bytes', () => {
      const mbSize = -5;
      const expectedBytes = 0;
      const result = StorageUtils.convertFileSizeToBytes(mbSize);
      expect(result).toEqual(expectedBytes);
    });
  });
});
