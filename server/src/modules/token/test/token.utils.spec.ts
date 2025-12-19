import { TokenType } from '@/modules/token/enums';

import { TokenUtils } from '../token.utils';

describe('TokenUtils', () => {
  describe('withTokenPayload', () => {
    it('should add a token type property to the payload', () => {
      const payload = {
        user_id: 123,
        username: 'john_doe',
      };
      const type = TokenType.ACCESS;

      const result = TokenUtils.withTokenPayload(payload, type);

      expect(result).toHaveProperty('__tokenType__', type);
    });

    it('should not modify the original payload object', () => {
      const payload = {
        user_id: 123,
        username: 'john_doe',
      };
      const type = TokenType.SERVICE;

      const result = TokenUtils.withTokenPayload(payload, type);

      expect(result).not.toBe(payload);
    });

    it('should handle an empty payload', () => {
      const payload = {};
      const type = TokenType.ACCESS;

      const result = TokenUtils.withTokenPayload(payload, type);

      expect(result).toHaveProperty('__tokenType__', type);
    });

    it('should handle different token types', () => {
      const payload = {
        user_id: 456,
        role: 'admin',
      };
      const accessTokenType = TokenType.ACCESS;
      const serviceTokenType = TokenType.SERVICE;

      const accessTokenResult = TokenUtils.withTokenPayload(
        payload,
        accessTokenType,
      );
      const serviceTokenResult = TokenUtils.withTokenPayload(
        payload,
        serviceTokenType,
      );

      expect(accessTokenResult).toHaveProperty(
        '__tokenType__',
        accessTokenType,
      );
      expect(serviceTokenResult).toHaveProperty(
        '__tokenType__',
        serviceTokenType,
      );
    });
  });
});
