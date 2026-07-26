import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async trialBalance() {
    return { 'Cash': 500000, 'Bank': 1200000 };
  }

  async cashBook() {
    return [];
  }

  async emiDue(userId?: string) {
    if (!userId) return [];
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
    });
    if (!member) return [];

    const activeLoans = await this.prisma.loan.findMany({
      where: {
        memberId: member.id,
        status: { in: ['APPROVED', 'ACTIVE', 'DISBURSED'] },
      },
      include: {
        emiSchedule: {
          where: { isPaid: false },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    const dues = [];
    for (const loan of activeLoans) {
      for (const emi of loan.emiSchedule) {
        dues.push({
          id: emi.id,
          loanId: loan.id,
          loanNumber: loan.loanNumber,
          loanType: loan.type,
          dueDate: emi.dueDate,
          totalDue: emi.totalEmi,
          principalPart: emi.principalPart,
          interestPart: emi.interestPart,
        });
      }
    }
    return dues;
  }

  async balanceSheet() {
    return {
      assets: [],
      liabilities: [],
      totalAssets: 1700000,
      totalLiabilities: 0,
    };
  }

  async trialBalancePdf() {
    return Buffer.from('Mock PDF');
  }

  async trialBalanceExcel() {
    return Buffer.from('Mock Excel');
  }
}
