import { Test, TestingModule } from '@nestjs/testing';

import { CompanyModule } from '@/modules/company/company.module';
import { TermSheetUserService } from '@/modules/term-sheet/term-sheet-user.service';
import { TermSheetService } from '@/modules/term-sheet/term-sheet.service';
import { UserModule } from '@/modules/user/user.module';
import { JestModule } from '@/shared/jest/jest.module';

import { TermSheetController } from '../term-sheet.controller';

describe('TermSheetController', () => {
  let controller: TermSheetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JestModule, CompanyModule, UserModule],
      controllers: [TermSheetController],
      providers: [TermSheetUserService, TermSheetService],
    }).compile();

    controller = module.get<TermSheetController>(TermSheetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
