import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('ledger')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('accounts')
  listAccounts() {
    return this.ledgerService.listAccounts();
  }

  @Post('transactions')
  record(@Body() body: any) {
    return this.ledgerService.record(
      body.refType,
      body.refId,
      body.drAccountId,
      body.crAccountId,
      body.amount,
      body.narration,
      body.createdBy,
    );
  }
}
