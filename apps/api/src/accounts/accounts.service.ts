import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  list(memberId: string) {
    return this.prisma.account.findMany({ where: { memberId } });
  }

  async create(memberId: string, type: string) {
    const number = `AC${Date.now()}`; // simplistic; replace with sequence
    return this.prisma.account.create({
      data: {
        memberId,
        type,
        number,
        balance: new Decimal(0),
      },
    });
  }

  async credit(accountId: string, amount: number) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new BadRequestException('Account not found');
    
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.account.update({
        where: { id: accountId },
        data: { balance: account.balance.add(new Decimal(amount)) },
      });

      await this.ledger.recordJournal(
        'DEPOSIT',
        accountId,
        [
          { accountId: 'CASH', type: 'DR', amount },
          { accountId: accountId, type: 'CR', amount },
        ],
        `Cash deposit to account ${account.number}`,
        account.memberId,
        tx,
      );

      return updated;
    });
  }

  async debit(accountId: string, amount: number) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new BadRequestException('Account not found');
    if (Number(account.balance) < amount) throw new BadRequestException('Insufficient balance');
    
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.account.update({
        where: { id: accountId },
        data: { balance: account.balance.sub(new Decimal(amount)) },
      });

      await this.ledger.recordJournal(
        'WITHDRAWAL',
        accountId,
        [
          { accountId: accountId, type: 'DR', amount },
          { accountId: 'CASH', type: 'CR', amount },
        ],
        `Cash withdrawal from account ${account.number}`,
        account.memberId,
        tx,
      );

      return updated;
    });
  }
}
