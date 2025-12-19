import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';

import { MailModule } from '@/modules/mail/mail.module';
import { SafeNoteModule } from '@/modules/safe-note/safe-note.module';
import { SafeNoteService } from '@/modules/safe-note/service/safe-note.service';
import { UserModule } from '@/modules/user/user.module';
import { JestModule } from '@/shared/jest/jest.module';

jest.mock('sequelize-typescript', () => require('@mocks/sequelize-typescript'));

describe('UserService', () => {
  let safeNoteService: SafeNoteService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({ dialect: 'postgres' }),
        JestModule,
        SafeNoteModule,
        UserModule,
        MailModule,
      ],
    }).compile();

    safeNoteService = app.get(SafeNoteService);
  });

  describe('getAllForUser', () => {
    it('initial', () => {
      expect(true).toBe(true);
    });
  });
});
