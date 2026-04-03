import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async trialBalance() {
    const txns = await this.prisma.transaction.findMany();
    const balances: Record<string, number> = {};
    txns.forEach((t) => {
      balances[t.drAccountId] = (balances[t.drAccountId] || 0) + Number(t.amount);
      balances[t.crAccountId] = (balances[t.crAccountId] || 0) - Number(t.amount);
    });
    return balances;
  }

  async cashBook() {
    return this.prisma.transaction.findMany({
      where: { OR: [{ drAccountId: 'CASH' }, { crAccountId: 'CASH' }] },
      orderBy: { txnDate: 'desc' },
    });
  }

  async emiDue(memberId: string) {
    return this.prisma.emiSchedule.findMany({
      where: { loan: { memberId }, paid: false },
      orderBy: { dueDate: 'asc' },
    });
  }

  async trialBalancePdf() {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.fontSize(18).text('Trial Balance', { align: 'center' });
    doc.moveDown();
    const balances = await this.trialBalance();
    doc.fontSize(12);
    Object.entries(balances).forEach(([acc, bal]) => {
      doc.text(`${acc}: ${bal.toFixed(2)}`);
    });
    doc.end();
    return Buffer.concat(buffers);
  }

  async trialBalanceExcel() {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Trial Balance');
    sheet.columns = [
      { header: 'Account', key: 'account' },
      { header: 'Balance', key: 'balance' },
    ];
    const balances = await this.trialBalance();
    Object.entries(balances).forEach(([acc, bal]) => {
      sheet.addRow({ account: acc, balance: bal });
    });
    return workbook.xlsx.writeBuffer();
  }
}
