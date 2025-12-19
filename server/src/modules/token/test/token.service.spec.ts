import { Test, TestingModule } from '@nestjs/testing';

import { MailModule } from '@/modules/mail/mail.module';
import { TokenType } from '@/modules/token/enums';
import { TokenBlacklistRepository } from '@/modules/token/repository/token-blacklist.repository';
import { TokenModule } from '@/modules/token/token.module';
import { TokenService } from '@/modules/token/token.service';
import { JestModule } from '@/shared/jest/jest.module';
import {
  convertTimeFromMsToSeconds,
  secondsToMilliseconds,
} from '@/shared/utils';

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [JestModule, TokenModule, MailModule],
    }).compile();

    tokenService = app.get(TokenService);

    TokenBlacklistRepository.prototype.getOne = jest.fn();
  });

  it('should be defined', () => {
    expect(tokenService).toBeDefined();
  });

  it('should validate the service token and return valid true with right data', async () => {
    const iatTime = convertTimeFromMsToSeconds(Date.now());

    const TEN_SECONDS = 10;
    const expTime = convertTimeFromMsToSeconds(
      new Date(Date.now() + secondsToMilliseconds(TEN_SECONDS)).getTime(),
    );

    const token = tokenService.createServiceToken(
      { userName: 'John Doe' },
      TEN_SECONDS,
    );

    const expectedResult = {
      valid: true,
      data: {
        userName: 'John Doe',
        __tokenType__: TokenType.SERVICE,
        exp: expTime,
        iat: iatTime,
      },
    };

    const result = await tokenService.validateServiceToken(token);

    expect(result).toEqual(expectedResult);
  });

  it.each([
    null,
    undefined,
    '',
    '   ',
    '___',

    // invalid signature
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',

    // expired token
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IkpvaG4gRG9lIiwiX190b2tlblR5cGVfXyI6InNlcnZpY2UiLCJpYXQiOjE2ODk4NDEwMDAsImV4cCI6MTY4OTg0MTAxMH0.PQKWClog1EAaJzyinv1hRkWiOvDFGSIB3cEye55YsOQ',
  ])('should return because of wrong or invalid token', async (token) => {
    const expectedResult = {
      valid: false,
      data: null,
    };

    const result = await tokenService.validateServiceToken(token);

    expect(result).toEqual(expectedResult);
  });

  it('should return valid: false because token is in blacklist or expired', async () => {
    TokenBlacklistRepository.prototype.create = jest.fn().mockResolvedValue('');
    TokenBlacklistRepository.prototype.getOne = jest
      .fn()
      .mockResolvedValue('2');

    const token = tokenService.createServiceToken({}, '1h');
    await tokenService.invalidate(token);

    const expectedResult = {
      valid: false,
      data: null,
    };

    const result = await tokenService.validateServiceToken(token);

    expect(result).toEqual(expectedResult);
  });
});
