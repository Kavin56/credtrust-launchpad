import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePigmySchemeDto, EnrollPigmyAccountDto, AddCollectionDto } from './dto/pigmy.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class PigmyService {
  constructor(private prisma: PrismaService) {}

  async createScheme(dto: CreatePigmySchemeDto) {
    return this.prisma.pigmyScheme.create({
      data: dto,
    });
  }

  async getSchemes() {
    return this.prisma.pigmyScheme.findMany({
      where: { isActive: true },
    });
  }

  async enrollAccount(dto: EnrollPigmyAccountDto) {
    const scheme = await this.prisma.pigmyScheme.findUnique({
      where: { id: dto.schemeId },
    });
    if (!scheme) throw new NotFoundException('Scheme not found');

    const lastAccount = await this.prisma.pigmyAccount.findFirst({
      orderBy: { accountNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastAccount && lastAccount.accountNumber.startsWith('PIGMY')) {
      nextNumber = parseInt(lastAccount.accountNumber.replace('PIGMY', '')) + 1;
    }
    const accountNumber = `PIGMY${nextNumber.toString().padStart(4, '0')}`;

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + scheme.maturityPeriod);

    return this.prisma.pigmyAccount.create({
      data: {
        accountNumber,
        memberId: dto.memberId,
        schemeId: dto.schemeId,
        agentId: dto.agentId,
        startDate,
        maturityDate,
        status: 'ACTIVE',
      },
    });
  }

  async addCollection(dto: AddCollectionDto, agentId?: string) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { id: dto.accountId },
    });
    if (!account) throw new NotFoundException('Account not found');

    const receiptNumber = `RCPT${Date.now().toString().slice(-8)}`;

    return this.prisma.$transaction(async (tx) => {
      const collection = await tx.pigmyCollection.create({
        data: {
          accountId: dto.accountId,
          amount: dto.amount,
          method: dto.method,
          referenceId: dto.referenceId,
          agentId: agentId || account.agentId,
          remarks: dto.remarks,
          receiptNumber,
        },
      });

      await tx.pigmyAccount.update({
        where: { id: dto.accountId },
        data: {
          balance: { increment: dto.amount },
          totalPaidDays: { increment: 1 },
        },
      });

      return collection;
    });
  }

  async getAccountDetails(accountNumber: string) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { accountNumber },
      include: {
        member: true,
        scheme: true,
        agent: {
          select: { id: true, email: true }
        },
        collections: {
          orderBy: { date: 'desc' },
          take: 50,
        },
      },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async calculateInterest(accountId: string) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { id: accountId },
      include: { scheme: true },
    });

    if (!account) throw new NotFoundException('Account not found');

    const lastCalc = account.lastInterestCalc || account.startDate;
    const now = new Date();
    
    // Calculate months difference
    const diffMonths = (now.getFullYear() - lastCalc.getFullYear()) * 12 + (now.getMonth() - lastCalc.getMonth());
    
    const periods = Math.floor(diffMonths / account.scheme.interestPeriod);
    
    if (periods > 0) {
      const interestAmount = account.balance * (account.scheme.interestRate / 100) * periods;
      
      return this.prisma.pigmyAccount.update({
        where: { id: accountId },
        data: {
          balance: { increment: interestAmount },
          interestEarned: { increment: interestAmount },
          lastInterestCalc: now,
        },
      });
    }

    return account;
  }

  async getDashboardStats() {
    const [totalCollections, activeAccounts, todayCollections, maturityAccounts] = await Promise.all([
      this.prisma.pigmyCollection.aggregate({ _sum: { amount: true } }),
      this.prisma.pigmyAccount.count({ where: { status: 'ACTIVE' } }),
      this.prisma.pigmyCollection.aggregate({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.pigmyAccount.count({
        where: {
          status: 'ACTIVE',
          maturityDate: { lte: new Date() }
        }
      })
    ]);

    return {
      totalDeposits: totalCollections._sum.amount || 0,
      totalWithdrawals: 0, // Placeholder for future withdrawal logic
      activeAccounts,
      todayCollections: todayCollections._sum.amount || 0,
      maturityAccounts,
      pendingCollections: 15, // Mocked based on route logic
    };
  }

  async searchAccount(query: string) {
    return this.prisma.pigmyAccount.findMany({
      where: {
        OR: [
          { accountNumber: { contains: query } },
          { member: { fullName: { contains: query } } },
          { member: { contact: { contains: query } } },
        ]
      },
      include: {
        member: true,
        scheme: true
      },
      take: 10
    });
  }
}
