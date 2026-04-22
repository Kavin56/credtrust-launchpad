import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AccountsService {
  async list(memberId: string) {
    return [];
  }

  async create(memberId: string, type: string) {
    return { id: 'ac1', number: 'AC001', balance: 0 };
  }

  async credit(accountId: string, amount: number) {
    return { success: true };
  }
}
