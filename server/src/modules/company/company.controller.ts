import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
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
  ApiResponse,
  ApiTags,
  getSchemaPath,
  OmitType,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CompanyDataInterceptor } from '@/modules/company/company.interceptor';
import { CompanyFilterDto } from '@/modules/company/dto/company-filter.dto';
import { CreateAngelCompanyDto } from '@/modules/company/dto/create-angel-company.dto';
import { CreateCompanyCoreDto } from '@/modules/company/dto/create-company-core.dto';
import { CreateEntrepreneurCompanyDto } from '@/modules/company/dto/create-entrepreneur-company.dto';
import { UpdateAngelCompanyDto } from '@/modules/company/dto/update-angel-company.dto';
import { UpdateCompanyCoreDto } from '@/modules/company/dto/update-company-core.dto';
import { UpdateEntrepreneurCompanyDto } from '@/modules/company/dto/update-entrepreneur-company.dto';
import { CompanyEntity } from '@/modules/company/entity/company.entity';
import { CompanyType, VerificationStatus } from '@/modules/company/enums';
import { CompanyGuard } from '@/modules/company/guard/company.guard';
import { UpdateTeamMemberGuard } from '@/modules/company/guard/update-team-member.guard';
import { CompanyRepository } from '@/modules/company/repository/company.repository';
import { CompanySummaryService } from '@/modules/company/service/company-summary.service';
import { CompanyUserService } from '@/modules/company/service/company-user.service';
import { CreateCompanyDto, UpdateCompanyDto } from '@/modules/company/types';
import { Param } from '@/modules/database/decorator';
import { Filters } from '@/modules/database/decorator/query.decorator';
import { GetEntity } from '@/modules/database/pipe/get-entity.pipe';
import { ValidateEntity } from '@/modules/database/pipe/validate-entity.pipe';
import { CreatePaymentDto } from '@/modules/payment/dto/create-payment.dto';
import { IMAGE_EXTENSIONS } from '@/modules/storage/constants';
import { BodyFile } from '@/modules/storage/file.decorators';
import { FileService } from '@/modules/storage/service/file.service';
import { SubscriptionPermission } from '@/modules/subscription/enums';
import { Subscription } from '@/modules/subscription/subscription.decorator';
import { SubscriptionGuard } from '@/modules/subscription/subscription.guard';
import { InviteTeamMembersDto } from '@/modules/team-member/dto/invite-team-members.dto';
import { UpdateTeamMemberDto } from '@/modules/team-member/dto/update-team-member.dto';
import { UserRepository } from '@/modules/user/repository/user.repository';
import { RawUser } from '@/modules/user/types';
import { CurrentUser, CurrentUserId } from '@/modules/user/user.decorator';
import { Permissions, Roles } from '@/shared';
import { Permission, Role } from '@/shared/enums';
import { ValidationFactory } from '@/shared/factories/validation.factory';
import { MulterFile } from '@/shared/types';

import { CompanyService } from './service/company.service';

@ApiTags('Company')
@ApiBearerAuth()
@UseGuards(CompanyGuard, SubscriptionGuard)
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly companyUserService: CompanyUserService,
    private readonly companySummaryService: CompanySummaryService,
    private readonly fileService: FileService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all companies' })
  @ApiQuery({ type: CompanyFilterDto })
  @UseInterceptors(CompanyDataInterceptor)
  async getAll(
    @CurrentUser() user: RawUser,
    @Filters(CompanyFilterDto)
    { type, ...filters }: CompanyFilterDto,
  ) {
    return this.companyService.getAllByUser(user.id, {
      filters,
      dynamicFilters: { type },
    });
  }

  @Get('/summary')
  @ApiOperation({ summary: 'Get summary for companies' })
  @ApiQuery({ type: OmitType(CompanyFilterDto, ['shared']) })
  async getCompaniesSummary(
    @CurrentUser() user: RawUser,
    @Filters(CompanyFilterDto)
    { type, viaAngelCompany, ...filter }: CompanyFilterDto,
  ) {
    return this.companySummaryService.getAllByUser(user.id, {
      filters: { ...filter, viaAngelCompany: viaAngelCompany },
      dynamicFilters: { type },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by id' })
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  @UseInterceptors(CompanyDataInterceptor)
  async getById(
    @Param('id', new ParseUUIDPipe()) companyId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.companyService.getByIdForUser(companyId, userId);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get company summary by id' })
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  async getSummaryById(@Param('id', new ParseUUIDPipe()) companyId: string) {
    return this.companySummaryService.getById(companyId);
  }

  @Get(':id/mfn-holders')
  @ApiOperation({
    summary: 'Get all mfn holders',
    description: 'Return list of all users which receive MFN Safe from company',
  })
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  async getMfnHolders(@Param('id', new ParseUUIDPipe()) companyId: string) {
    return this.companyService.getMfnHolders(companyId);
  }

  @Get(':id/safes-files')
  @HttpCode(HttpStatus.OK)
  @ApiProduces('application/zip')
  @ApiOperation({ summary: 'Get safes' })
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  @ApiParam({
    name: 'safeNoteIds',
    type: 'array',
    required: false,
    description: 'Company identifier',
  })
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename="safes.zip"')
  async downloadSafes(
    @Param('id', new GetEntity(CompanyRepository, { includeDeleted: true }))
    company: Awaited<CompanyEntity>,
    @Query() { safeNoteIds }: { safeNoteIds: string[] },
  ) {
    return new StreamableFile(
      await this.companyService.getSafesFilesByCompany(company, safeNoteIds),
    );
  }

  @Post('/')
  @Subscription(SubscriptionPermission.investorCompany, Permission.CREATE)
  @UseInterceptors(FileInterceptor('image'), CompanyDataInterceptor)
  @ApiOperation({ summary: 'Create company' })
  @ApiExtraModels(CreateAngelCompanyDto, CreateEntrepreneurCompanyDto)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      oneOf: [
        { $ref: getSchemaPath(CreateAngelCompanyDto) },
        { $ref: getSchemaPath(CreateEntrepreneurCompanyDto) },
      ],
    },
  })
  async create(
    @CurrentUserId() userId: string,
    @Body() body: CreateCompanyDto,
    @BodyFile({
      fileSize: 10,
      extensions: IMAGE_EXTENSIONS,
    })
    imageFile: MulterFile,
  ) {
    let errors, dto;
    const validatorOptions = { whitelist: true };

    switch (body?.type) {
      case CompanyType.ENTREPRENEUR: {
        dto = plainToInstance(CreateEntrepreneurCompanyDto, body);
        errors = await validate(dto, validatorOptions);
        break;
      }
      case CompanyType.ANGEL: {
        dto = plainToInstance(CreateAngelCompanyDto, body);
        errors = await validate(dto, validatorOptions);
        break;
      }
      default: {
        dto = plainToInstance(CreateCompanyCoreDto, body);
        errors = await validate(dto);
        break;
      }
    }

    if (errors.length) {
      throw new BadRequestException(
        ValidationFactory.flattenValidationErrors(errors),
      );
    }

    if (imageFile) dto.image = imageFile;

    return this.companyUserService.createCompany(userId, dto);
  }

  @Post('/angel')
  @Subscription(SubscriptionPermission.investorCompany, Permission.CREATE)
  @UseInterceptors(FileInterceptor('image'), CompanyDataInterceptor)
  @ApiOperation({ summary: 'Create angel company' })
  @ApiConsumes('multipart/form-data')
  async createAngelCompany(
    @CurrentUserId() userId: string,
    @Body() dto: CreateAngelCompanyDto,
    @BodyFile({
      fileSize: 10,
      extensions: IMAGE_EXTENSIONS,
    })
    imageFile: MulterFile,
  ) {
    dto.image = imageFile;
    return this.companyUserService.createCompany(userId, dto);
  }

  @Post('/entrepreneur')
  @Subscription(SubscriptionPermission.investorCompany, Permission.CREATE)
  @UseInterceptors(FileInterceptor('image'), CompanyDataInterceptor)
  @ApiOperation({ summary: 'Create entrepreneur company' })
  @ApiConsumes('multipart/form-data')
  async createEntrepreneurCompany(
    @CurrentUserId() userId: string,
    @Body() dto: CreateEntrepreneurCompanyDto,
    @BodyFile({
      fileSize: 10,
      extensions: IMAGE_EXTENSIONS,
    })
    imageFile: MulterFile,
  ) {
    dto.image = imageFile;
    return this.companyUserService.createCompany(userId, dto);
  }

  @Patch(':id')
  @Subscription(SubscriptionPermission.investorCompany, Permission.EDIT)
  @UseInterceptors(FileInterceptor('image'), CompanyDataInterceptor)
  @ApiOperation({ summary: 'Update company' })
  @ApiExtraModels(UpdateAngelCompanyDto, UpdateEntrepreneurCompanyDto)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      oneOf: [
        { $ref: getSchemaPath(UpdateAngelCompanyDto) },
        { $ref: getSchemaPath(UpdateEntrepreneurCompanyDto) },
      ],
    },
  })
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  async update(
    @Param('id', new GetEntity(CompanyRepository))
    company: Awaited<CompanyEntity>,
    @Body() body: UpdateCompanyDto,
    @BodyFile({
      fileSize: 10,
      extensions: IMAGE_EXTENSIONS,
    })
    imageFile: MulterFile,
  ) {
    let errors, dto;
    const validatorOptions = { whitelist: true };

    switch (company?.type) {
      case CompanyType.ENTREPRENEUR: {
        dto = plainToInstance(UpdateEntrepreneurCompanyDto, body);
        errors = await validate(dto, validatorOptions);
        break;
      }
      case CompanyType.ANGEL: {
        dto = plainToInstance(UpdateAngelCompanyDto, body);
        errors = await validate(dto, validatorOptions);
        break;
      }
      default: {
        dto = plainToInstance(UpdateCompanyCoreDto, body);
        errors = await validate(dto);
        break;
      }
    }

    if (errors.length) {
      throw new BadRequestException(
        ValidationFactory.flattenValidationErrors(errors),
      );
    }

    dto.image = imageFile;
    return this.companyService.update(company.id, dto);
  }

  @Get(':id/document')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get documents' })
  getDocuments(
    @Param('id', new GetEntity(CompanyRepository))
    company: Awaited<CompanyEntity>,
  ) {
    return this.fileService.getAllByModel(company, 'document');
  }

  @Post(':id/document')
  @Subscription(SubscriptionPermission.investorCompany, Permission.EDIT)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadDocument(
    @Param('id', new GetEntity(CompanyRepository))
    company: Awaited<CompanyEntity>,
    @BodyFile({
      fileSize: 10,
      extensions: IMAGE_EXTENSIONS,
    })
    file: MulterFile,
  ) {
    return this.fileService.saveModelFile(company, file, 'document');
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove company' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Company identifier',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  delete(@Param('id', new ValidateEntity(CompanyRepository)) id: string) {
    return this.companyService.deleteCompany(id);
  }

  @Patch(':id/restore')
  @Subscription(SubscriptionPermission.investorCompany, Permission.EDIT)
  @Roles(Role.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore company' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Company identifier',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @UseInterceptors(CompanyDataInterceptor)
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.companyService.restoreById(id);
  }

  @Post(':id/team-member')
  @Subscription(SubscriptionPermission.teamMember, Permission.CREATE)
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.CREATE)
  @ApiOperation({ summary: 'Invite team members' })
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  async inviteTeamMembers(
    @CurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) companyId: string,
    @Body() { teamMembers }: InviteTeamMembersDto,
  ) {
    return this.companyUserService.inviteTeamMembers(
      userId,
      companyId,
      teamMembers,
    );
  }

  @Post(':id/team-member/:userId/permission-request')
  @Roles(Role.TEAM_MEMBER)
  @Permissions(Permission.VIEW)
  @ApiOperation({ summary: 'Request team members to update permission' })
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  async requestPermissions(
    @CurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) companyId: string,
  ) {
    return this.companyUserService.requestPermission(userId, companyId);
  }

  @Patch(':id/team-member/:userId')
  @Subscription(SubscriptionPermission.teamMember, Permission.EDIT)
  @UseGuards(UpdateTeamMemberGuard)
  @ApiOperation({ summary: 'Update team member' })
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  @ApiParam({ name: 'userId', required: true, description: 'User identifier' })
  async updateTeamMember(
    @Param('id', new ValidateEntity(CompanyRepository)) companyId: string,
    @Param('userId', new ValidateEntity(UserRepository)) userId: string,
    @Body() body: UpdateTeamMemberDto,
  ) {
    return this.companyUserService.updateByCompanyAndUser(
      companyId,
      userId,
      body,
    );
  }

  @Delete(':id/team-member/:userId')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Delete team member' })
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  @ApiParam({ name: 'userId', required: true, description: 'User identifier' })
  async deleteTeamMember(
    @Param('id', new ValidateEntity(CompanyRepository)) companyId: string,
    @Param('userId', new ValidateEntity(UserRepository)) userId: string,
  ) {
    return this.companyUserService.deleteByCompanyAndUser(companyId, userId);
  }

  @Patch(':id/verify')
  @ApiOperation({
    summary: 'Verification request',
  })
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  public async verifyCompany(
    @CurrentUserId() userId: string,
    @Param('id', new ValidateEntity(CompanyRepository)) companyId: string,
    @Body() body: any,
  ) {
    return this.companyService.verifyCompany(
      companyId,
      userId,
      body as CreatePaymentDto,
    );
  }

  @Get(':id/payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get payments' })
  getPayments(@Param('id', new ValidateEntity(CompanyRepository)) id: string) {
    return this.companyService.getPayments(id);
  }

  // TODO TEMPORARY
  @Patch(':id/verification-status')
  @ApiOperation({
    summary: 'Change verification status of the company (TEMPORARY)',
    description:
      'Will be deleted after implement the logic of verification the company',
  })
  @ApiParam({ name: 'id', required: true, description: 'Company identifier' })
  public async updateCompanyVerificationStatus(
    @Param('id', new GetEntity(CompanyRepository))
    company: Awaited<CompanyEntity>,
    @Body() body: { status: VerificationStatus },
  ) {
    return this.companyService.pendingVerification(company, body.status);
  }
}
