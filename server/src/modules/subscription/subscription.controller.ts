import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { RawUser } from '@/modules/user/types';
import { CurrentUser } from '@/modules/user/user.decorator';

import { SubscriptionPeriodDto } from '@/modules/subscription/dto/subscription-period.dto';
import { SubscriptionService } from '@/modules/subscription/service/subscription.service';
import { CardPaymentDataDto } from '@/modules/payment/dto/card-payment-data.dto';
import { BankPaymentDataDto } from '@/modules/payment/dto/bank-payment-data.dto';
import { CreatePaymentDto } from '@/modules/payment/dto/create-payment.dto';

@ApiTags('Subscription')
@ApiBearerAuth()
@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Post('/')
  @ApiExtraModels(CardPaymentDataDto, BankPaymentDataDto, SubscriptionPeriodDto)
  @ApiBody({
    schema: {
      allOf: [{ $ref: getSchemaPath(SubscriptionPeriodDto) }],
      oneOf: [
        {
          $ref: getSchemaPath(CardPaymentDataDto),
        },
        {
          $ref: getSchemaPath(BankPaymentDataDto),
        },
      ],
    },
  })
  async createSubscription(
    @CurrentUser() user: RawUser,
    @Body() { period }: SubscriptionPeriodDto,
    @Body() body: CreatePaymentDto,
  ) {
    return this.subscriptionService.createSubscription(user.id, period, body);
  }

  @Patch('/:id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelSubscription(
    @Param('id', new ParseUUIDPipe()) subscriptionId: string,
  ) {
    return this.subscriptionService.cancelSubscription(subscriptionId);
  }

  @Patch('/:id')
  async upgradeSubscription(
    @Param('id', new ParseUUIDPipe()) subscriptionId: string,
    @Body() { period }: SubscriptionPeriodDto,
  ) {
    return this.subscriptionService.upgradeSubscription(subscriptionId, period);
  }
}
