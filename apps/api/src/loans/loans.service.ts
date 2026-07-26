import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StorageService } from '../storage/storage.service';

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
  ) {}

  async apply(dto: any, files: UploadedLoanFile[]) {
    const loanCount = await this.prisma.loan.count();
    const loanNumber = `L${(loanCount + 1).toString().padStart(8, '0')}`;
    
    // Associate the loan with a Member.
    // Frontend/auth can provide different identifiers depending on auth mode:
    // - member.id (our DB PK)
    // - member.memberId (e.g. MEM0001)
    // - user.id / firebase uid (mapped to Member.userId)
    const rawMemberId = (dto.memberId || dto.userId || '').toString().trim();
    let member =
      (rawMemberId
        ? await this.prisma.member.findFirst({
            where: {
              OR: [
                { id: rawMemberId },
                { memberId: rawMemberId },
                { userId: rawMemberId },
              ],
            },
          })
        : null) || null;

    if (!member) {
      throw new BadRequestException(
        'No member profile found for the logged-in user. Please complete or verify the member profile before applying.',
      );
    }

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

    const newLoan = await this.prisma.loan.create({
      data: {
        loanNumber,
        member: { connect: { id: member.id } },
        type: dto.type || 'Personal Loan',
        amount: parseFloat(dto.amount),
        interestRate: parseFloat(dto.interestRate),
        termMonths: parseInt(dto.termMonths),
        purpose: dto.purpose || 'Personal Use',
        employmentStatus: dto.employmentStatus,
        monthlyIncome: dto.monthlyIncome ? parseFloat(dto.monthlyIncome) : null,
        documents: JSON.stringify(documentPaths),
        status: 'PENDING',
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

    const loan = await this.prisma.loan.update({
      where: { id: loanId },
      data: { 
        status: status as LoanStatus,
        adminRemarks: remarks,
        disbursedAt: status === 'APPROVED' ? new Date() : undefined
      },
      include: { member: true }
    });

    // Trigger notification
    await this.notificationsService.create({
      memberId: loan.memberId,
      title: `Loan ${status}`,
      message: `Your ${loan.type} application (${loan.loanNumber}) has been ${status.toLowerCase()}.${remarks ? ' Remark: ' + remarks : ''}`,
      type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'DANGER' : 'INFO'
    });

    return loan;
  }

  async approveLoan(loanId: string) {
    return this.updateStatus(loanId, 'APPROVED', 'Approved via manual action');
  }

  async getLoan(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: { member: true }
    });
    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  async list(memberId?: string, status?: string) {
    return this.prisma.loan.findMany({
      where: {
        memberId,
        status: status as any
      },
      include: {
        member: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async listForMember(userId: string) {
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
    });
    if (!member) return [];

    return this.prisma.loan.findMany({
      where: { memberId: member.id },
      include: { member: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async checkEligibility(memberId: string, amount: number) {
    return { eligible: true }; 
  }

  async repay(loanId: string, dto: any) {
    return { success: true, message: 'Repayment recorded' };
  }
}
