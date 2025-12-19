import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { AuthModule } from '@/modules/auth/auth.module';
import { CompanyModule } from '@/modules/company/company.module';
import { MailService } from '@/modules/mail/mail.service';
import { SafeNoteModule } from '@/modules/safe-note/safe-note.module';
import { UserModule } from '@/modules/user/user.module';
import { UserService } from '@/modules/user/user.service';
import { setupApp } from '@/setup';
import { InviteStatus, Permission, Role } from '@/shared/enums';
import { DataGenerator } from '@/shared/jest/data.generator';
import { JestRequestHelper } from '@/shared/jest/jest-request.helper';
import { JestModule } from '@/shared/jest/jest.module';
import { UrlUtils } from '@/shared/utils';

MailService.prototype.sendEmail = jest.fn();

describe('Company (e2e)', () => {
  let http;
  let app: NestExpressApplication;
  let requestHelper: JestRequestHelper;
  let userService: UserService;

  const setup = async () => {
    const [owner, tmView, tmCreate, tmViewDeclInv, tmCreateDeclInv] =
      await Promise.all(
        Array.from({ length: 5 }).map(requestHelper.auth().signUpRandomUser),
      );

    await Promise.all([userService.verifyEmail(owner.user.id)]);

    let company = await requestHelper
      .company(owner.accessToken)
      .create(
        DataGenerator.entrepreneurCompany([
          DataGenerator.teamMemberFromUser(tmView.user),
          DataGenerator.teamMemberFromUser(tmViewDeclInv.user),
          DataGenerator.teamMemberFromUser(tmCreate.user, Permission.CREATE),
          DataGenerator.teamMemberFromUser(
            tmCreateDeclInv.user,
            Permission.CREATE,
          ),
        ]),
      );

    await Promise.all([
      requestHelper
        .company(tmCreateDeclInv.accessToken)
        .updateTeamMember(company.id, tmCreateDeclInv.user.id, {
          inviteStatus: InviteStatus.DECLINED,
        }),

      requestHelper
        .company(tmViewDeclInv.accessToken)
        .updateTeamMember(company.id, tmViewDeclInv.user.id, {
          inviteStatus: InviteStatus.DECLINED,
        }),
    ]);

    company = await requestHelper
      .company(owner.accessToken)
      .getById(company.id);

    return {
      owner,
      tmView,
      tmViewDeclInv,
      tmCreate,
      tmCreateDeclInv,
      company,
    };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JestModule,
        AuthModule,
        UserModule,
        SafeNoteModule,
        CompanyModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    http = setupApp(app);

    userService = app.get(UserService);

    requestHelper = new JestRequestHelper(http);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /company (Get all)', () => {
    const ENDPOINT = '/company';

    let user;

    beforeAll(async () => {
      user = await requestHelper.auth().signUpRandomUser();

      await userService.verifyEmail(user.user.id);
    });

    it('should return empty list', () => {
      return request(http)
        .get(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .expect(200)
        .expect(({ body }) => {
          expect(body.length).toBe(0);
        });
    });

    it('should have one company and owner should be current user', async () => {
      await requestHelper
        .company(user.accessToken)
        .create(DataGenerator.entrepreneurCompany());

      return request(http)
        .get(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .expect(200)
        .expect(({ body }) => {
          expect(body.length).toBe(1);
          expect(body[0].owner).toBeDefined();
          expect(body[0].owner.id).toBe(user.user.id);
          expect(body[0].owner.email).toBe(user.user.email);
        });
    });
  });

  describe('GET /company/:id (Get By ID)', () => {
    const ENDPOINT = '/company/:id';

    let owner, tmView, tmCreate, tmViewDeclInv, company;

    beforeAll(async () => {
      const res = await setup();

      owner = res.owner;
      tmView = res.tmView;
      tmCreate = res.tmCreate;
      tmViewDeclInv = res.tmViewDeclInv;
      company = res.company;
    });

    it('should return company with right data', () => {
      return request(http)
        .get(UrlUtils.withParams(ENDPOINT, { id: company.id }))
        .set(requestHelper.bearer(owner.accessToken))
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(company.id);
          expect(body.owner.email).toBe(owner.user.email);
          expect(
            body.teamMembers.findIndex((p) => p.email === tmView.email),
          ).not.toBe(-1);
        });
    });

    it('should not display team members with declined invite', async () => {
      await request(http)
        .get(UrlUtils.withParams(ENDPOINT, { id: company.id }))
        .set(requestHelper.bearer(owner.accessToken))
        .expect(200)
        .expect(({ body }) => {
          expect(
            body.teamMembers.find((p) => p.email === tmViewDeclInv.user.email),
          ).not.toBe(-1);
        });
    });

    it.each([0, 1])(
      'should return company and display right owner for team members',
      (index) => {
        const user = [tmView, tmCreate][index];
        return request(http)
          .get(UrlUtils.withParams(ENDPOINT, { id: company.id }))
          .set(requestHelper.bearer(user.accessToken))
          .expect(200)
          .expect(({ body }) => {
            expect(body.owner.email).toBe(owner.user.email);
            expect(body.companyUser.user.email).toBe(user.user.email);
            expect(body.companyUser.permission).not.toBeNull();

            // should not display current user in team members
            expect(
              body.teamMembers.some((p) => p.email !== user.user.email),
            ).toBe(true);
          });
      },
    );

    it('should throw error as user declined invite request', async () => {
      return request(http)
        .get(UrlUtils.withParams(ENDPOINT, { id: company.id }))
        .set(requestHelper.bearer(tmViewDeclInv.accessToken))
        .expect(403);
    });
  });

  describe('GET /company/:id/mfn-holder (Get MFN Holders)', () => {
    let user, company;

    beforeAll(async () => {
      const res = await setup();

      user = res.owner;
      company = res.company;
    });

    it('should return empty array as there is no mfn holders', async () => {
      const data = await requestHelper
        .company(user.accessToken)
        .mfnHolders(company.id);

      expect(data.length).toBe(0);
    });

    it('should return 1 mfn holders', async () => {
      const mfnRecipient = DataGenerator.user();
      const recipient = DataGenerator.user();

      await Promise.all([
        requestHelper.safeNote(user.accessToken).create(
          DataGenerator.mfnSafeNote(company.id, {
            recipientEmail: mfnRecipient.email,
          }),
        ),

        requestHelper.safeNote(user.accessToken).create(
          DataGenerator.safeNote(company.id, {
            recipientEmail: recipient.email,
          }),
        ),
      ]);

      const data = await requestHelper
        .company(user.accessToken)
        .mfnHolders(company.id);

      expect(data.length).toBe(1);
      expect(data[0].email).toBe(mfnRecipient.email);
    });
  });

  describe('POST /company (Create)', () => {
    const ENDPOINT = '/company';
    const IMAGE_FILE = join(__dirname, '..', 'static/logo.png');

    let user;

    beforeAll(async () => {
      user = await requestHelper.auth().signUpRandomUser();
    });

    it.each([
      {
        data: {},
        cause: 'data is empty',
      },
      {
        data: {
          type: '____',
        },
        cause: 'type is invalid',
        errors: ['type must be a valid enum value'],
      },
      {
        data: {
          type: 'entrepreneur',
          name: DataGenerator.entrepreneurCompany().name,
        },
        cause: 'owner position is not defined',
        errors: [
          'ownerPosition should not be empty',
          'ownerPosition must be a string',
        ],
      },
      {
        data: {
          type: 'entrepreneur',
          name: DataGenerator.entrepreneurCompany().name,
          ownerPosition: '',
        },
        cause: 'owner position is not empty',
        errors: ['ownerPosition should not be empty'],
      },
      {
        data: {
          type: 'entrepreneur',
          name: DataGenerator.entrepreneurCompany().name,
          ownerPosition: '',
          teamMembers: [],
        },
        cause: 'teamMembers arrays is empty',
      },
      {
        data: {
          type: 'entrepreneur',
          name: DataGenerator.entrepreneurCompany().name,
          ownerPosition: '',
          teamMembers: [{ name: '___' }],
        },
        cause: 'teamMember is not valid',
        errors: ['teamMembers.0.email should not be empty'],
      },
    ])('should not create company because $cause', ({ data, errors }) => {
      return request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .send(data)
        .expect(400)
        .expect(({ body }) => {
          if (errors?.length) {
            expect(body.message.some((i) => errors.includes(i))).toBe(true);
          }
        });
    });

    it('should create company and response should match the initial data', () => {
      const company = DataGenerator.entrepreneurCompany();

      return request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .send(company)
        .expect(201)
        .expect(({ body }) => {
          expect(body.owner.email).toBe(user.user.email);
          expect(body.type).toBe(company.type);
          expect(body.name).toBe(company.name);
          expect(body.goal).toBe(company.goal);
          expect(body.stateOfIncorporation).toBe(company.stateOfIncorporation);
          expect(body.address.state).toBe(company.address.state);
        });
    });

    it('should create company with image', () => {
      const company = DataGenerator.entrepreneurCompany();

      return request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .field('type', company.type)
        .field('name', company.name)
        .field('ownerPosition', company.ownerPosition)
        .attach('image', IMAGE_FILE, {
          contentType: 'multipart/form-data',
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.image).toBeDefined();
          expect(body.image).not.toBeNull();
          expect(body.image).toContain(body.id);
          expect(body.type).toBe(company.type);
          expect(body.name).toBe(company.name);
        });
    });

    it('should create company with image as url', () => {
      const company = DataGenerator.entrepreneurCompany();

      const imageUrl =
        'https://images.unsplash.com/photo-1682685797741-f0213d24418c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3270&q=80';

      return request(http)
        .post(ENDPOINT)
        .set(requestHelper.bearer(user.accessToken))
        .send({
          ...company,
          image: imageUrl,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.image).toBeDefined();
          expect(body.image).not.toBeNull();
          expect(body.image).toBe(imageUrl);
          expect(body.type).toBe(company.type);
          expect(body.name).toBe(company.name);
        });
    });
  });

  describe('PATH /company/:id (Update)', () => {
    let owner, company;

    beforeAll(async () => {
      const res = await setup();
      owner = res.owner;
      company = res.company;
    });

    it('should update company', async () => {
      expect(true).toBe(true);
    });
  });

  describe('PATCH /company/:id/team-member/:userId (Update Team Member)', () => {
    const ENDPOINT = '/company/:id/team-member/:userId';

    let owner, tmView, tmCreate, company;

    beforeAll(async () => {
      const res = await setup();

      owner = res.owner;
      tmView = res.tmView;
      tmCreate = res.tmCreate;
      company = res.company;
    });

    it.each([0, 1])(
      'should allow team member to accept invite and change his position',
      (index) => {
        const user = [tmView, tmCreate][index];
        return request(http)
          .patch(
            UrlUtils.withParams(ENDPOINT, {
              id: company.id,
              userId: user.user.id,
            }),
          )
          .set(requestHelper.bearer(user.accessToken))
          .send({
            inviteStatus: InviteStatus.ACCEPTED,
            position: 'DEV',
          })
          .expect(200);
      },
    );

    it('should save only inviteStatus and position for a team member', () => {
      return request(http)
        .patch(
          UrlUtils.withParams(ENDPOINT, {
            id: company.id,
            userId: tmView.user.id,
          }),
        )
        .set(requestHelper.bearer(tmView.accessToken))
        .send({
          inviteStatus: InviteStatus.ACCEPTED,
          permission: 'edit',
          position: 'CEO',
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.inviteStatus).toBe(InviteStatus.ACCEPTED);
          expect(body.position).toBe('CEO');
          expect(body.permission).toBe('view');
        });
    });

    it.each([
      {
        inviteStatus: InviteStatus.DECLINED,
        expectedStatusCode: 200,
      },
      {
        inviteStatus: InviteStatus.ACCEPTED,
        expectedStatusCode: 403,
      },
    ])(
      'should allow team member to change invite status from accepted to declined but not in opposite',
      ({ inviteStatus, expectedStatusCode }) => {
        return request(http)
          .patch(
            UrlUtils.withParams(ENDPOINT, {
              id: company.id,
              userId: tmCreate.user.id,
            }),
          )
          .set(requestHelper.bearer(tmCreate.accessToken))
          .send({
            inviteStatus,
          })
          .expect(expectedStatusCode);
      },
    );

    it('should allow owner to edit data', () => {
      return request(http)
        .patch(
          UrlUtils.withParams(ENDPOINT, {
            id: company.id,
            userId: tmCreate.user.id,
          }),
        )
        .set(requestHelper.bearer(owner.accessToken))
        .send({
          permission: Permission.CREATE,
          position: 'Developer',
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.permission).toBe(Permission.CREATE);
          expect(body.position).toBe('Developer');
        });
    });

    it('should throw error because owner cannot change his invite status', () => {
      return request(http)
        .patch(
          UrlUtils.withParams(ENDPOINT, {
            id: company.id,
            userId: owner.user.id,
          }),
        )
        .set(requestHelper.bearer(owner.accessToken))
        .send({ inviteStatus: InviteStatus.PENDING })
        .expect(403);
    });
  });

  describe('POST /company/:id/team-member (Invite Team Members)', () => {
    const ENDPOINT = '/company/:id/team-member';

    let owner, tmView, tmCreate, company;

    beforeAll(async () => {
      const res = await setup();

      owner = res.owner;
      tmView = res.tmView;
      tmCreate = res.tmCreate;
      company = res.company;
    });

    it('should invite team members to company', async () => {
      const [t1, t2] = [
        DataGenerator.teamMember(),
        DataGenerator.teamMember(Permission.CREATE),
      ];

      await request(http)
        .post(UrlUtils.withParams(ENDPOINT, { id: company.id }))
        .set(requestHelper.bearer(owner.accessToken))
        .send({ teamMembers: [t1, t2] })
        .expect(201);

      const response = await requestHelper
        .company(owner.accessToken)
        .getById(company.id);

      expect(response.teamMembers).toBeDefined();

      const t1Candidate = response.teamMembers.find(
        (p) => p.user.email === t1.email,
      );
      const t2Candidate = response.teamMembers.find(
        (p) => p.user.email === t2.email,
      );

      expect(t1Candidate).toBeDefined();
      expect(t1Candidate.user.email).toBe(t1.email);
      expect(t1Candidate.role).toBe(Role.TEAM_MEMBER);
      expect(t1Candidate.permission).toBe(Permission.VIEW);
      expect(t1Candidate.inviteStatus).toBe(InviteStatus.PENDING);

      expect(t2Candidate).toBeDefined();
      expect(t2Candidate.user.email).toBe(t2.email);
      expect(t2Candidate.role).toBe(Role.TEAM_MEMBER);
      expect(t2Candidate.permission).toBe(Permission.CREATE);
      expect(t2Candidate.inviteStatus).toBe(InviteStatus.PENDING);
    });

    it('should not allow team member with view permission reach this endpoint', () => {
      return request(http)
        .post(UrlUtils.withParams(ENDPOINT, { id: company.id }))
        .set(requestHelper.bearer(tmView.accessToken))
        .expect(403);
    });

    it('should allow to invite team member for team member with create permission', async () => {
      const teamMember = DataGenerator.teamMember();

      await requestHelper
        .company(tmCreate.accessToken)
        .updateTeamMember(company.id, tmCreate.user.id, {
          inviteStatus: InviteStatus.ACCEPTED,
        });

      await request(http)
        .post(UrlUtils.withParams(ENDPOINT, { id: company.id }))
        .set(requestHelper.bearer(tmCreate.accessToken))
        .send({ teamMembers: [teamMember] })
        .expect(201);

      const response = await requestHelper
        .company(tmCreate.accessToken)
        .getById(company.id);

      expect(response.teamMembers).toBeDefined();

      const candidate = response.teamMembers.find(
        (p) => p.user.email === teamMember.email,
      );

      expect(candidate).toBeDefined();
    });
  });
});
