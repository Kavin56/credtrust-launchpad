import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class OfficeExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  async getSummary() {
    // Starting Base Principal is computed dynamically from SEED_CAPITAL entries
    const seedCapitalSum = await this.prisma.officeExpense.aggregate({
      where: { type: 'SEED_CAPITAL' },
      _sum: { amount: true }
    });
    const basePrincipalAmount = seedCapitalSum._sum.amount || 0;

    // 1. Sum of all user investments (Deposits + Pigmy) -> Total Income
    const activeDeposits = await this.prisma.depositApplication.aggregate({
      where: { status: 'APPROVED' },
      _sum: { amount: true }
    });
    const pigmySum = await this.prisma.pigmyAccount.aggregate({
      _sum: { balance: true }
    });

    const userInvestmentsIncome = (activeDeposits._sum.amount || 0) + (pigmySum._sum.balance || 0);

    // 2. Sum of all user loans disbursed -> Total Expenses
    const activeLoans = await this.prisma.loan.aggregate({
      where: { status: { in: ['APPROVED', 'ACTIVE', 'DISBURSED'] } },
      _sum: { amount: true }
    });

    const loanDocChargesIncome = (activeLoans._sum.amount || 0) * 0.025;

    // Sum of all user paid EMIs (repayments) -> Total Income
    const repaymentsSum = await this.prisma.loanRepayment.aggregate({
      _sum: { amount: true }
    });
    const paidEmisIncome = repaymentsSum._sum.amount || 0;

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

    // Both INCOME and DEPOSIT types, user investments, doc charges, and paid EMIs count towards Total Income
    const totalIncome = officeIncome + officeDeposit + userInvestmentsIncome + loanDocChargesIncome + paidEmisIncome;
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
        documentUrl: dto.documentUrl || null,
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
        documentUrl: dto.documentUrl !== undefined ? dto.documentUrl : existing.documentUrl,
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
    console.log(`Attempting to delete Office Expense with ID: "${id}"`);
    const existing = await this.prisma.officeExpense.findFirst({ where: { id } });
    if (!existing) {
      console.log(`Office Expense with ID: "${id}" not found in DB`);
      const all = await this.prisma.officeExpense.findMany({ select: { id: true } });
      console.log(`Available IDs in DB:`, all.map(a => a.id));
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

    // 1. Fetch Office Expenses
    const officeExpenses = await this.prisma.officeExpense.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    const unifiedList: any[] = [];

    // Map office expenses to unified structure
    for (const exp of officeExpenses) {
      unifiedList.push({
        id: exp.id,
        date: exp.date,
        type: exp.type,
        description: exp.description,
        amount: exp.amount,
        modeOfTransaction: exp.modeOfTransaction,
        addedBy: exp.addedBy,
        remarks: exp.remarks || '',
        customerName: '-',
        memberId: '-',
        documentUrl: exp.documentUrl,
        isSystem: false
      });
    }

    // Helper date filters for other tables
    const dateGte = filters.startDate ? new Date(filters.startDate) : undefined;
    const dateLte = filters.endDate ? new Date(filters.endDate) : undefined;

    // 2. Fetch Customer Deposits (Total Income)
    if (!filters.type || filters.type === 'DEPOSIT') {
      const depWhere: any = { status: 'APPROVED' };
      if (dateGte || dateLte) {
        depWhere.approvedDate = {};
        if (dateGte) depWhere.approvedDate.gte = dateGte;
        if (dateLte) depWhere.approvedDate.lte = dateLte;
      }
      const deposits = await this.prisma.depositApplication.findMany({
        where: depWhere,
        include: { member: { select: { fullName: true, memberId: true } } },
        orderBy: { approvedDate: 'asc' }
      });
      for (const dep of deposits) {
        unifiedList.push({
          id: dep.id,
          date: dep.approvedDate || dep.createdAt,
          type: 'DEPOSIT',
          description: `Customer Deposit (${dep.type}): ${dep.applicationNo}`,
          amount: dep.amount,
          modeOfTransaction: 'CASH',
          addedBy: dep.approvedBy || 'System',
          remarks: 'Approved deposit application',
          customerName: dep.member?.fullName || '-',
          memberId: dep.member?.memberId || '-',
          documentUrl: dep.documents || null,
          isSystem: true
        });
      }
    }

    // 3. Fetch Customer Loans (Total Expense)
    if (!filters.type || filters.type === 'EXPENSE') {
      const loanWhere: any = { status: { in: ['APPROVED', 'ACTIVE', 'DISBURSED'] } };
      if (dateGte || dateLte) {
        loanWhere.createdAt = {};
        if (dateGte) loanWhere.createdAt.gte = dateGte;
        if (dateLte) loanWhere.createdAt.lte = dateLte;
      }
      const loans = await this.prisma.loan.findMany({
        where: loanWhere,
        include: { member: { select: { fullName: true, memberId: true } } },
        orderBy: { createdAt: 'asc' }
      });
      for (const loan of loans) {
        unifiedList.push({
          id: loan.id,
          date: loan.createdAt,
          type: 'EXPENSE',
          description: `Customer Loan Disbursed: ${loan.loanNumber}`,
          amount: loan.amount,
          modeOfTransaction: 'CASH',
          addedBy: 'System',
          remarks: 'Approved loan disbursement',
          customerName: loan.member?.fullName || '-',
          memberId: loan.member?.memberId || '-',
          documentUrl: null,
          isSystem: true
        });
      }

      // Also fetch matured deposits payouts (Total Expense)
      const depPayoutWhere: any = { isMatured: true };
      if (dateGte || dateLte) {
        depPayoutWhere.updatedAt = {};
        if (dateGte) depPayoutWhere.updatedAt.gte = dateGte;
        if (dateLte) depPayoutWhere.updatedAt.lte = dateLte;
      }
      const payouts = await this.prisma.depositAccount.findMany({
        where: depPayoutWhere,
        include: { member: { select: { fullName: true, memberId: true } } },
        orderBy: { updatedAt: 'asc' }
      });
      for (const payout of payouts) {
        unifiedList.push({
          id: payout.id,
          date: payout.updatedAt,
          type: 'EXPENSE',
          description: `Matured Deposit Payout: ${payout.accountNumber}`,
          amount: payout.maturityAmount || payout.balance,
          modeOfTransaction: 'CASH',
          addedBy: 'System',
          remarks: 'Matured account payout',
          customerName: payout.member?.fullName || '-',
          memberId: payout.member?.memberId || '-',
          documentUrl: null,
          isSystem: true
        });
      }
    }

    // 4. Fetch Customer EMI Repayments & Doc Charges (Total Income)
    if (!filters.type || filters.type === 'INCOME') {
      const repWhere: any = {};
      if (dateGte || dateLte) {
        repWhere.createdAt = {};
        if (dateGte) repWhere.createdAt.gte = dateGte;
        if (dateLte) repWhere.createdAt.lte = dateLte;
      }
      const repayments = await this.prisma.loanRepayment.findMany({
        where: repWhere,
        include: { loan: { include: { member: { select: { fullName: true, memberId: true } } } } },
        orderBy: { createdAt: 'asc' }
      });
      for (const rep of repayments) {
        unifiedList.push({
          id: rep.id,
          date: rep.createdAt,
          type: 'INCOME',
          description: `Loan EMI Repayment: ${rep.loan?.loanNumber}`,
          amount: rep.amount,
          modeOfTransaction: rep.paymentMode || 'CASH',
          addedBy: 'System',
          remarks: rep.referenceNumber ? `Ref: ${rep.referenceNumber}` : 'Monthly EMI paid',
          customerName: rep.loan?.member?.fullName || '-',
          memberId: rep.loan?.member?.memberId || '-',
          documentUrl: null,
          isSystem: true
        });
      }

      // Add doc charges entries
      const docChargeLoansWhere: any = { status: { in: ['APPROVED', 'ACTIVE', 'DISBURSED'] } };
      if (dateGte || dateLte) {
        docChargeLoansWhere.createdAt = {};
        if (dateGte) docChargeLoansWhere.createdAt.gte = dateGte;
        if (dateLte) docChargeLoansWhere.createdAt.lte = dateLte;
      }
      const docChargeLoans = await this.prisma.loan.findMany({
        where: docChargeLoansWhere,
        include: { member: { select: { fullName: true, memberId: true } } },
        orderBy: { createdAt: 'asc' }
      });
      for (const loan of docChargeLoans) {
        unifiedList.push({
          id: `${loan.id}-doccharge`,
          date: loan.createdAt,
          type: 'INCOME',
          description: `Loan Documentation Charge: ${loan.loanNumber}`,
          amount: loan.amount * 0.025,
          modeOfTransaction: 'CASH',
          addedBy: 'System',
          remarks: '2.5% Documentation charge deduction',
          customerName: loan.member?.fullName || '-',
          memberId: loan.member?.memberId || '-',
          documentUrl: null,
          isSystem: true
        });
      }
    }

    // Sort chronologically to compute running balance correctly
    unifiedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Compute chronological running balance
    let currentBal = 0;
    const results = [];
    for (const exp of unifiedList) {
      if (exp.type === 'INCOME' || exp.type === 'DEPOSIT' || exp.type === 'SEED_CAPITAL') {
        currentBal += exp.amount;
      } else {
        currentBal -= exp.amount;
      }

      let documentSignedUrl = null;
      if (exp.documentUrl) {
        documentSignedUrl = await this.storage.signedUrl(exp.documentUrl);
      }

      results.push({
        ...exp,
        runningBalance: currentBal,
        documentSignedUrl
      });
    }

    // Return descending for display
    return results.reverse();
  }

  async uploadDocument(buffer: Buffer, filename: string, mimetype: string) {
    return this.storage.upload(buffer, filename, mimetype, 'office-expenses');
  }
}
