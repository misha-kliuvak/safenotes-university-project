import { Test } from '@nestjs/testing';

import { ConfigService } from '@/config';
import { AppService } from '@/main/app.service';
import { MailModule } from '@/modules/mail/mail.module';
import { MailService } from '@/modules/mail/mail.service';
import { TokenType } from '@/modules/token/enums';
import { TokenBlacklistRepository } from '@/modules/token/repository/token-blacklist.repository';
import { TokenModule } from '@/modules/token/token.module';
import { TokenService } from '@/modules/token/token.service';
import { JestModule } from '@/shared/jest/jest.module';

import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;
  let configService: ConfigService;
  let mailService: MailService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [AppController],
      imports: [JestModule, TokenModule, MailModule],
      providers: [AppService],
    }).compile();

    controller = app.get(AppController);
    configService = app.get(ConfigService);
    mailService = app.get(MailService);
    tokenService = app.get(TokenService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('home', () => {
    it('should return the welcome message', () => {
      const result = controller.home();

      expect(result).toEqual({
        message: 'The MySAFEnotes server is running up!',
      });
    });
  });

  describe('validateToken', () => {
    it('should validate the service token and return valid true with right data', async () => {
      TokenBlacklistRepository.prototype.getOne = jest
        .fn()
        .mockResolvedValue(null);

      const token = '....';

      const expectedResult = {
        valid: true,
        data: {
          userName: 'John Doe',
          __tokenType__: TokenType.SERVICE,
          exp: 1,
          iat: 1,
        },
      };

      jest
        .spyOn(tokenService, 'validateServiceToken')
        .mockResolvedValueOnce(expectedResult);

      const result = await controller.validateToken({ token });

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
    ])(
      'should return valid: false because of wrong or invalid token',
      async (token) => {
        const expectedResult = {
          valid: false,
          data: null,
        };

        const result = await controller.validateToken({ token });

        expect(result).toEqual(expectedResult);
      },
    );
  });
});
