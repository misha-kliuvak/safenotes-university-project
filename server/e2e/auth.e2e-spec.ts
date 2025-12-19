import { faker } from '@faker-js/faker';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { ConfigService } from '@/config';
import { AuthModule } from '@/modules/auth/auth.module';
import { MailService } from '@/modules/mail/mail.service';
import { TeamMemberModule } from '@/modules/team-member/team-member.module';
import { TeamMemberService } from '@/modules/team-member/team-member.service';
import { TokenService } from '@/modules/token/token.service';
import { UserModule } from '@/modules/user/user.module';
import { UserService } from '@/modules/user/user.service';
import { setupApp } from '@/setup';
import { DataGenerator } from '@/shared/jest/data.generator';
import { JestRequestHelper } from '@/shared/jest/jest-request.helper';
import { JestModule } from '@/shared/jest/jest.module';
import { getFirstName } from '@/shared/utils';

MailService.prototype.sendEmail = jest.fn();

describe('Auth (e2e)', () => {
  let http;
  let app: NestExpressApplication;
  let requestHelperService: JestRequestHelper;

  let userService: UserService;
  let tokenService: TokenService;
  let configService: ConfigService;
  let mailService: MailService;
  let teamMemberService: TeamMemberService;

  const initialUser = DataGenerator.userWithPassword();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JestModule, AuthModule, UserModule, TeamMemberModule],
    }).compile();

    app = moduleRef.createNestApplication();
    http = setupApp(app);
    requestHelperService = new JestRequestHelper(http);

    userService = app.get(UserService);
    tokenService = app.get(TokenService);
    configService = app.get(ConfigService);
    mailService = app.get(MailService);
    teamMemberService = app.get(TeamMemberService);

    await app.init();

    await requestHelperService.auth().signUp(initialUser);
  });

  afterAll(async () => {
    await app.close();
  });

  it(`/GET /auth`, () => {
    return request(http)
      .get('/auth')
      .expect(200)
      .expect({
        supportedOAuthStrategies: ['/google', '/linkedin', '/facebook'],
      });
  });

  describe('/POST /auth/registration', () => {
    const ENDPOINT = '/auth/registration';

    it.each([
      {
        body: {},
        message: 'email should not be empty',
      },
      {
        body: {
          email: '',
          password: '',
        },
        message: 'email should not be empty',
      },
      {
        body: { email: 'sds@d' },
        message: 'email must be an email',
      },
      {
        body: {
          fullName: '    ',
          email: 'a@gmail.com',
          password: '  ',
        },
        message: [
          'fullName should not be empty',
          'password must be longer than or equal to 5 characters',
          'password should not be empty',
        ],
      },
    ])('should return 400 because of invalid data', ({ body, message }) => {
      return request(http)
        .post(ENDPOINT)
        .send(body)
        .expect(400)
        .expect((res) => {
          expect(res.body).toBeDefined();

          if (typeof message === 'string' && message.trim()) {
            expect(res.body.message).toContain(message);
          }

          if (Array.isArray(message)) {
            expect(res.body.message.some((i) => message.includes(i))).toBe(
              true,
            );
          }

          expect(res.body.statusCode).toBe(400);
        });
    });

    it('should return 409 because email already taken', () => {
      return request(http)
        .post(ENDPOINT)
        .send({
          fullName: faker.person.fullName(),
          password: 'some-random-password',
          email: initialUser.email,
        })
        .expect(409)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.message).toEqual({
            email: [
              'Email already taken. Please use a different email address.',
            ],
          });
          expect(res.body.statusCode).toBe(409);
        });
    });

    it('should sign up user with token', async () => {
      const user = DataGenerator.userWithPassword();
      const token = tokenService.createServiceToken(user);

      await request(http)
        .post(ENDPOINT)
        .send({
          ...user,
          token: token,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.user.email).toBe(user.email);
          expect(body.user.fullName).toBe(user.fullName);
          expect(body.user.active).toBe(true);
        });
    });

    it('should sign up account for invited user via token', async () => {
      const user = DataGenerator.teamMember();

      // mapping as team member create inactive account
      // so mean like email already exist in db, but account is not active
      // as long as account is not active, user should be able to sign up
      await teamMemberService.mapTeamMembers(null, [user]);

      const token = tokenService.createServiceToken({
        email: user.email,
        fullName: user.fullName,
      });

      await request(http)
        .post(ENDPOINT)
        .send({
          ...user,
          password: faker.internet.password(),
          token: token,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.user.email).toBe(user.email);
          expect(body.user.fullName).toBe(user.fullName);
          expect(body.user.active).toBe(true);
        });
    });

    it('should sign up account for invited user', async () => {
      const user = DataGenerator.teamMember();

      // mapping as team member create inactive account
      // so mean like email already exist in db, but account is not active
      // as long as account is not active, user should be able to sign up
      await teamMemberService.mapTeamMembers(null, [user]);

      await request(http)
        .post(ENDPOINT)
        .send({
          ...user,
          password: faker.internet.password(),
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.user.email).toBe(user.email);
          expect(body.user.fullName).toBe(user.fullName);
          expect(body.user.active).toBe(true);
        });
    });

    it('should sign up user with valid data and return access token', async () => {
      const email = `__ec2__internal__${faker.internet.email()}`;
      const fullName = faker.person.fullName();

      const welcomeEmailSpy = jest.spyOn(mailService, 'sendWelcomeEmail');

      const response = await request(http)
        .post(ENDPOINT)
        .send({
          fullName,
          password: faker.internet.password(),
          email,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.id).toBeDefined();
          expect(res.body.user.email).toBe(email);
          expect(res.body.user.fullName).toBe(fullName);
          expect(res.body.user.active).toBe(true);
          expect(res.body.user.emailVerified).toBe(false);
          expect(res.body.user.password).not.toBeDefined();
        });

      await userService.deleteBy('email', email);

      expect(welcomeEmailSpy).toBeCalledWith({
        to: email,
        userName: getFirstName(fullName),
      });

      return response;
    });
  });

  describe('/POST /auth/login', () => {
    const ENDPOINT = '/auth/login';

    it('should return 401 because of invalid credentials', () => {
      return request(http)
        .post(ENDPOINT)
        .send({
          email: initialUser.email,
          password: faker.internet.password(),
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toEqual({
            email: ['Invalid credentials'],
            password: ['Invalid credentials'],
          });
          expect(res.body.statusCode).toBe(401);
        });
    });

    it('should return 400 because of invalid data', () => {
      return request(http)
        .post(ENDPOINT)
        .send({
          email: 'invalid-email',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email must be an email');
          expect(res.body.statusCode).toBe(400);
        });
    });

    it('should login user and return access token', () => {
      const email = initialUser.email;
      return request(http)
        .post(ENDPOINT)
        .send({
          email,
          password: initialUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toEqual(email);
          expect(res.body.user.password).not.toBeDefined();
        });
    });
  });

  describe('GET /auth/google', () => {
    it('/GET /auth/google should return 302 and redirect to accounts.google.com', async () => {
      return request(http)
        .get('/auth/google')
        .expect(302)
        .expect('Location', /accounts\.google\.com/);
    });
  });

  describe('GET /auth/linkedin', () => {
    it('/GET /auth/linkedin should return 302 and redirect to accounts.google.com', async () => {
      return request(http)
        .get('/auth/linkedin')
        .expect(302)
        .expect((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toContain('linkedin.com/oauth');
        });
    });
  });

  describe('GET /auth/confirm-email', () => {
    const ENDPOINT = '/auth/confirm-email';

    it.each([
      '',
      null,
      undefined,
      '___',
      'random-token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IkpvaG4gRG9lIiwiX190b2tlblR5cGVfXyI6InNlcnZpY2UiLCJpYXQiOjE2ODk4NDEwMDAsImV4cCI6MTY4OTg0MTAxMH0.PQKWClog1EAaJzyinv1hRkWiOvDFGSIB3cEye55YsOQ',
    ])(
      'should return 400 if token is invalid or not provided',
      async (token) => {
        return request(http)
          .get(`${ENDPOINT}?token=${token}`)
          .expect(400)
          .expect((res) => {
            expect(res.body).toBeDefined();
            expect(res.body.statusCode).toBe(400);
            expect([
              'Token is not provided',
              'Token is invalid or expired',
            ]).toContain(res.body.message);
          });
      },
    );

    it('should redirect to frontend url if email verified', async () => {
      const token = tokenService.createServiceToken({
        email: initialUser.email,
      });

      const { authVerifyCompleteUrl } = configService.getUrlConfig();

      return request(http)
        .get(`${ENDPOINT}?token=${token}`)
        .expect(302)
        .expect((res) => {
          expect(res.redirect).toEqual(true);
          expect(res.headers.location).toContain(authVerifyCompleteUrl);
        });
    });
  });
});
