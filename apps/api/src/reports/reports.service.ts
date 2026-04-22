import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  async trialBalance() {
    return { 'Cash': 500000, 'Bank': 1200000 };
  }

  async cashBook() {
    return [];
  }

  async emiDue(memberId?: string) {
    return [];
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
}
