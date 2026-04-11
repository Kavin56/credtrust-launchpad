import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class DividendsService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async declare(fiscalYear: string, totalProfit: number, payoutRate: number) {
    return this.prisma.$transaction(async (tx) => {
      const dividend = await tx.dividend.create({
        data: {
          fiscalYear,
          totalProfit: new Decimal(totalProfit),
          declaredOn: new Date(),
          payoutRate: new Decimal(payoutRate),
        },
      });
      
      const members = await tx.member.findMany({ include: { shares: true } });
      const payouts = members.map((m) => {
        const units = m.shares.reduce((sum, s) => sum + s.units, 0);
        const amount = units * payoutRate;
        return {
          dividendId: dividend.id,
          memberId: m.id,
          amount: new Decimal(amount),
        };
      }).filter(p => Number(p.amount) > 0);

      if (payouts.length > 0) {
        await tx.dividendPayout.createMany({ data: payouts });
        
        const totalPayout = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
        
        // Record dividend declaration in ledger
        // Debit: Retained Earnings (or Profit/Loss account) - for simplicity we use a generic expense/equity account
        // Credit: Dividend Payable
        await this.ledger.recordJournal(
          'DIVIDEND_DECLARE',
          dividend.id,
          [
            { accountId: 'RETAINED_EARNINGS', type: 'DR', amount: totalPayout },
            { accountId: 'DIVIDEND_PAYABLE', type: 'CR', amount: totalPayout },
          ],
          `Dividend declared for FY ${fiscalYear}`,
          'SYSTEM',
          tx,
        );
      }
      
      return { dividend, payouts: payouts.length };
    });
  }

  list() {
    return this.prisma.dividend.findMany({ include: { payouts: true } });
  }
}
