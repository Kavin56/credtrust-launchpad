import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as fs from 'fs';
import { resolve } from 'path';

type UploadedDepositFile = {
  fieldname: string;
  filename: string;
  mimetype?: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class DepositsService {
  private readonly uploadDir = resolve(
    process.cwd(),
    process.env.LOCAL_UPLOAD_DIR || '../../uploads',
    'deposits',
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async apply(userId: string, fields: any, files: UploadedDepositFile[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      const rawId = (fields.registeredId || '').toString().trim();
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

    if (!fields.startDate || !fields.endDate || !fields.monthlyPaymentDate) {
      throw new BadRequestException('Start Date, End Date, and Monthly Payment Date are mandatory');
    }
    const startDate = new Date(fields.startDate);
    const endDate = new Date(fields.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('End Date cannot be earlier than Start Date');
    }
    const monthlyPaymentDate = parseInt(fields.monthlyPaymentDate);
    if (isNaN(monthlyPaymentDate) || monthlyPaymentDate < 1 || monthlyPaymentDate > 31) {
      throw new BadRequestException('Monthly Payment Date must be between 1 and 31');
    }

    const documentPaths: Record<string, string> = {};

    // Handle file uploads
    for (const file of files) {
      const filename = `${Date.now()}-${file.filename}`;
      const filePath = resolve(this.uploadDir, filename);
      await fs.promises.writeFile(filePath, file.buffer);
      
      // Store relative path for frontend access
      documentPaths[file.fieldname] = `/uploads/deposits/${filename}`;
    }

    const kind = fields.type || 'FD';
    const amount = parseFloat(fields.amount || '0');
    const rate = parseFloat(fields.interestRate || '10');
    const tenureMonths = parseInt(fields.tenureMonths || '12');

    const appCount = await this.prisma.depositApplication.count();
    const applicationNo = `DEP-${kind}-${(appCount + 1).toString().padStart(6, '0')}`;

    const newApplication = await this.prisma.depositApplication.create({
      data: {
        applicationNo,
        memberId: member.id,
        type: kind,
        amount,
        interestRate: rate,
        termMonths: tenureMonths,
        status: initialStatus,
        registeredId: formattedId,
        startDate,
        endDate,
        monthlyPaymentDate,
        documents: JSON.stringify(documentPaths),
        additionalDetails: fields.additionalDetails || null,
      },
      include: {
        member: true
      }
    });

    return newApplication;
  }

  async list(memberId?: string, status?: string) {
    // If querying as a member, list BOTH approved active accounts AND pending/rejected applications
    if (memberId) {
      const applications = await this.prisma.depositApplication.findMany({
        where: {
          memberId,
          status: status as any
        },
        include: { member: true },
        orderBy: { createdAt: 'desc' }
      });

      // Active approved deposit accounts
      const activeAccounts = await this.prisma.depositAccount.findMany({
        where: { memberId },
        include: { member: true, transactions: { orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'desc' }
      });

      // Map active accounts to match the same shape
      const mappedAccounts = activeAccounts.map(acc => ({
        id: acc.id,
        applicationNo: acc.accountNumber,
        memberId: acc.memberId,
        member: acc.member,
        type: acc.type,
        amount: acc.balance,
        interestRate: acc.interestRate,
        termMonths: 12, // default or calculated
        status: 'APPROVED',
        documents: null,
        additionalDetails: null,
        startDate: acc.startDate,
        endDate: acc.endDate,
        maturityDate: acc.maturityDate,
        monthlyPaymentDate: acc.monthlyPaymentDate,
        transactions: acc.transactions,
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt
      }));

      // Combine both lists
      return [...applications, ...mappedAccounts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Admin view
    const apps = await this.prisma.depositApplication.findMany({
      where: {
        status: status as any
      },
      include: {
        member: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (status === 'APPROVED') {
      const appsWithTxns = [];
      for (const app of apps) {
        const account = await this.prisma.depositAccount.findFirst({
          where: { memberId: app.memberId, type: app.type },
          include: { transactions: { orderBy: { createdAt: 'desc' } } }
        });
        appsWithTxns.push({
          ...app,
          accountNumber: account?.accountNumber,
          transactions: account?.transactions || []
        });
      }
      return appsWithTxns;
    }
    return apps;
  }

  async updateStatus(id: string, status: string, remarks?: string, adminName?: string) {
    const application = await this.prisma.depositApplication.findUnique({
      where: { id },
      include: { member: true }
    });

    if (!application) {
      throw new NotFoundException('Deposit application not found');
    }

    const updated = await this.prisma.depositApplication.update({
      where: { id },
      data: {
        status,
        adminRemarks: remarks,
        approvedBy: status === 'APPROVED' ? (adminName || 'Admin') : null,
        approvedDate: status === 'APPROVED' ? new Date() : null,
      },
      include: { member: true }
    });

    if (status === 'APPROVED') {
      // Create DepositAccount
      const accCount = await this.prisma.depositAccount.count();
      const accountNumber = `DP-${application.type}-${(accCount + 1).toString().padStart(8, '0')}`;
      
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + application.termMonths);

      // Simple compounding interest calculation for FD/RD
      const principal = application.amount;
      const rate = application.interestRate / 100;
      const t = application.termMonths / 12;
      const maturityAmount = principal * Math.pow(1 + rate / 4, 4 * t); // Quarterly compounded

      const account = await this.prisma.depositAccount.create({
        data: {
          accountNumber,
          memberId: application.memberId,
          type: application.type,
          balance: application.amount,
          interestRate: application.interestRate,
          maturityAmount: Math.round(maturityAmount * 100) / 100,
          maturityDate: application.endDate || maturityDate,
          startDate: application.startDate || new Date(),
          endDate: application.endDate || maturityDate,
          monthlyPaymentDate: application.monthlyPaymentDate || 5,
          isMatured: false,
        }
      });

      // Create transaction
      await this.prisma.depositTransaction.create({
        data: {
          accountId: account.id,
          amount: application.amount,
          type: 'DEPOSIT',
          paymentMode: 'ONLINE',
          referenceNumber: application.applicationNo,
          balanceAfter: application.amount,
        }
      });

      // Trigger notification
      await this.notificationsService.create({
        memberId: application.memberId,
        title: 'Deposit Approved & Account Opened',
        message: `Your ${application.type} deposit request of ₹${application.amount.toLocaleString()} has been approved. Account ${accountNumber} is active.`,
        type: 'SUCCESS'
      });
    } else if (status === 'REJECTED') {
      // Trigger notification
      await this.notificationsService.create({
        memberId: application.memberId,
        title: 'Deposit Application Rejected',
        message: `Your ${application.type} deposit request of ₹${application.amount.toLocaleString()} has been rejected.${remarks ? ' Remark: ' + remarks : ''}`,
        type: 'DANGER'
      });
    }

    return updated;
  }

  async addTransaction(applicationId: string, dto: any) {
    const app = await this.prisma.depositApplication.findUnique({
      where: { id: applicationId }
    });
    if (!app) throw new NotFoundException('Application not found');
    const account = await this.prisma.depositAccount.findFirst({
      where: { memberId: app.memberId, type: app.type }
    });
    if (!account) throw new NotFoundException('Deposit account not found');

    const amount = parseFloat(dto.amount);
    const type = dto.type || 'DEPOSIT';
    const paymentMode = dto.paymentMode || 'CASH';
    const referenceNumber = dto.referenceNumber || null;

    const newBalance = type === 'DEPOSIT' 
      ? account.balance + amount 
      : account.balance - amount;

    await this.prisma.depositAccount.update({
      where: { id: account.id },
      data: { balance: newBalance }
    });

    return this.prisma.depositTransaction.create({
      data: {
        accountId: account.id,
        amount,
        type,
        paymentMode,
        referenceNumber,
        balanceAfter: newBalance
      }
    });
  }
}
