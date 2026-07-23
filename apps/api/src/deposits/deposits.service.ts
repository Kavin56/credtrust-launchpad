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
    // Find member by user ID
    const member = await this.prisma.member.findFirst({
      where: {
        OR: [
          { userId: userId },
          { id: userId }
        ]
      }
    });

    if (!member) {
      throw new BadRequestException(
        'No member profile found for the logged-in user. Please complete the member profile before applying for deposits.'
      );
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

    const kind = fields.kind || 'FD';
    const amount = parseFloat(fields.principal || '0');
    const rate = parseFloat(fields.rate || '0');
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
        status: 'PENDING',
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
        include: { member: true },
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
        createdAt: acc.createdAt,
        updatedAt: acc.updatedAt
      }));

      // Combine both lists
      return [...applications, ...mappedAccounts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Admin view
    return this.prisma.depositApplication.findMany({
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
          maturityDate,
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
}
