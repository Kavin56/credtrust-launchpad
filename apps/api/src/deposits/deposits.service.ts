import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { PayRdInstallmentDto } from './dto/pay-rd-installment.dto';
import { addMonths } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';
import { LedgerService } from '../ledger/ledger.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DepositsService {
  private readonly logger = new Logger(DepositsService.name);

  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  async create(memberId: string, dto: CreateDepositDto) {
    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });
    if (!account || account.memberId !== memberId) {
      throw new BadRequestException('Invalid account');
    }

    const start = new Date(dto.startDate);
    const maturity = addMonths(start, dto.tenureMonths);
    const schedules =
      dto.kind === 'RD'
        ? this.buildRdSchedule(dto.principal, dto.rate, start, dto.tenureMonths)
        : [];

    return this.prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.create({
        data: {
          memberId,
          accountId: dto.accountId,
          kind: dto.kind,
          principal: new Decimal(dto.principal),
          rate: new Decimal(dto.rate),
          tenureMonths: dto.tenureMonths,
          startDate: start,
          maturityDate: maturity,
          payoutMode: dto.payoutMode,
          schedules: { createMany: { data: schedules } },
        },
        include: { schedules: true },
      });

      if (dto.kind === 'FD') {
        // Deduct from savings, credit to FD liability
        if (Number(account.balance) < dto.principal) {
          throw new BadRequestException('Insufficient balance in savings account');
        }

        await tx.account.update({
          where: { id: account.id },
          data: { balance: { decrement: dto.principal } },
        });

        await this.ledger.recordJournal(
          'FD_CREATION',
          deposit.id,
          [
            { accountId: account.id, type: 'DR', amount: dto.principal },
            { accountId: 'DEPOSIT_LIAB', type: 'CR', amount: dto.principal },
          ],
          `FD Creation for member ${memberId}`,
          memberId,
          tx,
        );
      }

      return deposit;
    });
  }

  async list(memberId: string) {
    return this.prisma.deposit.findMany({ where: { memberId }, include: { schedules: true } });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processMaturedDeposits() {
    this.logger.log('Running daily maturity check for deposits...');
    const today = new Date();
    
    const maturedDeposits = await this.prisma.deposit.findMany({
      where: {
        status: 'ACTIVE',
        maturityDate: { lte: today },
      },
      include: { account: true },
    });

    for (const deposit of maturedDeposits) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Calculate maturity amount (simple interest for now)
          const principal = Number(deposit.principal);
          const rate = Number(deposit.rate) / 100;
          const years = deposit.tenureMonths / 12;
          const interest = principal * rate * years;
          const maturityAmount = principal + interest;

          // Update deposit status
          await tx.deposit.update({
            where: { id: deposit.id },
            data: { status: 'MATURED' },
          });

          // Credit the linked savings account
          await tx.account.update({
            where: { id: deposit.accountId },
            data: { balance: { increment: maturityAmount } },
          });

          // Record in ledger
          // Debit: Deposit Liability (Principal)
          // Debit: Interest Expense (Interest)
          // Credit: Savings Account (Total)
          await this.ledger.recordJournal(
            'DEPOSIT_MATURITY',
            deposit.id,
            [
              { accountId: 'DEPOSIT_LIAB', type: 'DR', amount: principal },
              { accountId: 'RETAINED_EARNINGS', type: 'DR', amount: interest }, // Using retained earnings as a proxy for interest expense
              { accountId: deposit.accountId, type: 'CR', amount: maturityAmount },
            ],
            `Maturity payout for deposit ${deposit.id}`,
            'SYSTEM',
            tx,
          );
        });
        this.logger.log(`Processed maturity for deposit ${deposit.id}`);
      } catch (error) {
        this.logger.error(`Failed to process maturity for deposit ${deposit.id}`, error);
      }
    }
  }

  async payRdInstallment(memberId: string, dto: PayRdInstallmentDto) {
    const schedule = await this.prisma.depositSchedule.findUnique({
      where: { id: dto.scheduleId },
      include: { deposit: true },
    });

    if (!schedule || schedule.deposit.memberId !== memberId) {
      throw new NotFoundException('RD Installment schedule not found');
    }
    if (schedule.paid) {
      throw new BadRequestException('Installment already paid');
    }
    if (dto.amount < Number(schedule.amount)) {
      throw new BadRequestException('Paid amount is less than due amount');
    }

    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });
    if (!account || account.memberId !== memberId) {
      throw new BadRequestException('Invalid account for payment');
    }
    if (Number(account.balance) < dto.amount) {
      throw new BadRequestException('Insufficient balance in payment account');
    }

    return this.prisma.$transaction(async (tx) => {
      // Mark schedule as paid
      await tx.depositSchedule.update({
        where: { id: dto.scheduleId },
        data: { paid: true, paidOn: new Date(dto.paidOn) },
      });

      // Deduct from member's account
      await tx.account.update({
        where: { id: account.id },
        data: { balance: { decrement: dto.amount } },
      });

      // Record ledger entry
      // Debit: Member's Savings Account (or Cash)
      // Credit: DEPOSIT_LIAB (Liability)
      await this.ledger.recordJournal(
        'RD_INSTALLMENT',
        dto.scheduleId,
        [
          { accountId: account.id, type: 'DR', amount: dto.amount },
          { accountId: 'DEPOSIT_LIAB', type: 'CR', amount: dto.amount },
        ],
        `RD installment payment for deposit ${schedule.depositId}`,
        memberId,
        tx,
      );

      // Update next due date for the main deposit
      const remainingSchedules = await tx.depositSchedule.findMany({
        where: { depositId: schedule.depositId, paid: false },
        orderBy: { dueDate: 'asc' },
        take: 1,
      });

      await tx.deposit.update({
        where: { id: schedule.depositId },
        data: { nextDueDate: remainingSchedules[0]?.dueDate || null },
      });

      return { status: 'ok' };
    });
  }

  private buildRdSchedule(
    installment: number,
    rate: number,
    startDate: Date,
    tenureMonths: number,
  ) {
    const schedules = [];
    for (let i = 0; i < tenureMonths; i++) {
      const dueDate = addMonths(startDate, i);
      schedules.push({
        dueDate,
        amount: new Decimal(installment),
      });
    }
    return schedules;
  }
}
