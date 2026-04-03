import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  list(memberId: string) {
    return this.prisma.account.findMany({ where: { memberId } });
  }

  async create(memberId: string, type: string) {
    const number = `AC${Date.now()}`; // simplistic; replace with sequence
    return this.prisma.account.create({
      data: {
        memberId,
        type,
        number,
        balance: new Decimal(0),
      },
    });
  }

  async credit(accountId: string, amount: number) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new BadRequestException('Account not found');
    return this.prisma.account.update({
      where: { id: accountId },
      data: { balance: account.balance.add(new Decimal(amount)) },
    });
  }
}
