import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

import { ConfigService } from '@/config';
import { ICreateOptions } from '@/modules/database/types';
import { Logger } from '@/modules/logger/logger';
import { TokenBlacklistRepository } from '@/modules/token/repository/token-blacklist.repository';
import { TokenUtils } from '@/modules/token/token.utils';
import { RawUser } from '@/modules/user/types';
import { Dictionary } from '@/shared/types';

import { TokenType } from './enums';
import { ValidatedToken, ValidatedTokenData } from './types';

@Injectable()
export class TokenService {
  private readonly logger: Logger = new Logger(TokenService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenBlacklistRepository: TokenBlacklistRepository,
  ) {}

  private getSecretKeyForTokenType(type: TokenType) {
    const { user, service } = this.configService.getTokenConfig();

    switch (type) {
      case TokenType.ACCESS:
        return user.tokenSecretKey;
      case TokenType.SERVICE:
        return service.tokenSecretKey;
      default:
        return service.tokenSecretKey;
    }
  }

  /**
   * Validating token by type
   * @param token
   * @param type
   * @protected
   */
  public async validate(
    token: string,
    type: TokenType,
  ): Promise<ValidatedToken> {
    const secretKey = this.getSecretKeyForTokenType(type);

    const invalidData = {
      valid: false,
      data: null,
    };

    if (!token?.trim?.()) return invalidData;

    try {
      const response = verify(token, secretKey);
      const isInBlackList = await this.tokenBlacklistRepository.getOne({
        where: { token },
      });

      if (isInBlackList) return invalidData;

      return {
        valid: response && response !== '',
        data: response as ValidatedTokenData,
      };
    } catch (err) {
      return invalidData;
    }
  }

  public decode(token: string): { [key: string]: any } {
    if (!token?.trim?.() || !token.includes('.')) return {};
    try {
      return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    } catch (err) {
      this.logger.error("[decode]: cannot decode token, probably it's not JWT");
      return {};
    }
  }

  public async invalidate(
    token: string,
    options?: ICreateOptions,
  ): Promise<void> {
    await this.tokenBlacklistRepository.create(
      {
        token,
      },
      options,
    );
  }

  /**
   * Generating access token for user
   * @param data
   */
  public createAccessToken(data: Partial<RawUser>): string {
    const { user } = this.configService.getTokenConfig();
    const tokenSecretKey = user.tokenSecretKey;
    const tokenExpiresIn = user.tokenExpiresIn;

    return sign(
      TokenUtils.withTokenPayload(data, TokenType.ACCESS),
      tokenSecretKey,
      {
        expiresIn: tokenExpiresIn,
      },
    );
  }

  /**
   * Validate user access token
   * @param token
   * @private
   */
  public async validateAccessToken(token: string): Promise<ValidatedToken> {
    return this.validate(token, TokenType.ACCESS);
  }

  /**
   * Generate service token
   * @param payload
   * @param expiresIn
   */
  public createServiceToken(payload?: Dictionary, expiresIn?: string | number) {
    const { service } = this.configService.getTokenConfig();

    const tokenSecretKey = service.tokenSecretKey;
    const tokenExpiresIn = service.tokenExpiresIn;

    return sign(
      TokenUtils.withTokenPayload(payload, TokenType.SERVICE),
      tokenSecretKey,
      {
        expiresIn: expiresIn || tokenExpiresIn,
      },
    );
  }

  /**
   * Validate email confirm token
   * @param token
   * @private
   */
  public async validateServiceToken(token: string): Promise<ValidatedToken> {
    const data = this.decode(token);

    return this.validate(token, data.__tokenType__);
  }
}
