import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DividendsService {
  constructor(private prisma: PrismaService) {}

  async declare(fiscalYear: string, totalProfit: number, payoutRate: number) {
    const dividend = await this.prisma.dividend.create({
      data: {
        fiscalYear,
        totalProfit: new Decimal(totalProfit),
        declaredOn: new Date(),
        payoutRate: new Decimal(payoutRate),
      },
    });
    const members = await this.prisma.member.findMany({ include: { shares: true } });
    const payouts = members.map((m) => {
      const units = m.shares.reduce((sum, s) => sum + s.units, 0);
      const amount = units * payoutRate;
      return {
        dividendId: dividend.id,
        memberId: m.id,
        amount: new Decimal(amount),
      };
    });
    await this.prisma.dividendPayout.createMany({ data: payouts });
    return { dividend, payouts: payouts.length };
  }

  list() {
    return this.prisma.dividend.findMany({ include: { payouts: true } });
  }
}
