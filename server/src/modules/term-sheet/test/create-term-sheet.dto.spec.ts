import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateTermSheetDto } from '@/modules/term-sheet/dto/create-term-sheet.dto';

describe('CreateTermSheetDto', () => {
  it.each([
    {}, // empty data
    {
      // not enough data
      senderCompanyId: undefined,
    },
    {
      // not enough data
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
    },
    {
      // no mfn or terms
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      recipients: ['test@gmail.com'],
    },
    {
      // valuationCap is undefined
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      valuationCap: undefined,
      discountRate: 10,
      recipients: ['test@gmail.com'],
    },
    {
      // no recipients
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      valuationCap: 10,
      discountRate: 10,
      roundAmount: 10,
    },
    {
      // because discount is more than 00
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      valuationCap: 10,
      discountRate: 101,
      roundAmount: 10,
      recipients: ['test@gmail.com'],
    },
    {
      // because senderCompanyId is not uuid
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      mfn: true,
      recipients: ['test@gmail.com'],
    },
    {
      // because recipients array contain invalid email
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      mfn: true,
      recipients: ['test'],
    },
    {
      // because recipients array contain invalid email
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      mfn: true,
      recipients: ['test'],
    },
    {
      // because round amount is not valid number
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      mfn: true,
      roundAmount: 'test',
      recipients: ['test'],
    },
  ])(
    'should not pass validation as data is full or not valid',
    async (data) => {
      const dto = plainToInstance(CreateTermSheetDto, data);

      const errors = await validate(dto);
      expect(errors.length).not.toBe(0);
    },
  );

  it.each([
    {
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      valuationCap: 10,
      discountRate: 10,
      recipients: ['test@gmail.com'],
    },
    {
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      discountRate: 10,
      roundAmount: 10,
      recipients: ['test@gmail.com'],
    },
    {
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      mfn: true,
      roundAmount: 10,
      recipients: ['test@gmail.com'],
    },
    {
      senderCompanyId: 'fa81d118-8013-4c5b-a6c2-9a6d3374f9bb',
      mfn: true,
      recipients: ['test@gmail.com'],
    },
  ])('should pass validation with valid data', async (data) => {
    const dto = plainToInstance(CreateTermSheetDto, data);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
