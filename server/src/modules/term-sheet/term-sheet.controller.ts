import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import {
  Filters,
  Pagination,
  Param,
  Sorting,
} from '@/modules/database/decorator';
import { PaginationDto } from '@/modules/database/dto/pagination.dto';
import { AssignCompanyGuard } from '@/modules/safe-note/guard/assign-company.guard';
import { SafeNoteGuard } from '@/modules/safe-note/guard/safe-note.guard';
import { CreateTermSheetDto } from '@/modules/term-sheet/dto/create-term-sheet.dto';
import { DownloadTermSheetDto } from '@/modules/term-sheet/dto/download-term-sheet.dto';
import { TermSheetFilterDto } from '@/modules/term-sheet/dto/term-sheet-filter.dto';
import { UpdateTermSheetUserDto } from '@/modules/term-sheet/dto/update-term-sheet-user.dto';
import { TermSheetUserService } from '@/modules/term-sheet/term-sheet-user.service';
import { TermSheetGuard } from '@/modules/term-sheet/term-sheet.guard';
import { TermSheetDataInterceptor } from '@/modules/term-sheet/term-sheet.interceptor';
import { TermSheetService } from '@/modules/term-sheet/term-sheet.service';
import { CurrentUserId } from '@/modules/user/user.decorator';
import { Permissions, Roles, SkipGuard } from '@/shared';
import { Permission, Role } from '@/shared/enums';
import { UpdateEmailUserDto } from '@/modules/user/dto/update-email-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BodyFile } from '@/modules/storage/file.decorators';
import { MulterFile } from '@/shared/types';
import { SignTermSheetDto } from '@/modules/term-sheet/dto/sign-term-sheet.dto';
import { PlatformUtils } from '@/shared/utils';

@ApiTags('Term Sheet')
@ApiBearerAuth()
@Controller('term-sheet')
@UseGuards(TermSheetGuard)
export class TermSheetController {
  constructor(
    private readonly termSheetUserService: TermSheetUserService,
    private readonly termSheetService: TermSheetService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all term sheets' })
  @Roles(
    Role.OWNER,
    Role.TEAM_MEMBER,
    Role.TERM_SHEET_RECIPIENT,
    Role.SAFE_RECIPIENT,
  )
  @ApiQuery({ type: TermSheetFilterDto })
  @UseInterceptors(TermSheetDataInterceptor)
  public async getAll(
    @CurrentUserId() userId: string,
    @Filters(TermSheetFilterDto) filters: TermSheetFilterDto,
    @Pagination() pagination: PaginationDto,
    @Sorting() sorting,
  ) {
    return this.termSheetService.getAllForUser(userId, {
      filters,
      pagination,
      sorting,
    });
  }

  @Get('pending')
  @SkipGuard(SafeNoteGuard)
  @ApiOperation({
    summary: 'Get pending term sheets',
    description: 'Return all Term Sheets which do not have assigned company',
  })
  async getPendingTermSheets(@CurrentUserId() userId: string) {
    return this.termSheetService.getPendingTermSheets(userId);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get term sheet by id' })
  @Roles(Role.OWNER, Role.TEAM_MEMBER, Role.TERM_SHEET_RECIPIENT)
  @UseInterceptors(TermSheetDataInterceptor)
  public async getById(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    return this.termSheetService.getByForUser(id, userId);
  }

  @Post('/')
  @ApiOperation({ summary: 'Create term sheet' })
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.CREATE)
  @UseInterceptors(TermSheetDataInterceptor)
  @UseInterceptors(FileInterceptor('signature'))
  @ApiConsumes('multipart/form-data')
  public async create(
    @CurrentUserId() userId: string,
    @Body() body: CreateTermSheetDto,
    @BodyFile({
      required: !PlatformUtils.isTestEnv(),
      noFileMessage: 'Cannot create term sheet without a signature',
    })
    signatureFile: MulterFile,
  ) {
    body.signature = signatureFile;
    return this.termSheetUserService.createTermSheet(userId, body);
  }

  @Patch(':id/update-user')
  @Roles(Role.TERM_SHEET_RECIPIENT)
  @UseGuards(AssignCompanyGuard)
  @ApiOperation({
    summary: 'Update terms sheet user data',
    description:
      'Add comment, change status, or assign company (only angel company can be assigned)',
  })
  async updateUser(
    @Param('id') termSheetId,
    @CurrentUserId() userId: string,
    @Body() body: UpdateTermSheetUserDto,
  ) {
    return this.termSheetUserService.update(termSheetId, userId, body);
  }

  @Post(':id/sign')
  @UseInterceptors(FileInterceptor('signature'))
  @Roles(Role.TERM_SHEET_RECIPIENT)
  @UseGuards(AssignCompanyGuard)
  @ApiOperation({ summary: 'Sign Term Sheet' })
  @ApiConsumes('multipart/form-data')
  async sign(
    @CurrentUserId() userId: string,
    @BodyFile({ required: true }) signatureFile: MulterFile,
    @Param('id') termSheetId: string,
    @Body() body: SignTermSheetDto,
  ) {
    body.signature = signatureFile;
    return this.termSheetUserService.addSignature(termSheetId, userId, body);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.CREATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Term Sheet' })
  async delete(@Param('id') id: string) {
    return this.termSheetService.deleteById(id);
  }

  @Post(':id/user/:userId/reminder')
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.VIEW)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Send reminder' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Term Sheet identifier',
  })
  @ApiParam({ name: 'userId', required: true, description: 'User identifier' })
  async sendTermSheetUserReminder(
    @Param('id') termSheetId: string,
    @Param('userId') userId: string,
  ) {
    return this.termSheetUserService.sendReminder(termSheetId, userId);
  }

  @Patch(':id/user/:userId')
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.EDIT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change recipient for Pending Term Sheet' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Term Sheet identifier',
  })
  @ApiParam({ name: 'userId', required: true, description: 'User identifier' })
  async changeTermSheetUser(
    @Param('id') termSheetId: string,
    @Param('userId') userId: string,
    @Body() { email }: UpdateEmailUserDto,
  ) {
    return this.termSheetUserService.changeRecipient(
      termSheetId,
      userId,
      email,
    );
  }

  @Delete(':id/user/:userId')
  @Roles(Role.OWNER, Role.TEAM_MEMBER)
  @Permissions(Permission.CREATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Term Sheet' })
  async deleteTermSheetUser(
    @Param('id') termSheetId: string,
    @Param('userId') userId: string,
  ) {
    return this.termSheetUserService.delete(termSheetId, userId);
  }

  @Post('/download-document')
  @ApiOperation({ summary: 'Download Term Sheet Document' })
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  @Header('Content-Disposition', 'attachment; filename="document.docx"')
  async downloadDocument(@Res() res, @Body() body: DownloadTermSheetDto) {
    const buffer = await this.termSheetService.downloadTermSheetDocument(body);

    res.send(buffer);
  }
}
