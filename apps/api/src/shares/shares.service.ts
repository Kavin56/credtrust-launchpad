import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class SharesService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async list(userId: string) {
    const member = await this.prisma.member.findFirst({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.share.findMany({ where: { memberId: member.id } });
  }

  async purchase(userId: string, units: number, accountId: string) {
    const member = await this.prisma.member.findFirst({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.memberId !== member.id) {
      throw new BadRequestException('Invalid account');
    }

    const faceValue = 100; // Fixed face value for shares
    const totalAmount = units * faceValue;

    if (Number(account.balance) < totalAmount) {
      throw new BadRequestException('Insufficient balance to purchase shares');
    }

    return this.prisma.$transaction(async (tx) => {
      // Deduct from account
      await tx.account.update({
        where: { id: accountId },
        data: { balance: account.balance.sub(new Decimal(totalAmount)) },
      });

      // Create share certificate
      const certificateNo = `SHC${Date.now()}`;
      const share = await tx.share.create({
        data: {
          memberId: member.id,
          certificateNo,
          units,
          faceValue: new Decimal(faceValue),
        },
      });

      // Record in ledger
      await this.ledger.recordJournal(
        'SHARE_PURCHASE',
        share.id,
        [
          { accountId: accountId, type: 'DR', amount: totalAmount },
          { accountId: 'SHARE_CAPITAL', type: 'CR', amount: totalAmount },
        ],
        `Share purchase of ${units} units by member ${member.id}`,
        member.id,
        tx,
      );

      return share;
    });
  }
}
