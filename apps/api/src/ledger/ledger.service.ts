import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async recordEntry(
    voucherType: string,
    voucherNo: string,
    narration: string,
    entries: { ledgerAccountId: string; drAmount: number; crAmount: number }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create General Ledger Entry
      const gl = await tx.generalLedger.create({
        data: {
          voucherType,
          voucherNo,
          narration,
          entries: {
            create: entries.map((e) => ({
              ledgerAccountId: e.ledgerAccountId,
              drAmount: new Decimal(e.drAmount),
              crAmount: new Decimal(e.crAmount),
            })),
          },
        },
      });

      // 2. Update Ledger Account Balances
      for (const entry of entries) {
        const balanceChange = entry.drAmount - entry.crAmount;
        await tx.ledgerAccount.update({
          where: { id: entry.ledgerAccountId },
          data: {
            balance: { increment: new Decimal(balanceChange) },
          },
        });
      }

      return gl;
    });
  }

  async getLedger(accountId: string) {
    return this.prisma.ledgerEntry.findMany({
      where: { ledgerAccountId: accountId },
      include: { generalLedger: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAccounts() {
    return this.prisma.ledgerAccount.findMany({
      orderBy: { code: 'asc' },
    });
  }
}
