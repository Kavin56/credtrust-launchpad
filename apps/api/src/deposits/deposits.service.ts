import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepositAccountDto } from './dto/create-account.dto';
import { DepositTransactionDto } from './dto/deposit-txn.dto';
import { TransactionType, DepositType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DepositsService {
  constructor(private prisma: PrismaService) {}

  async createAccount(dto: CreateDepositAccountDto) {
    const totalAccounts = await this.prisma.depositAccount.count();
    const accountNumber = `DEP${(totalAccounts + 1).toString().padStart(7, '0')}`;

    return this.prisma.depositAccount.create({
      data: {
        accountNumber,
        memberId: dto.memberId,
        type: dto.type,
        interestRate: new Decimal(dto.interestRate),
        maturityAmount: dto.maturityAmount ? new Decimal(dto.maturityAmount) : null,
        maturityDate: dto.maturityDate ? new Date(dto.maturityDate) : null,
        balance: new Decimal(0),
      },
    });
  }

  async collectTransaction(accountId: string, dto: DepositTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.depositAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) throw new NotFoundException('Account not found');

      const amount = new Decimal(dto.amount);
      let newBalance = new Decimal(account.balance);

      if (dto.type === TransactionType.DEPOSIT || dto.type === TransactionType.INTEREST || dto.type === TransactionType.DIVIDEND) {
        newBalance = newBalance.add(amount);
      } else {
        if (newBalance.lessThan(amount)) throw new BadRequestException('Insufficient balance');
        newBalance = newBalance.sub(amount);
      }

      const transaction = await tx.depositTransaction.create({
        data: {
          accountId,
          amount,
          type: dto.type,
          paymentMode: dto.paymentMode,
          referenceNumber: dto.referenceNumber,
          balanceAfter: newBalance,
        },
      });

      await tx.depositAccount.update({
        where: { id: accountId },
        data: { balance: newBalance },
      });

      return transaction;
    });
  }

  async getAccount(id: string) {
    const account = await this.prisma.depositAccount.findUnique({
      where: { id },
      include: { transactions: { orderBy: { createdAt: 'desc' } } },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async listAccounts(memberId?: string) {
    return this.prisma.depositAccount.findMany({
      where: memberId ? { memberId } : {},
      include: { member: true },
    });
  }

  async calculateAndPostInterest(type: DepositType) {
    const accounts = await this.prisma.depositAccount.findMany({
      where: { type, isMatured: false },
    });

    for (const account of accounts) {
      // Simple daily/monthly interest logic for MVP
      // For Savings: balance * rate / 12 / 100
      const interestAmount = account.balance
        .mul(account.interestRate)
        .div(100)
        .div(12);

      if (interestAmount.greaterThan(0)) {
        await this.collectTransaction(account.id, {
          amount: interestAmount.toNumber(),
          type: TransactionType.INTEREST,
          paymentMode: 'SYSTEM',
          referenceNumber: `INT-${new Date().toISOString().slice(0, 7)}`,
        });
      }
    }
  }
}
