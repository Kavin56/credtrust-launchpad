import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('ledger')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, JwtAuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Roles(Role.ADMIN, Role.CEO)
  @Get('accounts')
  listAccounts() {
    return this.ledgerService.listAccounts();
  }

  @Roles(Role.ADMIN, Role.CEO)
  @Get('entries/:accountId')
  getEntries(@Param('accountId') accountId: string) {
    return this.ledgerService.getLedger(accountId);
  }

  @Roles(Role.ADMIN)
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
