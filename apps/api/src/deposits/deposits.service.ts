import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { addMonths } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DepositsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.deposit.create({
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
  }

  async list(memberId: string) {
    return this.prisma.deposit.findMany({ where: { memberId }, include: { schedules: true } });
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
