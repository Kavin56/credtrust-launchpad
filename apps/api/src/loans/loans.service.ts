import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef
} from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { addMonths } from 'date-fns';

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  OVERDUE = 'OVERDUE'
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  TELLER = 'TELLER',
  CEO = 'CEO'
}

// Mocking Decimal since we aren't using the real Prisma client runtime
class Decimal {
  public value: number;
  constructor(v: any) { this.value = Number(v); }
  toString() { return this.value.toString(); }
  toNumber() { return this.value; }
  toFixed(n: number) { return this.value.toFixed(n); }
  greaterThanOrEqualTo(other: any) { return this.value >= Number(other); }
}

@Injectable()
export class LoansService {
  // Manual In-Memory Database
  private loans: any[] = [];
  private members: any[] = [
    { id: 'mem1', fullName: 'Suresh Kumar', memberId: 'MEM0001' },
    { id: 'mem2', fullName: 'Priya Murugan', memberId: 'MEM0002' },
    { id: 'mem3', fullName: 'Velu Pillai', memberId: 'MEM0003' },
    { id: 'mem4', fullName: 'Anjali Sharma', memberId: 'MEM0004' },
  ];

  constructor(
    private readonly notificationsService: NotificationsService
  ) {
    this.seedRandomData();
  }

  private seedRandomData() {
    const loanTypes = ['Personal Loan', 'Home Loan', 'Gold Loan', 'SHG Credit'];
    const statuses = [LoanStatus.PENDING, LoanStatus.APPROVED, LoanStatus.REJECTED];
    
    for (let i = 1; i <= 10; i++) {
      const member = this.members[Math.floor(Math.random() * this.members.length)];
      const amount = Math.floor(Math.random() * 500000) + 10000;
      const rate = 10 + Math.random() * 5;
      const term = [12, 24, 36, 48][Math.floor(Math.random() * 4)];
      
      this.loans.push({
        id: `loan-${i}`,
        loanNumber: `L${i.toString().padStart(8, '0')}`,
        memberId: member.id,
        member: member,
        type: loanTypes[Math.floor(Math.random() * loanTypes.length)],
        amount: new Decimal(amount),
        interestRate: new Decimal(rate.toFixed(2)),
        termMonths: term,
        purpose: 'Randomly generated for testing',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        employmentStatus: 'Salaried',
        monthlyIncome: new Decimal(50000),
        documents: {
          idProof: 'https://via.placeholder.com/150?text=ID+Proof',
          addressProof: 'https://via.placeholder.com/150?text=Address+Proof'
        },
        adminRemarks: 'Initial seed data',
        createdAt: new Date(Date.now() - Math.random() * 1000000000),
      });
    }
  }

  async apply(dto: any) {
    const loanNumber = `L${(this.loans.length + 1).toString().padStart(8, '0')}`;
    const member = this.members.find(m => m.id === dto.memberId) || this.members[0];

    const newLoan = {
      id: `loan-${Date.now()}`,
      loanNumber,
      memberId: dto.memberId,
      member: member,
      type: dto.type,
      amount: new Decimal(dto.amount),
      interestRate: new Decimal(dto.interestRate),
      termMonths: dto.termMonths,
      purpose: dto.purpose,
      guarantorDetail: dto.guarantorDetail,
      employmentStatus: dto.employmentStatus,
      monthlyIncome: dto.monthlyIncome ? new Decimal(dto.monthlyIncome) : null,
      documents: dto.documents || {},
      status: LoanStatus.PENDING,
      createdAt: new Date(),
    };

    this.loans.push(newLoan);
    return newLoan;
  }

  async updateStatus(loanId: string, status: LoanStatus, remarks?: string) {
    const loan = this.loans.find(l => l.id === loanId);
    if (!loan) throw new NotFoundException('Loan not found');

    loan.status = status;
    if (remarks) loan.adminRemarks = remarks;
    if (status === LoanStatus.APPROVED) loan.disbursedAt = new Date();

    // Trigger notification
    await this.notificationsService.create({
      memberId: loan.memberId,
      title: `Loan ${status}`,
      message: `Your ${loan.type} application (${loan.loanNumber}) has been ${status.toLowerCase()}.${remarks ? ' Remark: ' + remarks : ''}`,
      type: status === LoanStatus.APPROVED ? 'SUCCESS' : status === LoanStatus.REJECTED ? 'DANGER' : 'INFO'
    });

    return loan;
  }

  async approveLoan(loanId: string) {
    return this.updateStatus(loanId, LoanStatus.APPROVED, 'Approved via manual action');
  }

  async getLoan(id: string) {
    const loan = this.loans.find(l => l.id === id);
    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  async list(memberId?: string, status?: LoanStatus) {
    let filtered = this.loans;
    if (memberId) filtered = filtered.filter(l => l.memberId === memberId);
    if (status) filtered = filtered.filter(l => l.status === status);
    
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async checkEligibility(memberId: string, amount: number) {
    return { eligible: true }; // Always eligible in mock mode
  }

  async repay(loanId: string, dto: any) {
    return { success: true, message: 'Repayment recorded in memory' };
  }
}
