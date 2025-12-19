import { JwtPayload } from 'jsonwebtoken';

import { TokenType } from '@/modules/token/enums';

export type ValidatedTokenData = JwtPayload & { __tokenType__: TokenType };

export interface ValidatedToken {
  valid: boolean;
  data: ValidatedTokenData;
}
