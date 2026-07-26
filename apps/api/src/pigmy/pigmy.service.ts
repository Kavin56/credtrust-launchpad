import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePigmySchemeDto, EnrollPigmyAccountDto, AddCollectionDto, UpdateCollectionStatusDto, InitiatePaymentDto } from './dto/pigmy.dto';
import { randomBytes } from 'crypto';

function nanoid(size = 21): string {
  return randomBytes(Math.ceil(size / 2)).toString('hex').slice(0, size);
}

import { AgentPrismaService } from '../prisma/agent-prisma.service';

@Injectable()
export class PigmyService {
  constructor(
    private prisma: PrismaService,
    private agentPrisma: AgentPrismaService,
  ) {}

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
    try {
      const scheme = await this.prisma.pigmyScheme.findUnique({
        where: { id: dto.schemeId },
      });
      if (!scheme) throw new NotFoundException('Scheme not found');

      const lastAccount = await this.prisma.pigmyAccount.findFirst({
        orderBy: { accountNumber: 'desc' },
      });

      let nextNumber = 1;
      if (lastAccount && lastAccount.accountNumber.startsWith('PIGMY')) {
        const numPart = lastAccount.accountNumber.replace('PIGMY', '');
        const parsed = parseInt(numPart);
        if (!isNaN(parsed)) nextNumber = parsed + 1;
      }
      const accountNumber = `PIGMY${nextNumber.toString().padStart(4, '0')}`;

      const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
      const maturityDate = new Date(startDate);
      maturityDate.setMonth(maturityDate.getMonth() + scheme.maturityPeriod);

      return await this.prisma.pigmyAccount.create({
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
    } catch (error) {
      console.error('ERROR in enrollAccount:', error);
      throw error;
    }
  }

  async selfEnroll(userId: string, schemeId: string) {
    try {
      let member = await this.prisma.member.findUnique({
        where: { userId },
      });

      if (!member) {
        // Create skeleton member profile so they can at least start Pigmy
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Simple ID generation for skeleton
        const prefix = 'SRN-GEN';
        const lastMember = await this.prisma.member.findFirst({
          where: { memberId: { startsWith: prefix } },
          orderBy: { memberId: 'desc' },
        });
        let nextNumber = 1;
        if (lastMember) {
          const parts = lastMember.memberId.split('-');
          const lastNum = parseInt(parts[parts.length - 1]);
          if (!isNaN(lastNum)) nextNumber = lastNum + 1;
        }
        const memberId = `${prefix}-${nextNumber.toString().padStart(4, '0')}`;

        member = await this.prisma.member.create({
          data: {
            userId,
            memberId: `TEMP-${nanoid(6).toUpperCase()}`,
            fullName: user.email.split('@')[0],
            dob: new Date(1990, 0, 1), // Placeholder
            gender: 'Other',
            contact: '9999999999', // Placeholder
            address: 'Update Required',
            state: 'Tamil Nadu',
            district: 'Chennai',
            pincode: '600001',
            aadhaarNumber: `TEMP-${Date.now()}-${nanoid(4)}`,
            aadhaarHash: `TEMP-HASH-${Date.now()}-${nanoid(4)}`,
            panNumber: `TEMP-PAN-${Date.now()}-${nanoid(4)}`,
            panHash: `TEMP-PAN-HASH-${Date.now()}-${nanoid(4)}`,
            kycStatus: 'PENDING',
          }
        });
      }

      return await this.enrollAccount({
        memberId: member.id,
        schemeId,
        agentId: undefined,
        startDate: new Date(),
      });
    } catch (error: any) {
      console.error('ERROR in selfEnroll:', error);
      // Re-throw as a friendly error if it's a known prisma error
      if (error.code === 'P2002') {
        throw new BadRequestException('An account is already being created for you. Please refresh.');
      }
      throw error;
    }
  }



  async initiatePayment(dto: InitiatePaymentDto, userId: string) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { id: dto.accountId },
    });
    if (!account) throw new NotFoundException('Account not found');

    const transactionId = `TXN-PIG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNumber = `RCPT${Date.now().toString().slice(-8)}`;

    return this.prisma.pigmyCollection.create({
      data: {
        transactionId,
        accountId: dto.accountId,
        amount: dto.amount,
        method: 'UPI',
        status: 'INITIATED',
        receiptNumber,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        description: dto.description,
      },
    });
  }

  async confirmPayment(collectionId: string, referenceId?: string) {
    const collection = await this.prisma.pigmyCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.status !== 'INITIATED') {
      throw new BadRequestException('Can only confirm initiated payments');
    }

    return this.prisma.pigmyCollection.update({
      where: { id: collectionId },
      data: {
        status: 'PENDING',
        referenceId,
      },
    });
  }

  private assertAgentOwnsAccount(
    role: string,
    actorId: string,
    account: { agentId: string | null },
  ) {
    if (role !== 'AGENT') return;
    if (!account.agentId || account.agentId !== actorId) {
      throw new ForbiddenException(
        'This Pigmy account is not assigned to you.',
      );
    }
  }

  async addCollection(
    dto: AddCollectionDto,
    actorId?: string,
    role = 'ADMIN',
  ) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { id: dto.accountId },
    });
    if (!account) throw new NotFoundException('Account not found');
    if (actorId) {
      this.assertAgentOwnsAccount(role, actorId, account);
    }

    const transactionId = `TXN-PIG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNumber = `RCPT${Date.now().toString().slice(-8)}`;

    // If it's CASH (usually by agent/admin), it's immediate COMPLETED
    // If it's UPI, it's PENDING until verified
    const status = dto.method === 'CASH' ? 'COMPLETED' : 'PENDING';

    return this.prisma.$transaction(async (tx) => {
      const collection = await tx.pigmyCollection.create({
        data: {
          transactionId,
          accountId: dto.accountId,
          amount: dto.amount,
          method: dto.method,
          upiId: dto.upiId,
          status,
          referenceId: dto.referenceId,
          agentId: role === 'AGENT' ? actorId : actorId || account.agentId,
          remarks: dto.remarks,
          receiptNumber,
        },
      });

      // ONLY increment balance if status is COMPLETED
      if (status === 'COMPLETED') {
        await tx.pigmyAccount.update({
          where: { id: dto.accountId },
          data: {
            balance: { increment: dto.amount },
            totalPaidDays: { increment: 1 },
          },
        });
      }

      return collection;
    });
  }

  async updateCollectionStatus(
    collectionId: string,
    dto: UpdateCollectionStatusDto,
    actorId?: string,
    role = 'ADMIN',
  ) {
    const collection = await this.prisma.pigmyCollection.findUnique({
      where: { id: collectionId },
      include: { account: true },
    });

    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.status !== 'PENDING') {
      throw new BadRequestException('Can only update pending collections');
    }

    if (role === 'AGENT' && actorId) {
      const isAssigned =
        collection.agentId === actorId ||
        collection.account.agentId === actorId;
      if (!isAssigned) {
        throw new ForbiddenException(
          'This collection is not assigned to you.',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.pigmyCollection.update({
        where: { id: collectionId },
        data: {
          status: dto.status,
          remarks: dto.remarks || collection.remarks,
          agentId: dto.agentId !== undefined ? (dto.agentId === 'none' || dto.agentId === '' ? null : dto.agentId) : collection.agentId,
        },
      });

      if (dto.status === 'COMPLETED') {
        await tx.pigmyAccount.update({
          where: { id: collection.accountId },
          data: {
            balance: { increment: collection.amount },
            totalPaidDays: { increment: 1 },
          },
        });
      }

      return updated;
    });
  }

  async getMemberCollections(userId: string) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) return [];

    return this.prisma.pigmyCollection.findMany({
      where: {
        account: {
          memberId: member.id,
        },
      },
      orderBy: { date: 'desc' },
      include: {
        account: {
          include: { scheme: true }
        }
      }
    });
  }

  async getAccountDetails(accountNumber: string) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { accountNumber },
      include: {
        member: true,
        scheme: true,
        collections: {
          orderBy: { date: 'desc' },
          take: 50,
        },
      },
    });
    if (!account) throw new NotFoundException('Account not found');

    let agent = null;
    if (account.agentId) {
      const agentRecord = await this.agentPrisma.agent.findUnique({
        where: { id: account.agentId },
        select: { id: true, username: true, fullName: true, agentCode: true },
      });
      if (agentRecord) {
        agent = {
          id: agentRecord.id,
          email: agentRecord.username,
          fullName: agentRecord.fullName,
          agentCode: agentRecord.agentCode,
        };
      }
    }

    return {
      ...account,
      agent,
    };
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

  private agentAccountFilter(agentId: string) {
    return { agentId };
  }

  private agentCollectionFilter(agentId: string) {
    return {
      OR: [
        { agentId },
        { account: { agentId } },
      ],
    };
  }

  async getDashboardStats(role = 'ADMIN', actorId?: string) {
    const agentScope =
      role === 'AGENT' && actorId
        ? this.agentCollectionFilter(actorId)
        : undefined;

    const accountWhere =
      role === 'AGENT' && actorId
        ? { status: 'ACTIVE' as const, ...this.agentAccountFilter(actorId) }
        : { status: 'ACTIVE' as const };

    const [
      totalCollections,
      activeAccounts,
      todayCollections,
      maturityAccounts,
      pendingCollections,
      activeAgentsCount,
    ] = await Promise.all([
      this.prisma.pigmyCollection.aggregate({
        where: agentScope,
        _sum: { amount: true },
      }),
      this.prisma.pigmyAccount.count({ where: accountWhere }),
      this.prisma.pigmyCollection.aggregate({
        where: {
          ...agentScope,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.pigmyAccount.count({
        where: {
          ...accountWhere,
          maturityDate: { lte: new Date() },
        },
      }),
      this.prisma.pigmyCollection.count({
        where: {
          status: 'PENDING',
          ...(agentScope || {}),
        },
      }),
      this.agentPrisma.agent.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    return {
      totalDeposits: totalCollections._sum.amount || 0,
      totalWithdrawals: 0,
      activeAccounts,
      todayCollections: todayCollections._sum.amount || 0,
      maturityAccounts,
      pendingCollections,
      activeAgents: activeAgentsCount,
    };
  }

  async searchAccount(query: string, role = 'ADMIN', actorId?: string) {
    const q = query?.trim() || '';
    return this.prisma.pigmyAccount.findMany({
      where: {
        ...(role === 'AGENT' && actorId
          ? this.agentAccountFilter(actorId)
          : {}),
        ...(q
          ? {
              OR: [
                { accountNumber: { contains: q } },
                { member: { fullName: { contains: q } } },
                { member: { contact: { contains: q } } },
              ],
            }
          : {}),
      },
      include: {
        member: true,
        scheme: true,
      },
      take: role === 'AGENT' ? 100 : 10,
    });
  }

  async getAgentCustomers(agentId: string) {
    return this.prisma.pigmyAccount.findMany({
      where: this.agentAccountFilter(agentId),
      include: {
        member: {
          select: {
            fullName: true,
            contact: true,
            memberId: true,
            address: true,
          },
        },
        scheme: { select: { name: true, type: true, minAmount: true } },
      },
      orderBy: { accountNumber: 'asc' },
    });
  }

  async getAgentPendingCollections(agentId: string) {
    return this.prisma.pigmyCollection.findMany({
      where: {
        status: 'PENDING',
        ...this.agentCollectionFilter(agentId),
      },
      orderBy: { date: 'desc' },
      include: {
        account: {
          include: {
            member: { select: { fullName: true, contact: true } },
            scheme: { select: { name: true } },
          },
        },
      },
    });
  }

  async getRecentCollections(limit = 10, role = 'ADMIN', actorId?: string) {
    const agentScope =
      role === 'AGENT' && actorId
        ? this.agentCollectionFilter(actorId)
        : undefined;

    return this.prisma.pigmyCollection.findMany({
      where: agentScope,
      take: Number(limit),
      orderBy: { date: 'desc' },
      include: {
        account: {
          include: {
            member: {
              select: { fullName: true },
            },
          },
        },
      },
    });
  }

  async getPendingCollections(role = 'ADMIN', actorId?: string) {
    const agentScope =
      role === 'AGENT' && actorId
        ? this.agentCollectionFilter(actorId)
        : undefined;

    return this.prisma.pigmyCollection.findMany({
      where: {
        status: 'PENDING',
        ...agentScope,
      },
      orderBy: { date: 'desc' },
      take: 50,
      include: {
        account: {
          include: {
            member: { select: { fullName: true, contact: true } },
            scheme: { select: { name: true } },
          },
        },
      },
    });
  }
}
