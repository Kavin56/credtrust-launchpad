import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async listAccounts() {
    return this.prisma.ledgerAccount.findMany();
  }

  async record(
    refType: string,
    refId: string,
    drAccountId: string,
    crAccountId: string,
    amount: number,
    narration: string,
    createdBy?: string,
  ) {
    return this.prisma.transaction.create({
      data: {
        refType,
        refId,
        drAccountId,
        crAccountId,
        amount: new Decimal(amount),
        narration,
        createdBy,
      },
    });
  }
}
