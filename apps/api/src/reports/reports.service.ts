import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';

export interface PaymentHistoryQueryDto {
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
  productType?: 'ALL' | 'LOAN' | 'DEPOSIT' | 'PIGMY';
  status?: string;
  memberId?: string;
  registeredId?: string;
  customerName?: string;
}

export interface PaymentHistoryRecord {
  id: string;
  transactionId: string;
  registeredId: string;
  customerName: string;
  productType: 'Loan' | 'Deposit' | 'Pigmy';
  productName: string;
  paymentDate: Date;
  dueDate?: Date | null;
  amountPaid: number;
  outstandingBalance: number;
  paymentMode: string;
  paymentStatus: string;
  referenceNumber: string;
  remarks?: string;
}

export interface PaymentHistoryData {
  records: PaymentHistoryRecord[];
  summary: {
    totalCount: number;
    totalAmountPaid: number;
    totalPendingAmount: number;
    productBreakdown: { loan: number; deposit: number; pigmy: number };
  };
  meta: {
    generatedAt: Date;
    generatedBy: string;
    appliedFilters: Record<string, string>;
  };
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async trialBalance() {
    return { 'Cash': 500000, 'Bank': 1200000 };
  }

  async cashBook() {
    return [];
  }

  async emiDue(userId?: string) {
    if (!userId) return [];
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
    });
    if (!member) return [];

    const activeLoans = await this.prisma.loan.findMany({
      where: {
        memberId: member.id,
        status: { in: ['APPROVED', 'ACTIVE', 'DISBURSED'] },
      },
      include: {
        emiSchedule: {
          where: { isPaid: false },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    const dues = [];
    for (const loan of activeLoans) {
      for (const emi of loan.emiSchedule) {
        dues.push({
          id: emi.id,
          loanId: loan.id,
          loanNumber: loan.loanNumber,
          loanType: loan.type,
          dueDate: emi.dueDate,
          totalDue: emi.totalEmi,
          principalPart: emi.principalPart,
          interestPart: emi.interestPart,
        });
      }
    }
    return dues;
  }

  async balanceSheet() {
    return {
      assets: [],
      liabilities: [],
      totalAssets: 1700000,
      totalLiabilities: 0,
    };
  }

  async trialBalancePdf() {
    return Buffer.from('Mock PDF');
  }

  async trialBalanceExcel() {
    return Buffer.from('Mock Excel');
  }

  // --- PAYMENT HISTORY MODULE ---

  async fetchPaymentHistoryData(
    filters: PaymentHistoryQueryDto,
    requestingUserId?: string,
    requestingUserRole = 'ADMIN',
  ): Promise<PaymentHistoryData> {
    let targetMemberId: string | undefined = filters.memberId;

    // Enforce strict data isolation for MEMBER role
    if (requestingUserRole === 'MEMBER') {
      if (!requestingUserId) {
        throw new ForbiddenException('User authentication required');
      }
      const member = await this.prisma.member.findFirst({
        where: { OR: [{ userId: requestingUserId }, { id: requestingUserId }, { memberId: requestingUserId }] },
      });
      if (!member) {
        return {
          records: [],
          summary: { totalCount: 0, totalAmountPaid: 0, totalPendingAmount: 0, productBreakdown: { loan: 0, deposit: 0, pigmy: 0 } },
          meta: { generatedAt: new Date(), generatedBy: 'Member', appliedFilters: {} },
        };
      }
      targetMemberId = member.id;
    }

    const dateWhere: { gte?: Date; lte?: Date } = {};
    if (filters.startDate) {
      dateWhere.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      dateWhere.lte = end;
    }
    if (filters.year && !filters.startDate) {
      const year = parseInt(filters.year, 10);
      if (!isNaN(year)) {
        if (filters.month) {
          const month = parseInt(filters.month, 10) - 1; // 0-indexed
          dateWhere.gte = new Date(year, month, 1);
          dateWhere.lte = new Date(year, month + 1, 0, 23, 59, 59, 999);
        } else {
          dateWhere.gte = new Date(year, 0, 1);
          dateWhere.lte = new Date(year, 11, 31, 23, 59, 59, 999);
        }
      }
    }

    const records: PaymentHistoryRecord[] = [];
    const productType = (filters.productType || 'ALL').toUpperCase();

    // 1. LOAN REPAYMENTS
    if (productType === 'ALL' || productType === 'LOAN') {
      const loans = await this.prisma.loan.findMany({
        where: {
          ...(targetMemberId ? { memberId: targetMemberId } : {}),
          ...(filters.registeredId ? { registeredId: { contains: filters.registeredId } } : {}),
          ...(filters.customerName ? { member: { fullName: { contains: filters.customerName } } } : {}),
        },
        include: {
          member: true,
          repayments: {
            where: Object.keys(dateWhere).length > 0 ? { createdAt: dateWhere } : undefined,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      for (const loan of loans) {
        for (const rep of loan.repayments) {
          const status = 'COMPLETED';
          if (filters.status && filters.status !== 'ALL' && filters.status.toUpperCase() !== status) {
            continue;
          }
          records.push({
            id: rep.id,
            transactionId: rep.referenceNumber || `LOAN-REP-${rep.id.slice(-6)}`,
            registeredId: loan.registeredId || (loan.member as any).rojaId || loan.member.memberId || 'N/A',
            customerName: loan.member.fullName,
            productType: 'Loan',
            productName: `${loan.type} Loan (${loan.loanNumber})`,
            paymentDate: rep.createdAt,
            dueDate: loan.monthlyPaymentDate ? new Date(rep.createdAt.getFullYear(), rep.createdAt.getMonth(), loan.monthlyPaymentDate) : null,
            amountPaid: rep.amount,
            outstandingBalance: Math.max(0, loan.amount - rep.amount),
            paymentMode: rep.paymentMode || 'ONLINE',
            paymentStatus: status,
            referenceNumber: rep.referenceNumber || rep.id,
            remarks: `Loan repayment for ${loan.loanNumber}`,
          });
        }
      }
    }

    // 2. DEPOSIT TRANSACTIONS
    if (productType === 'ALL' || productType === 'DEPOSIT') {
      const deposits = await this.prisma.depositAccount.findMany({
        where: {
          ...(targetMemberId ? { memberId: targetMemberId } : {}),
          ...(filters.customerName ? { member: { fullName: { contains: filters.customerName } } } : {}),
        },
        include: {
          member: true,
          transactions: {
            where: Object.keys(dateWhere).length > 0 ? { createdAt: dateWhere } : undefined,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      for (const dep of deposits) {
        for (const tx of dep.transactions) {
          const status = 'COMPLETED';
          if (filters.status && filters.status !== 'ALL' && filters.status.toUpperCase() !== status) {
            continue;
          }
          records.push({
            id: tx.id,
            transactionId: tx.referenceNumber || `DEP-TXN-${tx.id.slice(-6)}`,
            registeredId: (dep.member as any).rojaId || dep.member.memberId || 'N/A',
            customerName: dep.member.fullName,
            productType: 'Deposit',
            productName: `${dep.type} Deposit`,
            paymentDate: tx.createdAt,
            dueDate: null,
            amountPaid: tx.amount,
            outstandingBalance: tx.balanceAfter,
            paymentMode: tx.paymentMode || 'CASH',
            paymentStatus: status,
            referenceNumber: tx.referenceNumber || tx.id,
            remarks: `${tx.type} transaction`,
          });
        }
      }
    }

    // 3. PIGMY COLLECTIONS
    if (productType === 'ALL' || productType === 'PIGMY') {
      const pigmyAccounts = await this.prisma.pigmyAccount.findMany({
        where: {
          ...(targetMemberId ? { memberId: targetMemberId } : {}),
          ...(filters.registeredId ? { registeredId: { contains: filters.registeredId } } : {}),
          ...(filters.customerName ? { member: { fullName: { contains: filters.customerName } } } : {}),
        },
        include: {
          member: true,
          scheme: true,
          collections: {
            where: Object.keys(dateWhere).length > 0 ? { date: dateWhere } : undefined,
            orderBy: { date: 'desc' },
          },
        },
      });

      for (const pig of pigmyAccounts) {
        for (const col of pig.collections) {
          const status = col.status.toUpperCase();
          if (filters.status && filters.status !== 'ALL' && filters.status.toUpperCase() !== status) {
            continue;
          }
          records.push({
            id: col.id,
            transactionId: col.transactionId || col.receiptNumber || `PIG-${col.id.slice(-6)}`,
            registeredId: pig.registeredId || (pig.member as any).rojaId || pig.member.memberId || 'N/A',
            customerName: col.customerName || pig.member.fullName,
            productType: 'Pigmy',
            productName: `Pigmy Deposit (${pig.accountNumber})`,
            paymentDate: col.date,
            dueDate: null,
            amountPaid: col.amount,
            outstandingBalance: pig.balance,
            paymentMode: col.method || 'CASH',
            paymentStatus: status,
            referenceNumber: col.referenceId || col.receiptNumber || col.id,
            remarks: col.remarks || `Pigmy collection`,
          });
        }
      }
    }

    // Sort all records by date descending
    records.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    // Calculate Summary Stats
    const totalCount = records.length;
    const totalAmountPaid = records
      .filter((r) => r.paymentStatus === 'COMPLETED' || r.paymentStatus === 'PAID')
      .reduce((sum, r) => sum + r.amountPaid, 0);
    const totalPendingAmount = records
      .filter((r) => r.paymentStatus === 'PENDING' || r.paymentStatus === 'INITIATED')
      .reduce((sum, r) => sum + r.amountPaid, 0);

    const productBreakdown = {
      loan: records.filter((r) => r.productType === 'Loan').length,
      deposit: records.filter((r) => r.productType === 'Deposit').length,
      pigmy: records.filter((r) => r.productType === 'Pigmy').length,
    };

    const appliedFilters: Record<string, string> = {};
    if (filters.startDate) appliedFilters['From Date'] = filters.startDate;
    if (filters.endDate) appliedFilters['To Date'] = filters.endDate;
    if (filters.productType && filters.productType !== 'ALL') appliedFilters['Product'] = filters.productType;
    if (filters.status && filters.status !== 'ALL') appliedFilters['Status'] = filters.status;
    if (filters.registeredId) appliedFilters['Registered ID'] = filters.registeredId;

    return {
      records,
      summary: {
        totalCount,
        totalAmountPaid,
        totalPendingAmount,
        productBreakdown,
      },
      meta: {
        generatedAt: new Date(),
        generatedBy: requestingUserRole === 'MEMBER' ? 'Member Portal' : 'Administrator',
        appliedFilters,
      },
    };
  }

  // PDF Generator using PDFKit
  async generatePaymentHistoryPdfBuffer(
    data: PaymentHistoryData,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: any) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fillColor('#1a1f36').fontSize(16).font('Helvetica-Bold').text('SRI ROJA SHABARISH GURUJI SOUHARADA SAHAKARA NIYAMITHA', { align: 'center' });
        doc.fillColor('#6b21a8').fontSize(10).font('Helvetica-Bold').text('SHARANAM FINANCIAL SERVICES', { align: 'center' });
        doc.moveDown(0.3);
        doc.strokeColor('#c9a84c').lineWidth(2).moveTo(30, doc.y).lineTo(565, doc.y).stroke();
        doc.moveDown(0.5);

        // Report Title & Meta
        doc.fillColor('#1a1f36').fontSize(14).font('Helvetica-Bold').text('STATEMENT OF PAYMENT HISTORY', { align: 'left' });
        doc.fillColor('#64748b').fontSize(8).font('Helvetica').text(`Generated On: ${data.meta.generatedAt.toLocaleString('en-IN')} | Generated By: ${data.meta.generatedBy}`);
        doc.moveDown(0.5);

        // Summary Box
        const summaryY = doc.y;
        doc.rect(30, summaryY, 535, 45).fill('#f8fafc').stroke('#e2e8f0');
        doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold');
        doc.text(`Total Transactions: ${data.summary.totalCount}`, 40, summaryY + 8);
        doc.text(`Total Amount Paid: Rs. ${data.summary.totalAmountPaid.toLocaleString('en-IN')}`, 180, summaryY + 8);
        doc.text(`Pending Payments: Rs. ${data.summary.totalPendingAmount.toLocaleString('en-IN')}`, 370, summaryY + 8);

        doc.fontSize(8).font('Helvetica').fillColor('#64748b');
        doc.text(`Breakdown: Loans (${data.summary.productBreakdown.loan}) | Deposits (${data.summary.productBreakdown.deposit}) | Pigmy (${data.summary.productBreakdown.pigmy})`, 40, summaryY + 26);

        doc.y = summaryY + 55;

        // Table Headers
        const tableTop = doc.y;
        doc.rect(30, tableTop, 535, 20).fill('#1a1f36');
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');

        doc.text('Date', 35, tableTop + 5, { width: 55 });
        doc.text('Txn ID / Ref', 95, tableTop + 5, { width: 85 });
        doc.text('Reg ID', 185, tableTop + 5, { width: 65 });
        doc.text('Customer / Product', 255, tableTop + 5, { width: 130 });
        doc.text('Mode', 390, tableTop + 5, { width: 45 });
        doc.text('Amount (Rs)', 440, tableTop + 5, { width: 60, align: 'right' });
        doc.text('Status', 505, tableTop + 5, { width: 55, align: 'center' });

        let currentY = tableTop + 22;
        doc.font('Helvetica').fontSize(7.5);

        data.records.slice(0, 100).forEach((rec: any, idx: number) => {
          if (currentY > 750) {
            doc.addPage();
            currentY = 40;
          }

          if (idx % 2 === 1) {
            doc.rect(30, currentY - 2, 535, 18).fill('#f1f5f9');
          }

          const dateStr = new Date(rec.paymentDate).toLocaleDateString('en-IN');
          doc.fillColor('#0f172a');
          doc.text(dateStr, 35, currentY, { width: 55 });
          doc.text(rec.transactionId.slice(0, 14), 95, currentY, { width: 85 });
          doc.text(rec.registeredId, 185, currentY, { width: 65 });
          doc.text(`${rec.customerName} - ${rec.productName.slice(0, 18)}`, 255, currentY, { width: 130 });
          doc.text(rec.paymentMode, 390, currentY, { width: 45 });
          doc.text(rec.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 }), 440, currentY, { width: 60, align: 'right' });

          const statusColor = rec.paymentStatus === 'COMPLETED' || rec.paymentStatus === 'PAID' ? '#16a34a' : rec.paymentStatus === 'PENDING' ? '#d97706' : '#dc2626';
          doc.fillColor(statusColor).text(rec.paymentStatus, 505, currentY, { width: 55, align: 'center' });

          currentY += 18;
        });

        // Footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.fillColor('#94a3b8').fontSize(7).text(`Page ${i + 1} of ${pageCount} | Official Financial Document - Sharanam Souharada Society`, 30, 810, { align: 'center' });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  // Excel Generator using ExcelJS
  async generatePaymentHistoryExcelBuffer(
    data: PaymentHistoryData,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sharanam Souharada Society';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Payment History', {
      views: [{ showGridLines: true }],
    });

    // Title Block
    sheet.mergeCells('A1:K1');
    sheet.getCell('A1').value = 'SRI ROJA SHABARISH GURUJI SOUHARADA SAHAKARA NIYAMITHA';
    sheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1A1F36' } };
    sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    sheet.mergeCells('A2:K2');
    sheet.getCell('A2').value = `STATEMENT OF PAYMENT HISTORY | Generated On: ${data.meta.generatedAt.toLocaleString('en-IN')}`;
    sheet.getCell('A2').font = { name: 'Arial', size: 10, bold: true, color: { argb: '6B21A8' } };
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    // Summary Block
    sheet.addRow([]);
    sheet.addRow(['SUMMARY STATISTICS']);
    sheet.getCell('A4').font = { bold: true, size: 11 };

    sheet.addRow(['Total Transactions', data.summary.totalCount, 'Total Amount Paid (Rs)', data.summary.totalAmountPaid, 'Pending Amount (Rs)', data.summary.totalPendingAmount]);
    sheet.getRow(5).font = { bold: true };

    sheet.addRow([]);

    // Table Header Row
    const headerRow = sheet.addRow([
      'Sl No',
      'Transaction ID',
      'Registered ID',
      'Customer Name',
      'Product Type',
      'Product Name',
      'Payment Date',
      'Amount Paid (Rs)',
      'Payment Mode',
      'Payment Status',
      'Reference / Remarks',
    ]);

    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6B21A8' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Data Rows
    data.records.forEach((rec: any, index: number) => {
      const row = sheet.addRow([
        index + 1,
        rec.transactionId,
        rec.registeredId,
        rec.customerName,
        rec.productType,
        rec.productName,
        new Date(rec.paymentDate).toLocaleDateString('en-IN'),
        rec.amountPaid,
        rec.paymentMode,
        rec.paymentStatus,
        rec.referenceNumber || rec.remarks || '-',
      ]);

      (row.getCell(8) as any).numFmt = '₹#,##0.00';
      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
        });
      }
    });

    // Auto-fit columns
    sheet.columns.forEach((col) => {
      let maxLen = 12;
      col.eachCell?.({ includeEmpty: true }, (cell) => {
        const val = cell.value ? String(cell.value) : '';
        if (val.length > maxLen) maxLen = Math.min(val.length, 40);
      });
      col.width = maxLen + 3;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // CSV Generator
  async generatePaymentHistoryCsvString(
    data: PaymentHistoryData,
  ): Promise<string> {
    const headers = [
      'Transaction ID',
      'Registered ID',
      'Customer Name',
      'Product Type',
      'Product Name',
      'Payment Date',
      'Amount Paid',
      'Payment Mode',
      'Payment Status',
      'Reference Number',
    ];

    const escapeCsv = (val: any) => {
      const str = val === null || val === undefined ? '' : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = data.records.map((r: any) => [
      escapeCsv(r.transactionId),
      escapeCsv(r.registeredId),
      escapeCsv(r.customerName),
      escapeCsv(r.productType),
      escapeCsv(r.productName),
      escapeCsv(new Date(r.paymentDate).toLocaleDateString('en-IN')),
      escapeCsv(r.amountPaid),
      escapeCsv(r.paymentMode),
      escapeCsv(r.paymentStatus),
      escapeCsv(r.referenceNumber || '-'),
    ]);

    return [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
  }
}
