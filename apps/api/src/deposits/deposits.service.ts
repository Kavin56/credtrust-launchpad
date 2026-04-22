import { Injectable } from '@nestjs/common';

@Injectable()
export class DepositsService {
  async list(...args: any[]) {
    return [];
  }

  async create(...args: any[]) {
    return { success: true };
  }

  async deposit(id: string, amount: number) {
    return { success: true };
  }

  async withdraw(id: string, amount: number) {
    return { success: true };
  }
}
