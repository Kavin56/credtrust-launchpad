import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyLoanDto } from './dto/apply-loan.dto';
import { addMonths } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';
import { PayEmiDto } from './dto/pay-emi.dto';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class LoansService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async apply(memberId: string, dto: ApplyLoanDto) {
    const sanctionDate = new Date(dto.sanctionDate);
    const schedules = this.buildAmortizationSchedule(
      dto.principal,
      dto.rate,
      dto.tenureMonths,
      sanctionDate,
    );
    const emiAmount = schedules[0].totalDue;
    
    // When a loan is approved/disbursed, we should create a ledger entry.
    // For now, we just create the loan. Disbursement might be a separate step.
    return this.prisma.loan.create({
      data: {
        memberId,
        product: dto.product,
        principal: new Decimal(dto.principal),
        rate: new Decimal(dto.rate),
        tenureMonths: dto.tenureMonths,
        sanctionDate,
        status: 'APPROVED',
        collateral: dto.collateral,
        emiAmount,
        nextDueDate: schedules[0].dueDate,
        schedules: { createMany: { data: schedules } },
      },
      include: { schedules: true },
    });
  }

  async list(memberId: string) {
    return this.prisma.loan.findMany({
      where: { memberId },
      include: { schedules: true },
    });
  }

  async payEmi(memberId: string, dto: PayEmiDto) {
    const schedule = await this.prisma.emiSchedule.findUnique({
      where: { id: dto.scheduleId },
      include: { loan: true },
    });
    if (!schedule || schedule.loan.memberId !== memberId) {
      throw new NotFoundException('Schedule not found');
    }
    if (schedule.paid) throw new BadRequestException('Already paid');
    if (dto.amount < Number(schedule.totalDue)) {
      throw new BadRequestException('Amount less than due');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.emiSchedule.update({
        where: { id: dto.scheduleId },
        data: { paid: true, paidOn: new Date(dto.paidOn) },
      });

      // Multi-leg journal entry for EMI payment
      // Debit: Member's Savings Account (or Cash)
      // Credit: Loan Principal Account
      // Credit: Loan Interest Income Account
      await this.ledger.recordJournal(
        'EMI',
        dto.scheduleId,
        [
          { accountId: dto.accountId, type: 'DR', amount: Number(schedule.totalDue) },
          { accountId: 'LOAN_PRINCIPAL', type: 'CR', amount: Number(schedule.principalComponent) },
          { accountId: 'LOAN_INCOME', type: 'CR', amount: Number(schedule.interestComponent) },
        ],
        `EMI payment for loan ${schedule.loanId}`,
        memberId,
        tx,
      );
    });

    // update next due
    const remaining = await this.prisma.emiSchedule.findMany({
      where: { loanId: schedule.loanId, paid: false },
      orderBy: { dueDate: 'asc' },
      take: 1,
    });
    await this.prisma.loan.update({
      where: { id: schedule.loanId },
      data: { nextDueDate: remaining[0]?.dueDate },
    });
    return { status: 'ok' };
  }

  private buildAmortizationSchedule(
    principal: number,
    annualRate: number,
    tenureMonths: number,
    startDate: Date,
  ) {
    const r = annualRate / 12 / 100;
    const emi =
      (principal * r * Math.pow(1 + r, tenureMonths)) /
      (Math.pow(1 + r, tenureMonths) - 1);
    const schedule = [];
    let balance = principal;
    for (let i = 1; i <= tenureMonths; i++) {
      const interest = balance * r;
      const principalComponent = emi - interest;
      balance -= principalComponent;
      schedule.push({
        dueDate: addMonths(startDate, i),
        principalComponent: new Decimal(principalComponent.toFixed(2)),
        interestComponent: new Decimal(interest.toFixed(2)),
        totalDue: new Decimal(emi.toFixed(2)),
      });
    }
    return schedule;
  }
}
