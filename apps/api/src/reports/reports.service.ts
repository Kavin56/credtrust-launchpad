import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async trialBalance() {
    const entries = await this.prisma.ledgerEntry.findMany({
        include: { ledgerAccount: true }
    });
    const balances: Record<string, number> = {};
    entries.forEach((e) => {
      const current = balances[e.ledgerAccount.name] || 0;
      balances[e.ledgerAccount.name] = current + (Number(e.drAmount) - Number(e.crAmount));
    });
    return balances;
  }

  async cashBook() {
    return this.prisma.ledgerEntry.findMany({
      where: { ledgerAccount: { name: 'Cash' } },
      include: { generalLedger: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async emiDue(memberId?: string) {
    return this.prisma.emiSchedule.findMany({
      where: { 
          isPaid: false,
          ...(memberId ? { loan: { memberId } } : {})
      },
      include: { loan: { include: { member: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async balanceSheet() {
      // Very basic balance sheet summary
      const accounts = await this.prisma.ledgerAccount.findMany();
      const assets = accounts.filter(a => a.type.startsWith('ASSET'));
      const liabilities = accounts.filter(a => a.type.startsWith('LIABILITY'));
      
      return {
          assets: assets.map(a => ({ name: a.name, balance: a.balance })),
          liabilities: liabilities.map(a => ({ name: a.name, balance: a.balance })),
          totalAssets: assets.reduce((acc, a) => acc + Number(a.balance), 0),
          totalLiabilities: liabilities.reduce((acc, a) => acc + Number(a.balance), 0),
      };
  }
}
