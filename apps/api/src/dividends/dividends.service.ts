import { Injectable } from '@nestjs/common';

@Injectable()
export class DividendsService {
  async calculate(year: number, rate: number) {
    return { success: true };
  }

  async list() {
    return [];
  }

  async declare(...args: any[]) {
    return { success: true };
  }

  async findAll(memberId?: string) {
    return [];
  }
}
