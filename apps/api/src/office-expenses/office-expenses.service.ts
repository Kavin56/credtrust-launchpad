import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OfficeExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    // Starting Base Principal is computed dynamically from SEED_CAPITAL entries
    const seedCapitalSum = await this.prisma.officeExpense.aggregate({
      where: { type: 'SEED_CAPITAL' },
      _sum: { amount: true }
    });
    const basePrincipalAmount = seedCapitalSum._sum.amount || 0;

    // 1. Sum of all user investments (Deposits + Pigmy) -> Total Income
    const activeDeposits = await this.prisma.depositAccount.aggregate({
      where: { isMatured: false },
      _sum: { balance: true }
    });
    const pigmySum = await this.prisma.pigmyAccount.aggregate({
      _sum: { balance: true }
    });

    const userInvestmentsIncome = (activeDeposits._sum.balance || 0) + (pigmySum._sum.balance || 0);

    // 2. Sum of all user loans disbursed -> Total Expenses
    const activeLoans = await this.prisma.loan.aggregate({
      where: { status: { in: ['APPROVED', 'ACTIVE', 'DISBURSED'] } },
      _sum: { amount: true }
    });

    // 3. Sum of all matured/closed deposits paid out -> Total Expenses
    const maturedDepositsPaid = await this.prisma.depositAccount.aggregate({
      where: { isMatured: true },
      _sum: { maturityAmount: true }
    });

    const userLoansAndPayoutsExpense = (activeLoans._sum.amount || 0) + (maturedDepositsPaid._sum.maturityAmount || 0);

    // 4. Calculate Office Expenses & Incomes (excluding SEED_CAPITAL since it defines Base Principal)
    const officeStats = await this.prisma.officeExpense.groupBy({
      by: ['type'],
      _sum: { amount: true }
    });

    let officeIncome = 0;
    let officeExpense = 0;
    let officeDeposit = 0;

    for (const stat of officeStats) {
      if (stat.type === 'INCOME') {
        officeIncome = stat._sum.amount || 0;
      } else if (stat.type === 'EXPENSE') {
        officeExpense = stat._sum.amount || 0;
      } else if (stat.type === 'DEPOSIT') {
        officeDeposit = stat._sum.amount || 0;
      }
    }

    // Both INCOME and DEPOSIT types count towards Total Income
    const totalIncome = officeIncome + officeDeposit + userInvestmentsIncome;
    const totalExpense = officeExpense + userLoansAndPayoutsExpense;

    const currentAvailableBalance = basePrincipalAmount + totalIncome - totalExpense;

    return {
      principalAmount: basePrincipalAmount,
      additionalAmount: totalIncome - totalExpense,
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
        userId: null,
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
        userId: null,
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
        userId: null,
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
    let currentBal = 0; // start from 0 and build running balance chronologically
    
    // Compute chronological running balance
    const results = [];
    for (const exp of expenses) {
      if (exp.type === 'INCOME' || exp.type === 'DEPOSIT' || exp.type === 'SEED_CAPITAL') {
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
