import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StorageService } from '../storage/storage.service';
import { EncryptionService } from '../common/utils/encryption.util';

const LOAN_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ACTIVE',
  'CLOSED',
  'OVERDUE',
] as const;
type LoanStatus = (typeof LOAN_STATUSES)[number];

type UploadedLoanFile = {
  fieldname: string;
  filename: string;
  mimetype?: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class LoansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly storage: StorageService,
    private readonly encryption: EncryptionService,
  ) {}

  async apply(dto: any, files: UploadedLoanFile[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { member: true }
    });
    const member = user?.member;
    if (!member) {
      throw new BadRequestException('Member profile not found');
    }

    let formattedId = '';
    let initialStatus = 'PENDING';

    if (member.kycStatus === 'VERIFIED') {
      formattedId = member.rojaId || '';
      initialStatus = 'PENDING';
    } else {
      const rawId = (dto.registeredId || '').toString().trim();
      if (!rawId) {
        throw new BadRequestException('Registered ID is mandatory');
      }
      formattedId = rawId.toUpperCase().startsWith('ROJA-') ? rawId.toUpperCase() : `ROJA-${rawId}`;

      const existingRojaMember = await this.prisma.member.findFirst({
        where: { rojaId: formattedId, id: { not: member.id } }
      });
      if (existingRojaMember) {
        throw new BadRequestException('Registered ID already belongs to another member');
      }

      await this.prisma.member.update({
        where: { id: member.id },
        data: { rojaId: formattedId }
      });
      initialStatus = 'PENDING_REGISTERED_ID_APPROVAL';
    }

    if (!dto.startDate || !dto.endDate || !dto.monthlyPaymentDate) {
      throw new BadRequestException('Start Date, End Date, and Monthly Payment Date are mandatory');
    }
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('End Date cannot be earlier than Start Date');
    }
    const monthlyPaymentDate = parseInt(dto.monthlyPaymentDate);
    if (isNaN(monthlyPaymentDate) || monthlyPaymentDate < 1 || monthlyPaymentDate > 31) {
      throw new BadRequestException('Monthly Payment Date must be between 1 and 31');
    }

    const loanCount = await this.prisma.loan.count();
    const loanNumber = `L${(loanCount + 1).toString().padStart(8, '0')}`;

    const documentPaths: Record<string, string> = {};

    // Handle all file uploads independently
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rawFieldName = file.fieldname || `document_${i + 1}`;
      const fieldName = documentPaths[rawFieldName] ? `${rawFieldName}_${i + 1}` : rawFieldName;

      documentPaths[fieldName] = await this.storage.upload(
        file.buffer,
        file.filename,
        file.mimetype || 'application/octet-stream',
        'loan-documents',
      );
    }

    // Proportional charges calculation:
    // Documentation charge: ₹250 for every ₹10,000 (2.5% of principal)
    const amount = parseFloat(dto.amount || '0');
    const documentationCharges = amount * 0.025; 
    const processingCharges = 0;
    const otherCharges = 0;
    const netDisbursed = amount - documentationCharges;

    const newLoan = await this.prisma.loan.create({
      data: {
        loanNumber,
        member: { connect: { id: member.id } },
        type: dto.type || 'Personal Loan',
        amount,
        interestRate: parseFloat(dto.interestRate || '12'),
        termMonths: parseInt(dto.termMonths || '12'),
        purpose: dto.purpose || 'Personal Use',
        employmentStatus: dto.employmentStatus || 'Salaried',
        monthlyIncome: dto.monthlyIncome ? parseFloat(dto.monthlyIncome) : null,
        documents: JSON.stringify(documentPaths),
        registeredId: formattedId,
        startDate,
        endDate,
        monthlyPaymentDate,
        processingCharges,
        documentationCharges,
        otherCharges,
        netDisbursed,
        status: initialStatus,
      },
      include: {
        member: true
      }
    });

    return newLoan;
  }

  async updateStatus(loanId: string, status: string, remarks?: string) {
    if (!LOAN_STATUSES.includes(status as LoanStatus)) {
      throw new BadRequestException('Invalid loan status');
    }

    const existingLoan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: { emiSchedule: true }
    });

    if (!existingLoan) {
      throw new NotFoundException('Loan not found');
    }

    const loan = await this.prisma.loan.update({
      where: { id: loanId },
      data: { 
        status: status as LoanStatus,
        adminRemarks: remarks,
        disbursedAt: status === 'APPROVED' ? new Date() : undefined
      },
      include: { member: true }
    });

    // 2. Generate EMI schedule ONLY after admin approval
    if (status === 'APPROVED' && existingLoan.emiSchedule.length === 0) {
      const amount = loan.amount;
      const termMonths = loan.termMonths;
      const interestRate = loan.interestRate;
      
      const monthlyRate = interestRate / 12 / 100;
      
      // Calculate monthly EMI (compounding formula)
      const emi = monthlyRate === 0 
        ? amount / termMonths 
        : (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

      let currentBalance = amount;
      const schedules = [];
      const baseDate = loan.startDate ? new Date(loan.startDate) : new Date();
      const paymentDay = loan.monthlyPaymentDate || 5;

      for (let i = 0; i < termMonths; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        dueDate.setDate(paymentDay);

        const interestPart = currentBalance * monthlyRate;
        let principalPart = emi - interestPart;

        if (i === termMonths - 1) {
          principalPart = currentBalance;
        }

        currentBalance -= principalPart;

        schedules.push({
          loanId: loan.id,
          dueDate,
          principalPart: Math.round(principalPart * 100) / 100,
          interestPart: Math.round(interestPart * 100) / 100,
          totalEmi: Math.round(emi * 100) / 100,
          isPaid: false,
        });
      }

      await this.prisma.emiSchedule.createMany({
        data: schedules
      });
    }

    // Trigger notification
    await this.notificationsService.create({
      memberId: loan.memberId,
      title: `Loan ${status}`,
      message: `Your ${loan.type} application (${loan.loanNumber}) has been ${status.toLowerCase()}.${remarks ? ' Remark: ' + remarks : ''}`,
      type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'DANGER' : 'INFO'
    });

    return this.getLoan(loan.id);
  }

  async approveLoan(loanId: string) {
    return this.updateStatus(loanId, 'APPROVED', 'Approved via manual action');
  }

  private decryptMember(member: any) {
    if (!member) return member;
    return {
      ...member,
      aadhaarNumber: member.aadhaarNumber ? this.encryption.decrypt(member.aadhaarNumber) : null,
      panNumber: member.panNumber ? this.encryption.decrypt(member.panNumber) : null,
    };
  }

  async getLoan(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: { 
        member: true,
        emiSchedule: { orderBy: { dueDate: 'asc' } },
        repayments: { orderBy: { createdAt: 'asc' } }
      }
    });
    if (!loan) throw new NotFoundException('Loan not found');
    if (loan.member) {
      loan.member = this.decryptMember(loan.member) as any;
    }
    return loan;
  }

  async list(memberId?: string, status?: string) {
    const loans = await this.prisma.loan.findMany({
      where: {
        memberId,
        status: status as any
      },
      include: {
        member: true,
        emiSchedule: true,
        repayments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return loans.map(loan => ({
      ...loan,
      member: loan.member ? this.decryptMember(loan.member) : null
    })) as any;
  }

  async listForMember(userId: string) {
    if (!userId) return [];
    
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
    });
    if (!member) return [];

    const loans = await this.prisma.loan.findMany({
      where: { memberId: member.id },
      include: { 
        member: true,
        emiSchedule: { orderBy: { dueDate: 'asc' } },
        repayments: { orderBy: { createdAt: 'asc' } }
      },
      orderBy: { createdAt: 'desc' },
    });
    return loans.map(loan => ({
      ...loan,
      member: loan.member ? this.decryptMember(loan.member) : null
    })) as any;
  }

  async checkEligibility(memberId: string, amount: number) {
    return { eligible: true }; 
  }

  async repay(loanId: string, dto: any, userId?: string, role?: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: { emiSchedule: { orderBy: { dueDate: 'asc' } } }
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    // Ownership check for MEMBER role
    if (role === 'MEMBER' && userId) {
      const member = await this.prisma.member.findFirst({ where: { userId } });
      if (!member || loan.memberId !== member.id) {
        throw new BadRequestException('You can only make payments on your own loans');
      }
    }

    // Find the oldest unpaid EMI schedule
    const oldestPendingEmi = loan.emiSchedule.find(emi => !emi.isPaid);
    if (!oldestPendingEmi) {
      return { success: false, message: 'All EMIs are already fully paid.' };
    }

    const payAmount = parseFloat(dto.amount || '0');
    const paymentMode = dto.paymentMode || 'CASH';

    // Record the payment
    const repayment = await this.prisma.loanRepayment.create({
      data: {
        loanId,
        amount: payAmount,
        penaltyAmount: parseFloat(dto.penaltyAmount || '0'),
        paymentMode,
        referenceNumber: dto.transactionId || dto.referenceNumber || null,
        createdAt: new Date(),
      }
    });

    // Update EmiSchedule status
    await this.prisma.emiSchedule.update({
      where: { id: oldestPendingEmi.id },
      data: {
        isPaid: true,
        paidAt: new Date()
      }
    });

    // Check if all EMIs are paid, if yes close the loan
    const remainingUnpaidCount = await this.prisma.emiSchedule.count({
      where: { loanId, isPaid: false }
    });

    if (remainingUnpaidCount === 0) {
      await this.prisma.loan.update({
        where: { id: loanId },
        data: { status: 'CLOSED', closedAt: new Date() }
      });
    }

    return { 
      success: true, 
      message: 'Repayment recorded successfully',
      repayment 
    };
  }
}
