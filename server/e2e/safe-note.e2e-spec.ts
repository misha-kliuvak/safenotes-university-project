import { faker } from '@faker-js/faker';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { AuthModule } from '@/modules/auth/auth.module';
import { AuthResponse } from '@/modules/auth/types';
import { CompanyModule } from '@/modules/company/company.module';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { MailService } from '@/modules/mail/mail.service';
import { PaymentStatus, PaymentType } from '@/modules/payment/enums';
import { PaymentService } from '@/modules/payment/payment.service';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import { PayAs, SafeFor, SignSafeAs } from '@/modules/safe-note/enums';
import { SafeNoteModule } from '@/modules/safe-note/safe-note.module';
import { UserModule } from '@/modules/user/user.module';
import { UserService } from '@/modules/user/user.service';
import { setupApp } from '@/setup';
import { InviteStatus, Permission } from '@/shared/enums';
import { DataGenerator } from '@/shared/jest/data.generator';
import { JestRequestHelper } from '@/shared/jest/jest-request.helper';
import { JestModule } from '@/shared/jest/jest.module';
import { UrlUtils } from '@/shared/utils';

jest.mock('@/modules/stripe/stripe.service.ts');
MailService.prototype.sendEmail = jest.fn().mockImplementation();

describe('SAFE Note (e2e)', () => {
  let http;
  let app: NestExpressApplication;
  let requestHelper: JestRequestHelper;

  let userService: UserService;
  let mailService: MailService;

  let owner: AuthResponse,
    recipient: AuthResponse,
    tmView: AuthResponse, // view permission
    tmEdit: AuthResponse, // edit permission,
    tmCreate: AuthResponse, // create permission;
    company: CompanyEntity;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JestModule,
        AuthModule,
        UserModule,
        CompanyModule,
        SafeNoteModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    http = setupApp(app);

    userService = app.get(UserService);
    mailService = app.get(MailService);

    requestHelper = new JestRequestHelper(http);

    await app.init();

    // initial setup
    owner = await requestHelper.auth().signUp(DataGenerator.userWithPassword());
    recipient = await requestHelper
      .auth()
      .signUp(DataGenerator.userWithPassword());
    tmView = await requestHelper
      .auth()
      .signUp(DataGenerator.userWithPassword());
    tmEdit = await requestHelper
      .auth()
      .signUp(DataGenerator.userWithPassword());
    tmCreate = await requestHelper
      .auth()
      .signUp(DataGenerator.userWithPassword());

    company = await requestHelper
      .company(owner.accessToken)
      .create(
        DataGenerator.entrepreneurCompany([
          DataGenerator.teamMemberFromUser(tmView.user, Permission.VIEW),
          DataGenerator.teamMemberFromUser(tmEdit.user, Permission.EDIT),
          DataGenerator.teamMemberFromUser(tmCreate.user, Permission.CREATE),
        ]),
      );

    await Promise.all([
      userService.verifyEmail(owner.user.id),
      userService.verifyEmail(tmView.user.id),
      userService.verifyEmail(tmEdit.user.id),
      userService.verifyEmail(tmCreate.user.id),
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create SAFe', () => {
    const ENDPOINT = '/safe-note';

    it.each([
      {
        body: {},
        message: [
          'safeFor should not be empty',
          'recipientEmail should not be empty',
          'safeAmount should not be empty',
          'mfn should not be empty',
        ],
      },
      {
        body: {
          safeFor: SafeFor.ANGEL,
          safeAmount: 10_000,
          recipientEmail: 'mysafenotesuser@mysafenotes.com',
        },
        message: ['mfn should not be empty'],
      },
      {
        body: {
          safeFor: SafeFor.ANGEL,
          safeAmount: 10_000,
          recipientEmail: 'mysafenotesuser@mysafenotes.com',
          recipientName: 'John Doe',
          discountRate: 101,
        },
        message: ['discountRate must not be greater than 100'],
      },
      {
        body: {
          safeFor: SafeFor.ANGEL,
          safeAmount: 10_000,
          recipientEmail: 'mysafenotesuser@mysafenotes.com',
          recipientName: 'John Doe',
          valuationCap: 101,
        },
        message: ['valuationCap must not be empty'],
      },
    ])('should throw error because of invalid data', ({ body, message }) => {
      return request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(owner.accessToken))
        .send({
          ...body,
          senderCompanyId: company.id,
        })
        .expect(400)
        .expect((res) => {
          if (Array.isArray(message)) {
            expect(res.body.message.some((i) => message.includes(i))).toBe(
              true,
            );
          }

          expect(res.body.statusCode).toBe(400);
        });
    });

    it('should not allow to create safe note because user email is not verified', async () => {
      const tempUser = await requestHelper
        .auth()
        .signUp(DataGenerator.userWithPassword());

      // create company
      const testCompany = await requestHelper
        .company(tempUser.accessToken)
        .create(DataGenerator.entrepreneurCompany());

      await request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(tempUser.accessToken))
        .send(DataGenerator.mfnSafeNote(testCompany.id))
        .expect(400);
    });

    it('should not allow to create safe note because user is not belongs to company', async () => {
      const tempUser = await requestHelper
        .auth()
        .signUp(DataGenerator.userWithPassword());

      await request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(tempUser.accessToken))
        .send(DataGenerator.mfnSafeNote(company.id))
        .expect(403);
    });

    it('should not allow to create safe for team member with view/edit permission', async () => {
      await Promise.all(
        [tmView, tmEdit].map((teamMember) => {
          request(http)
            .post(ENDPOINT)
            .set(requestHelper.bearer(teamMember.accessToken))
            .send(DataGenerator.mfnSafeNote(company.id))
            .expect(403);
        }),
      );
    });

    it('should not allow creator to create safe without accepting invite to the team', async () => {
      return request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(tmCreate.accessToken))
        .send({
          senderCompanyId: company.id,
          safeFor: SafeFor.ANGEL,
          safeAmount: 10_000,
          recipientEmail: recipient.user.email,
          recipientName: recipient.user.fullName,
          mfn: true,
        })
        .expect(403);
    });

    it('should allow creator to create safe', async () => {
      await requestHelper
        .company(tmCreate.accessToken)
        .updateTeamMember(company.id, tmCreate.user.id, {
          inviteStatus: InviteStatus.ACCEPTED,
        });

      return request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(tmCreate.accessToken))
        .send({
          senderCompanyId: company.id,
          safeFor: SafeFor.ANGEL,
          safeAmount: 10_000,
          recipientEmail: recipient.user.email,
          recipientName: recipient.user.fullName,
          mfn: true,
        })
        .expect(201);
    });

    it('should create safe note with mfn and send email to users', async () => {
      const sendSafeSentEmailSpy = jest.spyOn(mailService, 'sendSafeSentEmail');
      const newSafeEmailSpy = jest.spyOn(mailService, 'sendNewSafeEmail');

      const response = await request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(owner.accessToken))
        .send({
          senderCompanyId: company.id,
          safeFor: SafeFor.ANGEL,
          safeAmount: 10_000,
          recipientEmail: recipient.user.email,
          recipientName: recipient.user.fullName,
          mfn: true,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.safeFor).toBe(SafeFor.ANGEL);
          expect(body.mfn).toBe(true);
          expect(body.safeAmount).toBe(10_000);
          expect(body.senderCompany.id).toBe(company.id);
          expect(body.discountRate).toBe(null);
          expect(body.valuationCap).toBe(null);
        });

      expect(sendSafeSentEmailSpy).toHaveBeenCalledWith({
        to: owner.user.email,
        userName: owner.user.fullName,
        safeNoteId: response.body.id,
        safeTo: recipient.user.fullName,
        safeToEmail: recipient.user.email,
        isMfn: response.body.mfn,
        safeAmount: response.body.safeAmount,
        discountRate: response.body.discountRate,
        valuationCap: response.body.valuationCap,
      });

      expect(newSafeEmailSpy).toHaveBeenCalledWith({
        to: recipient.user.email,
        userName: recipient.user.fullName,
        safeNoteId: response.body.id,
        safeFrom: owner.user.fullName,
        safeFromEmail: owner.user.email,
        safeFromImage: null,
        isMfn: response.body.mfn,
        safeAmount: response.body.safeAmount,
        discountRate: response.body.discountRate,
        valuationCap: response.body.valuationCap,
        companyName: company.name,
        companyImage: company.image,
        isUserActive: true,
      });

      const safeNotes = await requestHelper.safeNote().getAll({
        entrepreneurCompanyId: company.id,
      });

      expect(safeNotes.length).toBe(2);
      expect(safeNotes[0].senderCompany).toBeDefined();
      expect(safeNotes[0].senderCompany).not.toBe(null);
    });

    it('should create safe note with sender signature', async () => {
      const SIGNATURE_FILE = join(__dirname, '..', 'static/logo.png');

      await request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(owner.accessToken))
        .field('senderCompanyId', company.id)
        .field('recipientEmail', recipient.user.email)
        .field('recipientName', recipient.user.fullName)
        .field('safeFor', SafeFor.ANGEL)
        .field('safeAmount', 10_000)
        .field('mfn', true)
        .attach('senderSignature', SIGNATURE_FILE, {
          contentType: 'multipart/form-data',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.safeFor).toBe(SafeFor.ANGEL);
          expect(body.mfn).toBe(true);
          expect(body.senderCompany.id).toBe(company.id);
          expect(body.senderSignature).toBeDefined();
        });
    });

    it('should not create safe with non existed term sheet', async () => {
      return request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(owner.accessToken))
        .send(
          DataGenerator.mfnSafeNote(company.id, {
            termSheetId: '30c48208-243a-4f25-ad39-31d104271026',
          }),
        )
        .expect(404);
    });

    it('should create safe with term sheet id', async () => {
      const randomDude = await requestHelper.auth().signUpRandomUser();

      const termSheet = await requestHelper
        .termSheet(owner.accessToken)
        .create({
          senderCompanyId: company.id,
          mfn: true,
          recipients: [randomDude.user.email],
        });

      return request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(owner.accessToken))
        .send(
          DataGenerator.mfnSafeNote(company.id, {
            termSheetId: termSheet.id,
            recipientEmail: randomDude.user.email,
          }),
        )
        .expect(201)
        .expect(({ body }) => {
          expect(body.termSheetId).toBe(termSheet.id);
          expect(body.termSheet).toBeDefined();
        });
    });

    it('should create safe and ignore term sheet if safe recipient is not included in term sheet recipients', async () => {
      const randomDude = await requestHelper.auth().signUpRandomUser();

      const termSheet = await requestHelper
        .termSheet(owner.accessToken)
        .create({
          senderCompanyId: company.id,
          mfn: true,
          recipients: [randomDude.user.email],
        });

      return request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(owner.accessToken))
        .send(
          DataGenerator.mfnSafeNote(company.id, {
            termSheetId: termSheet.id,
            recipientEmail: recipient.user.email,
          }),
        )
        .expect(201)
        .expect(({ body }) => {
          expect(body.termSheetId).toBe(null);
          expect(body.termSheet).toBe(null);
        });
    });
  });

  describe('Create Payment Intent', () => {
    const ENDPOINT = '/safe-note/:id/payment-intent';

    let safeNote: SafeNoteEntity;
    beforeAll(async () => {
      safeNote = await requestHelper
        .safeNote(owner.accessToken)
        .create(DataGenerator.mfnSafeNote(company.id));
    });

    it('should not allow team members to reach this endpoint', async () => {
      await Promise.all(
        [tmView, tmEdit, tmCreate].map((teamMember) =>
          request(http)
            .post(UrlUtils.withParams(ENDPOINT, { id: safeNote.id }))
            .set(requestHelper.bearer(teamMember.accessToken))
            .expect(403),
        ),
      );
    });

    it.each([null, undefined, '', '    '])(
      'should throw 400 because payAs is invalid',
      async (payAs) => {
        return request(http)
          .post(UrlUtils.withParams(ENDPOINT, { id: safeNote.id }))
          .set(requestHelper.bearer(owner.accessToken))
          .send({
            payAs,
          })
          .expect(400);
      },
    );

    it('should return payment intent with right amount', async () => {
      const fee = await requestHelper
        .safeNote(owner.accessToken)
        .getFee(safeNote.id);

      PaymentService.prototype.createPaymentIntent = jest
        .fn()
        .mockResolvedValue({
          clientSecret: faker.string.uuid(),
          payment: {
            amount: safeNote.safeAmount + fee.totalFee,
            status: PaymentStatus.CREATED,
          },
        });

      return request(http)
        .post(UrlUtils.withParams(ENDPOINT, { id: safeNote.id }))
        .set(requestHelper.bearer(owner.accessToken))
        .send({
          payAs: PayAs.ANGEL,
          type: PaymentType.CARD,
          cardNumber: String(4242_4242_4242_4242),
          cvv: 333,
          expirationMonth: 10,
          expirationYear: 2033,
        })
        .expect(({ body }) => {
          expect(body.clientSecret).toBeDefined();
          expect(body.payment).toBeDefined();
          expect(body.payment.amount).toBe(safeNote.safeAmount + fee.totalFee);
          expect(body.payment.status).toBe(PaymentStatus.CREATED);
        })
        .expect(201);
    });
  });

  describe('Get SAFE by ID', () => {
    const ENDPOINT = '/safe-note/:id';

    let safeNote: SafeNoteEntity;

    beforeAll(async () => {
      safeNote = await requestHelper
        .safeNote(owner.accessToken)
        .create(DataGenerator.mfnSafeNote(company.id));
    });

    it.each([undefined, null, faker.word.verb()])(
      'should throw bad request exception because of invalid uuid',
      (id) => {
        return request(http)
          .get(UrlUtils.withParams(ENDPOINT, { id: id }))
          .set(requestHelper.bearer(owner.accessToken))
          .expect(400);
      },
    );

    it('should return safe note by id', () => {
      return request(http)
        .get(UrlUtils.withParams(ENDPOINT, { id: safeNote.id }))
        .set(requestHelper.bearer(owner.accessToken))
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(safeNote.id);
        });
    });
  });

  describe('Sign SAFE', () => {
    const ENDPOINT = '/safe-note/:id/sign';
    const SIGNATURE_FILE = join(__dirname, '..', 'static/logo.png');

    let randomDude;
    let safeNote: SafeNoteEntity;

    beforeAll(async () => {
      randomDude = await requestHelper
        .auth()
        .signUp(DataGenerator.userWithPassword());

      safeNote = await requestHelper.safeNote(owner.accessToken).create(
        DataGenerator.mfnSafeNote(company.id, {
          recipientEmail: recipient.user.email,
        }),
      );
    });

    it.each([
      {
        body: {},
        expectedStatusCode: 400,
        message: [
          'signAs should not be empty',
          'signAs must be a valid enum value',
          'name should not be empty',
        ],
      },
      {
        body: {
          signAs: SignSafeAs.SENDER,
          name: faker.person.fullName(),
          signature: null,
        },
        expectedStatusCode: 400,
        message: 'No file uploaded',
      },
    ])(
      'should throw bad request exception because of invalid data ',
      async ({ body, expectedStatusCode, message }) => {
        return request(http)
          .post(UrlUtils.withParams(ENDPOINT, { id: safeNote.id }))
          .set(requestHelper.bearer(owner.accessToken))
          .field('signAs', body.signAs || '')
          .field('name', body.name || '')
          .attach('signature', undefined, {
            contentType: 'multipart/form-data',
          })
          .expect(expectedStatusCode)
          .expect((res) => {
            if (typeof message === 'string' && message.trim()) {
              expect(res.body.message).toContain(message);
            }

            if (Array.isArray(message)) {
              expect(res.body.message.some((i) => message.includes(i))).toBe(
                true,
              );
            }
            expect(res.body.statusCode).toBe(expectedStatusCode);
          });
      },
    );

    it.each([SignSafeAs.RECIPIENT, SignSafeAs.SENDER])(
      'should not allow to sign as recipient/sender unless it is himself',
      async (signAs) => {
        const tempUser = await requestHelper
          .auth()
          .signUp(DataGenerator.userWithPassword());

        await request(http)
          .post(UrlUtils.withParams(ENDPOINT, { id: safeNote.id }))
          .set(requestHelper.bearer(tempUser.accessToken))
          .field('signAs', signAs)
          .field('name', faker.person.fullName())
          .attach('signature', SIGNATURE_FILE, {
            contentType: 'multipart/form-data',
          })
          .expect(403);

        await userService.deleteBy('email', tempUser.user.email);
      },
    );

    it('should not allow to sign safe as sender/recipient for team members', async () => {
      const runRequestWithSignAs = (teamMember: any, signAs: any) => {
        return request(http)
          .post(UrlUtils.withParams(ENDPOINT, { id: safeNote.id }))
          .set(requestHelper.bearer(teamMember.accessToken))
          .field('signAs', signAs)
          .field('name', faker.person.fullName())
          .attach('signature', SIGNATURE_FILE, {
            contentType: 'multipart/form-data',
          })
          .expect(403);
      };

      const teamMembers = [tmView, tmEdit, tmCreate];

      await Promise.all([
        teamMembers.map((teamMember) =>
          runRequestWithSignAs(teamMember, SignSafeAs.SENDER),
        ),
        teamMembers.map((teamMember) =>
          runRequestWithSignAs(teamMember, SignSafeAs.RECIPIENT),
        ),
      ]);
    });

    it.each([
      {
        signAs: SignSafeAs.SENDER,
        expectedStatusCode: 201,
        message: 'allow profile owner to sign safe',
        userIndex: 0,
      },
      {
        signAs: SignSafeAs.RECIPIENT,
        expectedStatusCode: 403,
        message: 'not allow profile owner to sign as recipient',
        userIndex: 0,
      },
      {
        signAs: SignSafeAs.SENDER,
        expectedStatusCode: 403,
        message: 'not allow recipient to sign as profile owner',
        userIndex: 1,
      },
      {
        signAs: SignSafeAs.RECIPIENT,
        expectedStatusCode: 201,
        message: 'allow recipient to sign as recipient',
        userIndex: 1,
      },
      {
        signAs: SignSafeAs.RECIPIENT,
        expectedStatusCode: 403,
        message: 'not allow some random dude to sign as recipient',
        userIndex: 2,
      },
      {
        signAs: SignSafeAs.SENDER,
        expectedStatusCode: 403,
        message: 'not allow some random dude to sign as sender',
        userIndex: 2,
      },
    ])('should $message', async ({ signAs, expectedStatusCode, userIndex }) => {
      const user = [owner, recipient, randomDude][userIndex];

      const sendSignedSafeEmail = jest.spyOn(
        mailService,
        'sendSignedSafeEmail',
      );

      await request(http)
        .post(UrlUtils.withParams(ENDPOINT, { id: safeNote.id }))
        .set(requestHelper.bearer(user.accessToken))
        .field('signAs', signAs)
        .field('name', faker.person.fullName())
        .attach('signature', SIGNATURE_FILE, {
          contentType: 'multipart/form-data',
        })
        .expect(expectedStatusCode)
        .expect(({ body }) => {
          if (expectedStatusCode === 201 && signAs == SignSafeAs.SENDER) {
            expect(body.senderSignature).toBeDefined();
            expect(body.senderSignature).not.toBeNull();
          }

          if (expectedStatusCode === 201 && signAs == SignSafeAs.RECIPIENT) {
            expect(body.recipientSignature).toBeDefined();
            expect(body.recipientSignature).not.toBeNull();
          }
        });

      if (signAs === SignSafeAs.RECIPIENT && expectedStatusCode === 201) {
        expect(sendSignedSafeEmail).toHaveBeenCalledWith({
          safeNoteId: safeNote.id,
          to: owner.user.email,
          userName: owner.user.fullName,
        });
      }
    });
  });

  describe('Update SAFE', () => {
    // const ENDPOINT = '/safe-note/:id';
    // it('should update safe note and return new data', async () => {
    //   return request(http)
    //     .patch(UrlUtils.withParams(ENDPOINT, { id: safeNoteId }))
    //     .set('Authorization', toBearerToken(accessToken))
    //     .send();
    // });
  });

  describe('Assign company to SAFE', () => {
    const ENDPOINT = '/safe-note/:safeNoteId/assign-company/:companyId';

    let owner, recipient, teamMember, randomDude, company, safeNote;

    beforeAll(async () => {
      owner = await requestHelper
        .auth()
        .signUp(DataGenerator.userWithPassword());
      recipient = await requestHelper
        .auth()
        .signUp(DataGenerator.userWithPassword());
      teamMember = await requestHelper
        .auth()
        .signUp(DataGenerator.userWithPassword());
      randomDude = await requestHelper
        .auth()
        .signUp(DataGenerator.userWithPassword());

      await Promise.all([
        userService.verifyEmail(owner.user.id),
        userService.verifyEmail(recipient.user.id),
        userService.verifyEmail(teamMember.user.id),
        userService.verifyEmail(randomDude.user.id),
      ]);

      company = await requestHelper
        .company(owner.accessToken)
        .create(
          DataGenerator.entrepreneurCompany([
            DataGenerator.teamMemberFromUser(teamMember.user),
          ]),
        );

      safeNote = await requestHelper.safeNote(owner.accessToken).create(
        DataGenerator.mfnSafeNote(company.id, {
          recipientEmail: recipient.user.email,
        }),
      );
    });

    it('should not allow to reach this endpoint for anyone except recipient', async () => {
      await Promise.all(
        [teamMember, owner].map((auth) => {
          return request(http)
            .post(
              UrlUtils.withParams(ENDPOINT, {
                safeNoteId: safeNote.id,
                companyId: company.id,
              }),
            )
            .set(requestHelper.bearer(auth.accessToken))
            .expect(403);
        }),
      );
    });

    it.each([
      {
        safeNoteId: undefined,
        companyId: undefined,
      },
      {
        safeNoteId: null,
        companyId: null,
      },
      {
        safeNoteId: 'stain',
        companyId: 'loyaly',
      },
    ])(
      'should throw 404 error as params is invalid',
      async ({ safeNoteId, companyId }) => {
        return request(http)
          .post(
            UrlUtils.withParams(ENDPOINT, {
              safeNoteId,
              companyId,
            }),
          )
          .set(requestHelper.bearer(recipient.accessToken))
          .expect(400);
      },
    );

    it('should throw 404 as route cannot be accessed', async () => {
      return request(http)
        .post(
          UrlUtils.withParams(ENDPOINT, {
            safeNoteId: '',
            companyId: '',
          }),
        )
        .set(requestHelper.bearer(recipient.accessToken))
        .expect(404);
    });

    it('should throw 404 as safeNote or company is not exist', async () => {
      return request(http)
        .post(
          UrlUtils.withParams(ENDPOINT, {
            safeNoteId: '0992d14a-8000-43b9-9352-12ecf3782f23',
            companyId: 'd71d3318-9c68-4659-9410-0c4a4b8d44cb',
          }),
        )
        .set(requestHelper.bearer(recipient.accessToken))
        .expect(404);
    });

    it('should throw 400 as company is not angel type', async () => {
      const randomCompany = await requestHelper
        .company(recipient.accessToken)
        .create(DataGenerator.entrepreneurCompany());

      return request(http)
        .post(
          UrlUtils.withParams(ENDPOINT, {
            safeNoteId: safeNote.id,
            companyId: randomCompany.id,
          }),
        )
        .set(requestHelper.bearer(recipient.accessToken))
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toBe(
            `Invalid company type: <${randomCompany.type}>. SAFE can only be assigned with <angel> company`,
          );
        });
    });

    it('should throw 403 as angel company is belongs to recipient', async () => {
      const randomAngelCompany = await requestHelper
        .company(randomDude.accessToken)
        .create(DataGenerator.angelCompany());

      return request(http)
        .post(
          UrlUtils.withParams(ENDPOINT, {
            safeNoteId: safeNote.id,
            companyId: randomAngelCompany.id,
          }),
        )
        .set(requestHelper.bearer(recipient.accessToken))
        .expect(403);
    });

    it('should assign angel company to SAFE', async () => {
      const angelCompany = await requestHelper
        .company(recipient.accessToken)
        .create(DataGenerator.angelCompany());

      return request(http)
        .post(
          UrlUtils.withParams(ENDPOINT, {
            safeNoteId: safeNote.id,
            companyId: angelCompany.id,
          }),
        )
        .set(requestHelper.bearer(recipient.accessToken))
        .expect(204);
    });

    it('should throw 400 as SAFE already assigned to company angel company to SAFE', async () => {
      const angelCompany = await requestHelper
        .company(recipient.accessToken)
        .create(DataGenerator.angelCompany());

      return request(http)
        .post(
          UrlUtils.withParams(ENDPOINT, {
            safeNoteId: safeNote.id,
            companyId: angelCompany.id,
          }),
        )
        .set(requestHelper.bearer(recipient.accessToken))
        .expect(400)
        .expect(({ body }) => {
          expect(body.message).toBe(
            'SAFE note has already been assigned to a company!',
          );
        });
    });
  });

  describe('Get pending SAFEs', () => {
    const ENDPOINT = '/safe-note/pending-safes';

    let user1: AuthResponse, user2: AuthResponse;

    beforeAll(async () => {
      user1 = await requestHelper
        .auth()
        .signUp(DataGenerator.userWithPassword());
      user2 = await requestHelper
        .auth()
        .signUp(DataGenerator.userWithPassword());

      return Promise.all([
        userService.verifyEmail(user1.user.id),
        userService.verifyEmail(user2.user.id),
      ]);
    });

    it('should create company for user1 and send 2 SAFE to user2', async () => {
      const company = await requestHelper
        .company(user1.accessToken)
        .create(DataGenerator.entrepreneurCompany());

      return Promise.all([
        requestHelper.safeNote(user1.accessToken).create(
          DataGenerator.mfnSafeNote(company.id, {
            recipientEmail: user2.user.email,
          }),
        ),
        requestHelper.safeNote().create(
          DataGenerator.mfnSafeNote(company.id, {
            recipientEmail: user2.user.email,
          }),
        ),
      ]);
    });

    it('should have 2 pending safes for user2', () => {
      return request(http)
        .get(ENDPOINT)
        .set(requestHelper.bearer(user2.accessToken))
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveLength(2);
        });
    });

    it('should not have any pending safes', async () => {
      const angelCompany = await requestHelper
        .company(user2.accessToken)
        .create(DataGenerator.angelCompany());

      const pendingSafes = await requestHelper
        .safeNote(user2.accessToken)
        .getPendingSafe();

      expect(pendingSafes.length).toBe(2);

      await Promise.all(
        pendingSafes.map((safeNote) =>
          requestHelper.safeNote().assignCompany(safeNote.id, angelCompany.id),
        ),
      );

      return request(http)
        .get(ENDPOINT)
        .set(requestHelper.bearer(user2.accessToken))
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveLength(0);
        });
    });
  });

  describe('Delete SAFE', () => {
    const ENDPOINT = '/safe-note/:id';

    let safeNoteToDelete: SafeNoteEntity;
    let safeNoteToDelete2: SafeNoteEntity;

    beforeAll(async () => {
      [safeNoteToDelete, safeNoteToDelete2] = await Promise.all([
        await requestHelper
          .safeNote(owner.accessToken)
          .create(DataGenerator.mfnSafeNote(company.id)),
        await requestHelper
          .safeNote(owner.accessToken)
          .create(DataGenerator.mfnSafeNote(company.id)),
      ]);
    });

    it('should throw 403 as these users cannot delete the safe', async () => {
      await Promise.all(
        [tmView, tmEdit, recipient].map((auth) => {
          return request(http)
            .delete(UrlUtils.withParams(ENDPOINT, { id: safeNoteToDelete.id }))
            .set(requestHelper.bearer(auth.accessToken))
            .expect(403);
        }),
      );
    });

    it('should allow creator to delete', async () => {
      return request(http)
        .delete(UrlUtils.withParams(ENDPOINT, { id: safeNoteToDelete2.id }))
        .set(requestHelper.bearer(tmCreate.accessToken))
        .expect(204);
    });

    it('should allow owner to delete', async () => {
      return request(http)
        .delete(UrlUtils.withParams(ENDPOINT, { id: safeNoteToDelete.id }))
        .set(requestHelper.bearer(owner.accessToken))
        .expect(204);
    });
  });
});
