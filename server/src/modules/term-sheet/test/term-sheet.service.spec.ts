import { Test, TestingModule } from '@nestjs/testing';

import { CompanyModule } from '@/modules/company/company.module';
import { TermSheetUserService } from '@/modules/term-sheet/term-sheet-user.service';
import { UserModule } from '@/modules/user/user.module';
import { JestModule } from '@/shared/jest/jest.module';

import { TermSheetService } from '../term-sheet.service';

describe('TermSheetService', () => {
  let service: TermSheetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JestModule, CompanyModule, UserModule],
      providers: [TermSheetService, TermSheetUserService],
    }).compile();

    service = module.get<TermSheetService>(TermSheetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
