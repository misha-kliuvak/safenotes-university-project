import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
  getSchemaPath,
  PickType,
} from '@nestjs/swagger';

import { CompanyType } from '@/modules/company/enums';
import { CompanyRepository } from '@/modules/company/repository/company.repository';
import { CompanyService } from '@/modules/company/service/company.service';
import {
  Filters,
  Pagination,
  Param,
  Sorting,
} from '@/modules/database/decorator';
import { PaginationDto } from '@/modules/database/dto/pagination.dto';
import { GetEntity } from '@/modules/database/pipe/get-entity.pipe';
import { ValidateEntity } from '@/modules/database/pipe/validate-entity.pipe';
import { BankPaymentDataDto } from '@/modules/payment/dto/bank-payment-data.dto';
import { CardPaymentDataDto } from '@/modules/payment/dto/card-payment-data.dto';
import { CreatePaymentDto } from '@/modules/payment/dto/create-payment.dto';
import { CreateReceiptDto } from '@/modules/payment/dto/create-receipt.dto';
import { PaymentProvider } from '@/modules/payment/enums';
import { PaymentService } from '@/modules/payment/payment.service';
import { PaymentUtils } from '@/modules/payment/payment.utils';
import { TransferDto } from '@/modules/plaid/dto/transfer.dto';
import { CreateSafeByRecipientsDto } from '@/modules/safe-note/dto/create-safe-by-recipients.dto';
import { CreateSafeDto } from '@/modules/safe-note/dto/create-safe.dto';
import { PayAsDto } from '@/modules/safe-note/dto/pay-as.dto';
import { SafeNoteFilterDto } from '@/modules/safe-note/dto/safe-note-filter.dto';
import { ShareSafeDto } from '@/modules/safe-note/dto/share-safe.dto';
import { SignSafeDto } from '@/modules/safe-note/dto/sign-safe.dto';
import { UpdateDraftRecipientDto } from '@/modules/safe-note/dto/update-draft-recipient.dto';
import { UpdateSafeDto } from '@/modules/safe-note/dto/update-safe.dto';
import { SafeNoteEntity } from '@/modules/safe-note/entity/safe-note.entity';
import { PayAs, SafeNoteStatus } from '@/modules/safe-note/enums';
import { AssignCompanyGuard } from '@/modules/safe-note/guard/assign-company.guard';
import { SafeNoteGuard } from '@/modules/safe-note/guard/safe-note.guard';
import { SafeNoteRepository } from '@/modules/safe-note/repository/safe-note.repository';
import { SafeNoteDataInterceptor } from '@/modules/safe-note/safe-note.interceptor';
import { SafeNoteUtils } from '@/modules/safe-note/safe-note.utils';
import { SafeNoteUserService } from '@/modules/safe-note/service/safe-note-user.service';
import { SafeNoteService } from '@/modules/safe-note/service/safe-note.service';
import { BodyFile } from '@/modules/storage/file.decorators';
import { SubscriptionPermission } from '@/modules/subscription/enums';
import { Subscription } from '@/modules/subscription/subscription.decorator';
import { SubscriptionGuard } from '@/modules/subscription/subscription.guard';
import { TermSheetService } from '@/modules/term-sheet/term-sheet.service';
import { RawUser } from '@/modules/user/types';
import { CurrentUser, CurrentUserId } from '@/modules/user/user.decorator';
import { Permissions, Public, Roles } from '@/shared/decorators';
import { SkipGuard } from '@/shared/decorators/skip.decorator';
import { Permission, Role } from '@/shared/enums';
import { MulterFile } from '@/shared/types';
import { PlatformUtils } from '@/shared/utils';

@ApiTags('SAFE Note')
@ApiBearerAuth()
@Controller('safe-note')
@UseGuards(SafeNoteGuard, SubscriptionGuard)
export class SafeNoteController {
  constructor(
    private readonly safeNoteUserService: SafeNoteUserService,
    private readonly safeNoteService: SafeNoteService,
    private readonly paymentService: PaymentService,
    private readonly companyService: CompanyService,
    private readonly termSheetService: TermSheetService,
  ) {}

  @Get()
  @UseInterceptors(SafeNoteDataInterceptor)
  @Roles(Role.OWNER, Role.TEAM_MEMBER, Role.SAFE_RECIPIENT)
  @ApiOperation({ summary: 'Get all safe notes' })
  @ApiQuery({ type: SafeNoteFilterDto })
  async getAll(
    @CurrentUser() user: RawUser,
    @Filters(SafeNoteFilterDto) filters: SafeNoteFilterDto,
    @Pagination() pagination: PaginationDto,
    @Sorting() sorting,
  ) {
    return this.safeNoteService.getAllForUser(user.id, {
      filters,
      pagination,
      sorting,
    });
  }

  @Get('company-senders')
  @UseInterceptors(SafeNoteDataInterceptor)
  @Roles(Role.SAFE_RECIPIENT, Role.TEAM_MEMBER, Role.OWNER)
  @Permissions(Permission.CREATE, Permission.VIEW)
  @ApiOperation({
    summary: 'Get all company senders',
    description: 'Return list of all companies which were sent safes to user',
  })
  @ApiQuery({ type: PickType(SafeNoteFilterDto, ['angelCompanyId']) })
  async getCompanySenders(
    @CurrentUserId() currentUserId: string,
    @Filters(SafeNoteFilterDto) { angelCompanyId }: SafeNoteFilterDto,
  ) {
    const safeCompanyIds =
      await this.safeNoteService.getCompanyIdsFromReceivedSafes(
        currentUserId,
        angelCompanyId,
        {
          filters: { angelCompanyId: angelCompanyId },
        },
      );

    const termSheetCompanyIds =
      await this.termSheetService.getCompanyIdsFromReceivedTermSheets(
        currentUserId,
        {
          filters: { angelCompanyId: angelCompanyId },
        },
      );

    if (!safeCompanyIds?.length && !termSheetCompanyIds?.length) return [];

    return this.companyService.getAll({
      filters: { id: safeCompanyIds.concat(termSheetCompanyIds) },
    });
  }

  @Public()
  @Get('with-token')
  @ApiOperation({ summary: 'Get SAFE note with token' })
  async getWithToken(@Query() query: { token: string }) {
    return this.safeNoteService.getWithToken(query.token);
  }

  @Get('pending-safes')
  @SkipGuard(SafeNoteGuard)
  @ApiOperation({
    summary: 'Get pending safes',
    description: 'Return all SAFE notes which do not have assigned company',
  })
  async getPendingSafes(@CurrentUserId() userId: string) {
    return this.safeNoteService.getPendingSafes(userId);
  }

  @Get(':id')
  @UseInterceptors(SafeNoteDataInterceptor)
  @Roles(Role.OWNER, Role.TEAM_MEMBER, Role.SAFE_RECIPIENT)
  @ApiOperation({ summary: 'Get SAFE by id' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async getById(@Param('id') safeNoteId) {
    return this.safeNoteService.getById(safeNoteId);
  }

  @Get(':id/fee')
  @Roles(Role.OWNER, Role.TEAM_MEMBER, Role.SAFE_RECIPIENT)
  @ApiOperation({ summary: 'Get fee for SAFE' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async getFee(
    @Param('id', new GetEntity(SafeNoteRepository))
    safeNote: Awaited<SafeNoteEntity>,
  ) {
    const amount = safeNote.safeAmount;

    const stripeFee = PaymentUtils.calculateStripeFee(amount);
    const platformFee = SafeNoteUtils.calculatePlatformFee(amount);

    return {
      stripeFee,
      platformFee,
      totalFee: stripeFee + platformFee,
    };
  }

  @Get(':id/pdf')
  @HttpCode(HttpStatus.OK)
  @ApiProduces('application/pdf')
  @ApiOperation({ summary: 'Get safe pdf' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="safe.pdf"')
  @Header('Cache-Control', 'no-cache')
  async downloadPdf(
    @Param('id', new GetEntity(SafeNoteRepository))
    safeNote: Awaited<SafeNoteEntity>,
  ) {
    return new StreamableFile(await this.safeNoteService.generatePdf(safeNote));
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('senderSignature'))
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.CREATE)
  @Subscription(SubscriptionPermission.safeNote, Permission.CREATE)
  @ApiOperation({ summary: 'Create SAFE' })
  @ApiConsumes('multipart/form-data')
  async create(
    @CurrentUser() user: RawUser,
    @Body() body: CreateSafeDto,
    @BodyFile({
      required: false,
      noFileMessage: 'Cannot create SAFE without a signature',
    })
    senderSignatureFile: MulterFile,
  ) {
    body.senderSignature = senderSignatureFile;
    return this.safeNoteUserService.create(user, body);
  }

  @Post(':id/recipients')
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.CREATE)
  @Subscription(SubscriptionPermission.safeNote, Permission.CREATE)
  @ApiOperation({ summary: 'Create SAFE by recipients' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async createRecipients(
    @CurrentUser() user: RawUser,
    @Param('id', new GetEntity(SafeNoteRepository))
    safeNote: Awaited<SafeNoteEntity>,
    @Body() body: CreateSafeByRecipientsDto,
  ) {
    return this.safeNoteUserService.createByRecipients(safeNote, user, body);
  }

  @Post(':id/stripe')
  @Roles(Role.OWNER, Role.SAFE_RECIPIENT)
  @ApiOperation({ summary: 'Create payment intent for SAFE' })
  @ApiExtraModels(CardPaymentDataDto, BankPaymentDataDto)
  @ApiBody({
    schema: {
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
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async createPaymentIntent(
    @Param('id', new GetEntity(SafeNoteRepository))
    safeNote: Awaited<SafeNoteEntity>,
    @CurrentUser() currentUser: RawUser,
    @Body() { payAs }: PayAsDto,
    @Body() body: CreatePaymentDto,
  ) {
    return this.paymentService.processPaymentByProvider(
      PaymentProvider.STRIPE,
      currentUser,
      safeNote,
      body,
      payAs || PayAs.ENTREPRENEUR,
    );
  }

  @Post(':id/plaid')
  @Roles(Role.OWNER, Role.SAFE_RECIPIENT)
  @ApiOperation({ summary: 'Create transfer payment plaid for SAFE' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async transferPlaid(
    @Param('id', new GetEntity(SafeNoteRepository))
    safeNote: Awaited<SafeNoteEntity>,
    @CurrentUser() currentUser: RawUser,
    @Body() { payAs }: PayAsDto,
    @Body() body: TransferDto,
  ) {
    return this.paymentService.processPaymentByProvider(
      PaymentProvider.PLAID,
      currentUser,
      safeNote,
      body,
      payAs || PayAs.ENTREPRENEUR,
    );
  }

  @Post(':id/receipt')
  @Roles(Role.OWNER, Role.SAFE_RECIPIENT)
  @ApiOperation({ summary: 'Create receipt payment for SAFE' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async createReceipt(
    @Param('id', new GetEntity(SafeNoteRepository))
    safeNote: Awaited<SafeNoteEntity>,
    @CurrentUser() currentUser: RawUser,
    @Body() { payAs }: PayAsDto,
    @Body() body: CreateReceiptDto,
  ) {
    return this.paymentService.processPaymentByProvider(
      PaymentProvider.RECEIPT,
      currentUser,
      safeNote,
      body,
      payAs || PayAs.ENTREPRENEUR,
    );
  }

  @Patch(':id/paid')
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.EDIT)
  @ApiOperation({ summary: 'Mark SAFE as paid' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async markAsPaid(
    @Param('id', new GetEntity(SafeNoteRepository))
    safeNote: Awaited<SafeNoteEntity>,
  ) {
    return this.paymentService.markPaymentAsPaid(safeNote);
  }

  @Patch('draft')
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.CREATE)
  async updateDraftRecipient(@Body() body: UpdateDraftRecipientDto) {
    return this.safeNoteUserService.updateDraftRecipient(body);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.EDIT)
  @Subscription(SubscriptionPermission.safeNote, Permission.EDIT)
  @ApiOperation({ summary: 'Update SAFE' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async update(
    @Param('id', new ValidateEntity(SafeNoteRepository))
    safeNoteId: string,
    @Body() body: UpdateSafeDto,
  ) {
    return this.safeNoteUserService.update(safeNoteId, body);
  }

  @Patch(':id/decline')
  @Roles(Role.SAFE_RECIPIENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decline SAFE' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async decline(
    @Param('id', new GetEntity(SafeNoteRepository))
    safeNote: Awaited<SafeNoteEntity>,
  ) {
    if (safeNote.status !== SafeNoteStatus.SENT) {
      throw new BadRequestException(
        `SAFE note is not in ${SafeNoteStatus.SENT} status and cannot be declined`,
      );
    }

    await this.safeNoteService.declineSafeNote(safeNote.id);
  }

  @Post(':id/assign-company/:companyId')
  @Roles(Role.SAFE_RECIPIENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AssignCompanyGuard)
  @ApiOperation({
    summary: 'Assign company to SAFE',
    description:
      'Works only for angel company, as only that company can be assigned to SAFE ',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  @ApiParam({
    name: 'companyId',
    required: true,
    description: 'Company identifier',
  })
  async assignCompany(
    @Param('id', new GetEntity(SafeNoteRepository)) safeNote,
    @Param('companyId', new GetEntity(CompanyRepository)) company,
  ) {
    if (company.type !== CompanyType.ANGEL) {
      throw new BadRequestException(
        `Invalid company type: <${company.type}>. SAFE can only be assigned with <${CompanyType.ANGEL}> company`,
      );
    }

    if (safeNote.recipientCompanyId) {
      throw new BadRequestException(
        'SAFE note has already been assigned to a company!',
      );
    }
    await this.safeNoteService.assignAngelCompany(safeNote.id, company.id);
  }

  @Post(':id/sign')
  @UseInterceptors(FileInterceptor('signature'))
  @Roles(Role.OWNER, Role.SAFE_RECIPIENT)
  @Subscription(SubscriptionPermission.safeNote, Permission.EDIT)
  @ApiOperation({ summary: 'Sign SAFE' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  @ApiConsumes('multipart/form-data')
  async sign(
    @CurrentUserId() userId: string,
    @BodyFile({ required: true }) signatureFile: MulterFile,
    @Param('id') safeNoteId: string,
    @Body() body: SignSafeDto,
  ) {
    body.signature = signatureFile;
    return this.safeNoteUserService.sign(userId, safeNoteId, body);
  }

  @Post(':id/notify-to-sign')
  @Roles(Role.OWNER, Role.SAFE_RECIPIENT, Role.TEAM_MEMBER)
  @Subscription(SubscriptionPermission.safeNote, Permission.EDIT)
  @Permissions(Permission.CREATE)
  @ApiOperation({
    summary: 'Notify to sign',
    description: 'Send email to a recipient to remind to sign the SAFE',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async notifyToSign(
    @Param('id') safeNoteId,
    @Body() { reminderMessage }: { reminderMessage?: string },
  ) {
    return this.safeNoteService.notifyToSign(safeNoteId, reminderMessage);
  }

  @Post(':id/share')
  @Roles(Role.OWNER, Role.SAFE_RECIPIENT, Role.TEAM_MEMBER)
  @Subscription(SubscriptionPermission.safeNote, Permission.EDIT)
  @ApiOperation({ summary: 'Share SAFE' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async shareSafe(
    @CurrentUserId() currentUserId: string,
    @Param('id', new ValidateEntity(SafeNoteRepository)) safeNoteId: string,
    @Body() body: ShareSafeDto,
  ) {
    return this.safeNoteUserService.share(currentUserId, safeNoteId, body);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.CREATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete SAFE' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'SafeNote identifier',
  })
  async delete(
    @CurrentUserId() currentUserId: string,
    @Param('id') id: string,
    @Body() { message }: { message?: string },
  ) {
    return this.safeNoteUserService.deleteSafe(currentUserId, id, message);
  }
}
