import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';

import { AuthModule } from '@/modules/auth/auth.module';
import { AuthResponse } from '@/modules/auth/types';
import { CompanyModule } from '@/modules/company/company.module';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { MailService } from '@/modules/mail/mail.service';
import { CreateTermSheetDto } from '@/modules/term-sheet/dto/create-term-sheet.dto';
import { TermSheetEntity } from '@/modules/term-sheet/entity/term-sheet.entity';
import { SafeProgress } from '@/modules/term-sheet/enums';
import { TermSheetModule } from '@/modules/term-sheet/term-sheet.module';
import { UserModule } from '@/modules/user/user.module';
import { UserService } from '@/modules/user/user.service';
import { setupApp } from '@/setup';
import { DataGenerator } from '@/shared/jest/data.generator';
import { JestRequestHelper } from '@/shared/jest/jest-request.helper';
import { JestModule } from '@/shared/jest/jest.module';

MailService.prototype.sendEmail = jest.fn();

describe('Term Sheet (e2e)', () => {
  let http;
  let app: NestExpressApplication;
  let requestHelper: JestRequestHelper;
  let userService: UserService;

  const setup = async () => {
    const [owner, recipient] = await Promise.all(
      Array.from({ length: 2 }).map(requestHelper.auth().signUpRandomUser),
    );

    await Promise.all([userService.verifyEmail(owner.user.id)]);

    let company = await requestHelper
      .company(owner.accessToken)
      .create(DataGenerator.entrepreneurCompany());

    company = await requestHelper
      .company(owner.accessToken)
      .getById(company.id);

    return {
      owner,
      recipient,
      company,
    };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JestModule,
        AuthModule,
        UserModule,
        CompanyModule,
        TermSheetModule,
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

  describe('Get All Term Sheet', () => {
    let owner: AuthResponse, recipient: AuthResponse, company: CompanyEntity;

    beforeAll(async () => {
      const res = await setup();

      owner = res.owner;
      recipient = res.recipient;
      company = res.company;

      requestHelper.setToken(owner.accessToken);

      const data: CreateTermSheetDto = {
        senderCompanyId: company.id,
        mfn: true,
        recipients: [recipient.user.email],
      };

      await Promise.all([
        requestHelper.termSheet().create(data),
        requestHelper.termSheet().create(data),
      ]);
    });

    it('should return empty list as filters is not provided', async () => {
      const termSheetList = await requestHelper.termSheet().getAll();

      expect(termSheetList.length).toBe(0);
    });

    it('should return 2 term sheets and match the data', async () => {
      const termSheetList: TermSheetEntity[] = await requestHelper
        .termSheet()
        .getAll({
          filters: { entrepreneurCompanyId: company.id },
        });

      expect(termSheetList.length).toBe(2);
      expect(termSheetList[0].senderCompanyId).toBe(company.id);
      expect(termSheetList[0].recipients).toBeDefined();
      expect(termSheetList[0].recipients.length).not.toBe(0);
      expect(
        termSheetList[0].recipients.find(
          (p) => p.user.email === recipient.user.email,
        ),
      ).toBe(true);

      expect(
        termSheetList[0].recipients.find(
          (p) => p.user.id === recipient.user.id,
        ),
      ).toBe(true);
    });
  });

  describe('Safe Progress Test', () => {
    let owner, recipient, recipient2, company;

    beforeAll(async () => {
      const res = await setup();

      recipient2 = await requestHelper.auth().signUpRandomUser();
      owner = res.owner;
      recipient = res.recipient;
      company = res.company;
    });

    it('should show awaiting as default for safe progress', async () => {
      const termSheet = await requestHelper
        .termSheet(owner.accessToken)
        .create({
          senderCompanyId: company.id,
          mfn: true,
          recipients: [recipient.user.email, recipient2.user.email],
        });

      const everyHasAwaitingStatus = await termSheet.recipients.every(
        (p) => p.safeProgress === SafeProgress.AWAITING,
      );

      expect(everyHasAwaitingStatus).toBe(true);
      expect(termSheet.recipients[0].safeProgress).toBeDefined();
    });

    it('should have safeProgress = created for user which have safe with this the termSheet', async () => {
      let termSheet = await requestHelper.termSheet(owner.accessToken).create({
        senderCompanyId: company.id,
        mfn: true,
        recipients: [recipient.user.email],
      });

      const safeNote = await requestHelper.safeNote(owner.accessToken).create(
        DataGenerator.mfnSafeNote(company.id, {
          recipientEmail: recipient.user.email,
          termSheetId: termSheet.id,
        }),
      );

      termSheet = await requestHelper.termSheet().getById(termSheet.id);

      expect(safeNote.termSheetId).toBe(termSheet.id);

      const termSheetUser = await termSheet.recipients.find(
        (p) => p.user.id === recipient.user.id,
      );

      expect(termSheetUser.safeProgress).toBe(SafeProgress.CREATED);
    });
  });
});
