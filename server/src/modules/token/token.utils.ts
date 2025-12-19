import { TokenType } from '@/modules/token/enums';
import { Dictionary } from '@/shared/types';

export class TokenUtils {
  static withTokenPayload(payload: Dictionary, type: TokenType) {
    return {
      ...payload,
      __tokenType__: type,
    };
  }
}
