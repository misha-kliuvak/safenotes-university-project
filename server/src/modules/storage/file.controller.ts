import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileService } from '@/modules/storage/service/file.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('file')
@ApiTags('FILE')
@ApiBearerAuth()
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get file' })
  @ApiParam({ name: 'id', required: true, description: 'File identifier' })
  get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.fileService.getById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove file' })
  @ApiParam({ name: 'id', required: true, description: 'File identifier' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.fileService.deleteByID(id);
  }
}
