import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PlaidService } from '@/modules/plaid/plaid.service';
import { RawUser } from '@/modules/user/types';
import { CurrentUser } from '@/modules/user/user.decorator';
import { UserService } from '@/modules/user/user.service';

@ApiTags('Plaid')
@ApiBearerAuth()
@Controller('plaid')
export class PlaidController {
  constructor(
    private plaidService: PlaidService,
    private userService: UserService,
  ) {}

  @Get('/account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get accounts' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async getAccount(@CurrentUser() user: RawUser) {
    return this.plaidService.getAccount(user.id);
  }

  @Get('/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get token object' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async getToken(@CurrentUser() user: RawUser) {
    return this.plaidService.getToken(user.id);
  }

  @Get('/transfer/:transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get transfer object' })
  @ApiParam({
    name: 'transfer',
    required: true,
    description: 'Plaid transfer ID',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async getTransfer(
    @Param('transfer') transferId: string,
    @CurrentUser() user: RawUser,
  ) {
    return this.plaidService.getTransfer(transferId);
  }

  @Post('/transfer/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync transfers' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async syncTransfer(@CurrentUser() user: RawUser) {
    return this.plaidService.syncTransfer();
  }

  @Post('/link/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create link token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async createLinkToken(@CurrentUser() user: RawUser) {
    return this.plaidService.createLinkToken(user);
  }

  @Post('/access/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange public token to access token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async exchangePublicToken(
    @CurrentUser() user: RawUser,
    @Body() { publicToken }: { publicToken?: string },
  ) {
    const accessToken = await this.plaidService.exchangePublicTokenToAccess(
      publicToken,
    );

    await this.userService.updateById(user.id, {
      plaidAccessToken: accessToken.access_token,
      plaidItemId: accessToken.item_id,
    });

    return this.plaidService.getToken(user.id);
  }
}
