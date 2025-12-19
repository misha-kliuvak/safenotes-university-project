import {
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { PaymentService } from '@/modules/payment/payment.service';
import { Public } from '@/shared/decorators';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('/by-payment-intent/:paymentIntentId')
  async getPaymentByPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
  ) {
    return this.paymentService.getByPaymentIntentId(paymentIntentId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.paymentService.getById(id);
  }

  @Public()
  @Get(':id/receipt')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="receipt.pdf"')
  async invoice(
    @Param('id', new ParseUUIDPipe()) paymentId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.paymentService.convertReceiptToPdf(paymentId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
