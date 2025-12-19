import { faker } from '@faker-js/faker';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { ConfigService } from '@/config';
import { AuthModule } from '@/modules/auth/auth.module';
import { AuthService } from '@/modules/auth/service/auth.service';
import { MailService } from '@/modules/mail/mail.service';
import { TokenType } from '@/modules/token/enums';
import { TokenService } from '@/modules/token/token.service';
import { UserModule } from '@/modules/user/user.module';
import { UserService } from '@/modules/user/user.service';
import { setupApp } from '@/setup';
import { DataGenerator } from '@/shared/jest/data.generator';
import { JestRequestHelper } from '@/shared/jest/jest-request.helper';
import { JestModule } from '@/shared/jest/jest.module';

const initialUser = DataGenerator.userWithPassword();

describe('User (e2e)', () => {
  let http;
  let app: NestExpressApplication;

  let authService: AuthService;
  let tokenService: TokenService;
  let configService: ConfigService;
  let mailService: MailService;
  let userService: UserService;

  let requestHelper: JestRequestHelper;

  let user;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JestModule, AuthModule, UserModule],
    }).compile();

    app = moduleRef.createNestApplication();
    http = setupApp(app);

    authService = app.get(AuthService);
    tokenService = app.get(TokenService);
    configService = app.get(ConfigService);
    mailService = app.get(MailService);
    userService = app.get(UserService);
    requestHelper = new JestRequestHelper(http);

    await app.init();

    user = await requestHelper.auth().signUp(initialUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /user/me', () => {
    const ENDPOINT = '/user/me';

    it('should return 401 because user not authorized', () => {
      return request(http)
        .get(ENDPOINT)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Unauthorized');
        });
    });

    it('should return user data', () => {
      return request(http)
        .get(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(initialUser.email);
          expect(res.body.fullName).toBe(initialUser.fullName);
          expect(res.body.emailVerified).toBe(false);
          expect(res.body.image).toBeDefined();
        });
    });

    it('emailVerified should be true after user verified email', async () => {
      const confirmToken = tokenService.createServiceToken({
        email: user.user.email,
      });

      await authService.confirmAndGetEmail(confirmToken);

      return request(http)
        .get(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(initialUser.email);
          expect(res.body.fullName).toBe(initialUser.fullName);
          expect(res.body.emailVerified).toBe(true);
        });
    });
  });

  describe('PATCH /user', () => {
    const ENDPOINT = '/user';

    it('should return updated user data with image url', async () => {
      const updatedFullName = faker.person.fullName();

      initialUser.fullName = updatedFullName;

      return request(http)
        .patch(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .send({
          fullName: updatedFullName,
          image: 'https://picsum.photos/200/300',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.fullName).toBe(updatedFullName);
          expect(res.body.image).toBe('https://picsum.photos/200/300');
        });
    });

    it('should update user image', () => {
      const logoFilePath = join(__dirname, '..', 'static/logo.png');

      const { apiUrl } = configService.getUrlConfig();

      return request(http)
        .patch(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .attach('image', logoFilePath, {
          contentType: 'multipart/form-data',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.image).toBe(
            `${apiUrl}/storage/users/${res.body.id}/user-image.png`,
          );
        });
    });

    it('should return error because image is in wrong format', () => {
      const logoFilePath = join(__dirname, '..', '.prettierrc');

      return request(http)
        .patch(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .attach('image', logoFilePath, {
          contentType: 'multipart/form-data',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Unsupported file type');
        });
    });
  });

  describe('GET /user/public-by-email', () => {
    const ENDPOINT = '/user/public-by-email';

    it('should return empty because user not exist', () => {
      const email = 'non-exist-email' + faker.string.uuid();

      return request(http)
        .get(`${ENDPOINT}?email=${email}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({});
        });
    });

    it('should return public user', () => {
      const email = initialUser.email;

      return request(http)
        .get(`${ENDPOINT}?email=${email}`)
        .expect(200)
        .expect({
          email,
          fullName: initialUser.fullName,
        });
    });
  });

  describe('GET /user/resend-verify-email', () => {
    const ENDPOINT = '/user/resend-verify-email';

    it('should send 401 if user not authorized', async () => {
      return request(http).get(ENDPOINT).expect(401);
    });

    it('should send email to verify email', async () => {
      const verifyEmailSpy = jest.spyOn(mailService, 'sendVerifyEmail');
      const confirmTokenSpy = jest.spyOn(tokenService, 'createServiceToken');

      MailService.prototype.sendVerifyEmail = jest.fn();

      const response = await request(http)
        .get(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .expect(200);

      expect(verifyEmailSpy).toBeCalledWith({
        to: initialUser.email,
        userName: initialUser.fullName,
      });

      expect(confirmTokenSpy).toBeCalledWith({
        email: initialUser.email,
      });

      return response;
    });
  });

  describe('GET /user/validate-token', () => {
    const ENDPOINT = '/user/validate-token';

    it.each([
      '',
      null,
      undefined,
      '___',
      'random-token',

      // invalid signature
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',

      // expired
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IkpvaG4gRG9lIiwiX190b2tlblR5cGVfXyI6InNlcnZpY2UiLCJpYXQiOjE2ODk4NDEwMDAsImV4cCI6MTY4OTg0MTAxMH0.PQKWClog1EAaJzyinv1hRkWiOvDFGSIB3cEye55YsOQ',

      // dont have required data inside
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImUyZS10ZXN0LWFjdGl2ZS11c2VyQGdtYWlsLmNvbSIsIl9fdG9rZW5UeXBlX18iOiJzZXJ2aWNlIiwiaWF0IjoxNjkwNzkyNDQ1LCJleHAiOjE3MDExNjA0NDV9.kBV7ru32ohK4zM95u0-4dQxR4hapWcM6sZjGnQnqVO4',

      // user not exist in database
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QtdXNlckBteXNhZmVub3Rlcy5jb20iLCJfX3Rva2VuVHlwZV9fIjoidXNlciIsImlhdCI6MTY5MDc5MzAyNiwiZXhwIjoxNjkwODc5NDI2fQ.P5VTnH2wPUXMsm-3RH2xusGoO_Kn6sfjjSLZMHU0Dp4',
    ])('should return valid: false if token is not valid', async (token) => {
      return request(http)
        .get(`${ENDPOINT}?token=${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.valid).toBe(false);
          expect(res.body.data).toBe(null);
        });
    });

    it('should return valid: true and data', async () => {
      const user = await userService.getByEmail(initialUser.email);

      const token = tokenService.createAccessToken({
        id: user?.id,
        email: initialUser.email,
      });

      return request(http)
        .get(`${ENDPOINT}?token=${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.valid).toEqual(true);
          expect(res.body.data.id).toEqual(user.id);
          expect(res.body.data.__tokenType__).toEqual(TokenType.ACCESS);
          expect(res.body.data.email).toEqual(initialUser.email);
        });
    });
  });
});
