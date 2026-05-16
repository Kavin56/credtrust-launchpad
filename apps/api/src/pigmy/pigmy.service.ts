import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePigmySchemeDto, EnrollPigmyAccountDto, AddCollectionDto, UpdateCollectionStatusDto, InitiatePaymentDto } from './dto/pigmy.dto';
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
            panNumber: `TEMP-PAN-${Date.now()}-${nanoid(4)}`,
            kycStatus: 'PENDING',
          }
        });
      }

      // Find any existing agent to assign as primary, or leave null if none found
      const agent = await this.prisma.user.findFirst({
        where: { role: 'AGENT' },
      });

      return await this.enrollAccount({
        memberId: member.id,
        schemeId,
        agentId: agent?.id,
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

  async addCollection(dto: AddCollectionDto, agentId?: string) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { id: dto.accountId },
    });
    if (!account) throw new NotFoundException('Account not found');

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
          agentId: agentId || account.agentId,
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

  async updateCollectionStatus(collectionId: string, dto: UpdateCollectionStatusDto) {
    const collection = await this.prisma.pigmyCollection.findUnique({
      where: { id: collectionId },
      include: { account: true },
    });

    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.status !== 'PENDING') {
      throw new BadRequestException('Can only update pending collections');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.pigmyCollection.update({
        where: { id: collectionId },
        data: {
          status: dto.status,
          remarks: dto.remarks || collection.remarks,
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

  async getRecentCollections(limit = 10) {
    return this.prisma.pigmyCollection.findMany({
      take: Number(limit),
      orderBy: { date: 'desc' },
      include: {
        account: {
          include: {
            member: {
              select: { fullName: true }
            }
          }
        }
      }
    });
  }
}
