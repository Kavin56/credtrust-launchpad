import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('ledger')
@ApiBearerAuth()
// @UseGuards(FirebaseAuthGuard, JwtAuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('accounts')
  listAccounts() {
    return this.ledgerService.listAccounts();
  }

  @Get('entries/:accountId')
  getEntries(@Param('accountId') accountId: string) {
    return this.ledgerService.getLedger(accountId);
  }

  @Post('record')
  recordEntry(@Body() body: any) {
    return this.ledgerService.recordEntry(
      body.voucherType,
      body.voucherNo,
      body.narration,
      body.entries,
    );
  }
}
