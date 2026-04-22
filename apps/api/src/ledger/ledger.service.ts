import { Injectable } from '@nestjs/common';

@Injectable()
export class LedgerService {
  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return null;
  }

  async listAccounts() {
    return [];
  }

  async getLedger(accountId: string) {
    return [];
  }

  async recordEntry(...args: any[]) {
    return { success: true };
  }

  async createEntry(dto: any) {
    return { success: true };
  }

  async getAccountBalance(code: string) {
    return 0;
  }
}
