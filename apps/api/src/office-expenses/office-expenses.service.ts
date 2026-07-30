import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OfficeExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    // 1. Calculate Principal Amount = (Deposits + Pigmy) - Loans
    const depositsSum = await this.prisma.depositAccount.aggregate({
      _sum: { balance: true }
    });
    const pigmySum = await this.prisma.pigmyAccount.aggregate({
      _sum: { balance: true }
    });
    const loansSum = await this.prisma.loan.aggregate({
      where: { status: { in: ['ACTIVE', 'DISBURSED'] } },
      _sum: { amount: true }
    });

    const totalDeposits = depositsSum._sum.balance || 0;
    const totalPigmy = pigmySum._sum.balance || 0;
    const totalLoans = loansSum._sum.amount || 0;

    const basePrincipalAmount = totalDeposits + totalPigmy - totalLoans;

    // 2. Calculate Office Expenses & Incomes
    const officeStats = await this.prisma.officeExpense.groupBy({
      by: ['type'],
      _sum: { amount: true }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    for (const stat of officeStats) {
      if (stat.type === 'INCOME') {
        totalIncome = stat._sum.amount || 0;
      } else if (stat.type === 'EXPENSE') {
        totalExpense = stat._sum.amount || 0;
      }
    }

    const additionalAmount = totalIncome - totalExpense;
    const currentAvailableBalance = basePrincipalAmount + additionalAmount;

    return {
      principalAmount: basePrincipalAmount,
      additionalAmount,
      currentAvailableBalance,
      totalIncome,
      totalExpenses: totalExpense
    };
  }

  async create(dto: any, adminUser: any) {
    const expense = await this.prisma.officeExpense.create({
      data: {
        date: dto.date ? new Date(dto.date) : new Date(),
        type: dto.type,
        description: dto.description,
        amount: parseFloat(dto.amount),
        modeOfTransaction: dto.modeOfTransaction,
        remarks: dto.remarks || '',
        addedBy: adminUser.fullName || adminUser.email || 'Admin',
      }
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminUser.userId || adminUser.id || null,
        action: 'CREATE_OFFICE_EXPENSE',
        module: 'OFFICE_EXPENSE',
        details: JSON.stringify(expense),
      }
    });

    return expense;
  }

  async update(id: string, dto: any, adminUser: any) {
    const existing = await this.prisma.officeExpense.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Office expense entry not found');
    }

    const updated = await this.prisma.officeExpense.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : existing.date,
        type: dto.type || existing.type,
        description: dto.description ?? existing.description,
        amount: dto.amount ? parseFloat(dto.amount) : existing.amount,
        modeOfTransaction: dto.modeOfTransaction || existing.modeOfTransaction,
        remarks: dto.remarks ?? existing.remarks,
      }
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminUser.userId || adminUser.id || null,
        action: 'UPDATE_OFFICE_EXPENSE',
        module: 'OFFICE_EXPENSE',
        details: JSON.stringify({ before: existing, after: updated }),
      }
    });

    return updated;
  }

  async delete(id: string, adminUser: any) {
    const existing = await this.prisma.officeExpense.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Office expense entry not found');
    }

    await this.prisma.officeExpense.delete({ where: { id } });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminUser.userId || adminUser.id || null,
        action: 'DELETE_OFFICE_EXPENSE',
        module: 'OFFICE_EXPENSE',
        details: JSON.stringify(existing),
      }
    });

    return { success: true };
  }

  async findAll(filters: any) {
    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const expenses = await this.prisma.officeExpense.findMany({
      where,
      orderBy: { date: 'asc' } // chronological order for running balance
    });

    // Compute running balance dynamically
    // Let's get the basePrincipalAmount
    const summary = await this.getSummary();
    let currentBal = summary.principalAmount; // start with current base principal amount and compute chronological running balance
    
    // Compute chronological running balance
    const results = [];
    for (const exp of expenses) {
      if (exp.type === 'INCOME') {
        currentBal += exp.amount;
      } else {
        currentBal -= exp.amount;
      }
      results.push({
        ...exp,
        runningBalance: currentBal
      });
    }

    // Return descending for list view display
    return results.reverse();
  }
}
