import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyLoanDto } from './dto/apply-loan.dto';
import { addMonths } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';
import { LoanRepaymentDto } from './dto/repayment.dto';
import { LoanStatus } from '@prisma/client';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async checkEligibility(memberId: string, amount: number) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: { shareAccounts: true },
    });

    if (!member) throw new NotFoundException('Member not found');

    const totalShares = member.shareAccounts.reduce(
      (acc, s) => acc + Number(s.totalAmount),
      0,
    );

    // Simple business rule: Loan amount cannot exceed 10x share capital
    if (amount > totalShares * 10) {
      return {
        eligible: false,
        reason: `Loan amount ${amount} exceeds 10x share capital (${totalShares * 10})`,
        limit: totalShares * 10,
      };
    }

    return { eligible: true };
  }

  async apply(dto: ApplyLoanDto) {
    const eligibility = await this.checkEligibility(dto.memberId, dto.amount);
    if (!eligibility.eligible) {
      throw new BadRequestException(eligibility.reason);
    }

    const totalLoans = await this.prisma.loan.count();
    const loanNumber = `L${(totalLoans + 1).toString().padStart(8, '0')}`;

    const principal = new Decimal(dto.amount);
    const rate = new Decimal(dto.interestRate);
    const term = dto.termMonths;

    const schedules = this.buildAmortizationSchedule(
      dto.amount,
      dto.interestRate,
      dto.termMonths,
      new Date(),
    );

    return this.prisma.loan.create({
      data: {
        loanNumber,
        memberId: dto.memberId,
        type: dto.type,
        amount: principal,
        interestRate: rate,
        termMonths: term,
        purpose: dto.purpose,
        guarantorDetail: dto.guarantorDetail,
        status: LoanStatus.PENDING,
        emiSchedule: { createMany: { data: schedules } },
      },
      include: { emiSchedule: true },
    });
  }

  async approveLoan(loanId: string) {
    return this.prisma.loan.update({
      where: { id: loanId },
      data: {
        status: LoanStatus.APPROVED,
        disbursedAt: new Date(),
      },
    });
  }

  async repay(loanId: string, dto: LoanRepaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { emiSchedule: { where: { isPaid: false }, orderBy: { dueDate: 'asc' } } },
      });

      if (!loan) throw new NotFoundException('Loan not found');

      const repayment = await tx.loanRepayment.create({
        data: {
          loanId,
          amount: new Decimal(dto.amount),
          penaltyAmount: new Decimal(dto.penaltyAmount || 0),
          paymentMode: dto.paymentMode,
          referenceNumber: dto.referenceNumber,
        },
      });

      // Simple implementation: Mark first unpaid EMI as paid if amount matches
      if (loan.emiSchedule.length > 0) {
        const nextEmi = loan.emiSchedule[0];
        if (new Decimal(dto.amount).greaterThanOrEqualTo(nextEmi.totalEmi)) {
          await tx.emiSchedule.update({
            where: { id: nextEmi.id },
            data: { isPaid: true, paidAt: new Date() },
          });
        }
      }

      return repayment;
    });
  }

  async getLoan(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        member: true,
        emiSchedule: { orderBy: { dueDate: 'asc' } },
        repayments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  async list(memberId?: string) {
    return this.prisma.loan.findMany({
      where: memberId ? { memberId } : {},
      include: { member: true },
    });
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
        const principalPart = emi - interest;
        balance -= principalPart;
        
        schedule.push({
          dueDate: addMonths(startDate, i),
          principalPart: new Decimal(principalPart.toFixed(2)),
          interestPart: new Decimal(interest.toFixed(2)),
          totalEmi: new Decimal(emi.toFixed(2)),
        });
    }
    return schedule;
  }
}
