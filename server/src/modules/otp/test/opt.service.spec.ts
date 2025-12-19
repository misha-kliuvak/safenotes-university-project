import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';

import { OtpModule } from '@/modules/otp/otp.module';
import { JestModule } from '@/shared/jest/jest.module';

import { OtpService } from '../otp.service';

describe('OtpService', () => {
  let otpService: OtpService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        JestModule,
        SequelizeModule.forRoot({ dialect: 'postgres' }),
        OtpModule,
      ],
    }).compile();

    otpService = app.get(OtpService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('generate', () => {
    it('should generate a valid OTP token', async () => {
      const secret = await otpService.generateSecret();
      const otp = await otpService.generate(secret);

      expect(otp).not.toBeNull();
      expect(otp.length).toBe(6);
    });

    it('should generate an OTP token with custom options', async () => {
      const secret = await otpService.generateSecret();
      const options = {
        digits: 8,
        period: 60,
      };
      const otp = await otpService.generate(secret, options);

      expect(otp).not.toBeNull();
      expect(otp.length).toBe(8);
    });
  });

  describe('validate', () => {
    it('should return true for a valid OTP', async () => {
      const secret = await otpService.convertInputToSecret('your-secret-key');
      const otp = await otpService.generate(secret);
      const isValid = await otpService.validate(secret, otp);
      expect(isValid).toBe(true);
    });

    it('should return false for an invalid OTP', async () => {
      const secret = await otpService.convertInputToSecret('your-secret-key');
      const otp = '123456'; // Assuming this is an invalid OTP
      const isValid = await otpService.validate(secret, otp);
      expect(isValid).toBe(false);
    });
  });

  // describe('invalidate', () => {
  //   it('should add an OTP to the blacklist', async () => {
  //     const otp = '123456'; // Replace with an actual OTP
  //     await otpService.invalidate(otp);
  //     const inBlacklist = await otpBlacklistRepository.getOne({
  //       where: { otp },
  //     });
  //     expect(inBlacklist).not.toBeNull();
  //   });
  // });
});
