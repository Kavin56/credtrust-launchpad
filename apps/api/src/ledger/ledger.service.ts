import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

export interface JournalEntry {
  accountId: string;
  type: 'DR' | 'CR';
  amount: number;
}

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async listAccounts() {
    return this.prisma.ledgerAccount.findMany();
  }

  async record(
    refType: string,
    refId: string,
    drAccountId: string,
    crAccountId: string,
    amount: number,
    narration: string,
    createdBy?: string,
  ) {
    const groupId = uuidv4();
    return this.prisma.transaction.create({
      data: {
        groupId,
        refType,
        refId,
        drAccountId,
        crAccountId,
        amount: new Decimal(amount),
        narration,
        createdBy,
      },
    });
  }

  async recordJournal(
    refType: string,
    refId: string,
    entries: JournalEntry[],
    narration: string,
    createdBy?: string,
    tx?: any,
  ) {
    let totalDr = 0;
    let totalCr = 0;

    for (const entry of entries) {
      if (entry.type === 'DR') totalDr += entry.amount;
      if (entry.type === 'CR') totalCr += entry.amount;
    }

    if (Math.abs(totalDr - totalCr) > 0.01) {
      throw new BadRequestException(`Journal unbalanced: DR ${totalDr} != CR ${totalCr}`);
    }

    const groupId = uuidv4();
    const transactions = [];

    const drEntries = entries.filter(e => e.type === 'DR');
    const crEntries = entries.filter(e => e.type === 'CR');

    if (drEntries.length === 1) {
      const dr = drEntries[0];
      for (const cr of crEntries) {
        transactions.push({
          groupId,
          refType,
          refId,
          drAccountId: dr.accountId,
          crAccountId: cr.accountId,
          amount: new Decimal(cr.amount),
          narration,
          createdBy,
        });
      }
    } else if (crEntries.length === 1) {
      const cr = crEntries[0];
      for (const dr of drEntries) {
        transactions.push({
          groupId,
          refType,
          refId,
          drAccountId: dr.accountId,
          crAccountId: cr.accountId,
          amount: new Decimal(dr.amount),
          narration,
          createdBy,
        });
      }
    } else {
      throw new BadRequestException('Complex journals (many-to-many) require a clearing account or schema change.');
    }

    const db = tx || this.prisma;
    await db.transaction.createMany({
      data: transactions,
    });

    return { groupId, transactions };
  }

  async getMemberTransactions(memberId: string) {
    // Find all accounts belonging to the member
    const accounts = await this.prisma.account.findMany({
      where: { memberId },
      select: { id: true },
    });
    const accountIds = accounts.map(a => a.id);

    // Find all transactions where the member's account is either DR or CR
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { drAccountId: { in: accountIds } },
          { crAccountId: { in: accountIds } },
        ],
      },
      orderBy: { txnDate: 'desc' },
    });
  }
}
