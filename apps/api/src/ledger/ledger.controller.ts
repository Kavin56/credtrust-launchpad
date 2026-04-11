import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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

  @Get('transactions/me')
  getMemberTransactions(@Req() req: any) {
    return this.ledgerService.getMemberTransactions(req.user.userId);
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
