import { Global, Module } from '@nestjs/common';

import { OtpService } from '@/modules/otp/otp.service';

@Global()
@Module({
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
