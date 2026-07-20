import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AgentPrismaService } from '../prisma/agent-prisma.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AssignCustomersDto } from './dto/assign-customers.dto';

@Injectable()
export class AgentsService {
  constructor(
    private readonly agentPrisma: AgentPrismaService,
    private readonly prisma: PrismaService,
  ) {}

  async listAgents() {
    return this.agentPrisma.agent.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        agentCode: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async createAgent(dto: CreateAgentDto) {
    const username = dto.username.trim().toLowerCase();
    const existing = await this.agentPrisma.agent.findUnique({
      where: { username },
    });
    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    const agentCode =
      dto.agentCode?.trim().toUpperCase() ||
      (await this.nextAgentCode());

    const codeTaken = await this.agentPrisma.agent.findUnique({
      where: { agentCode },
    });
    if (codeTaken) {
      throw new BadRequestException('Agent code already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.agentPrisma.agent.create({
      data: {
        username,
        passwordHash,
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim(),
        agentCode,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        agentCode: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async assignCustomers(dto: AssignCustomersDto) {
    const agent = await this.agentPrisma.agent.findUnique({
      where: { id: dto.agentId },
    });
    if (!agent || agent.status !== 'ACTIVE') {
      throw new NotFoundException('Agent not found');
    }

    let assignedCount = 0;
    for (const accountId of dto.accountIds) {
      if (accountId.startsWith('member_')) {
        const memberId = accountId.replace('member_', '');
        const existingAcc = await this.prisma.pigmyAccount.findFirst({
          where: { memberId },
        });
        if (existingAcc) {
          await this.prisma.pigmyAccount.update({
            where: { id: existingAcc.id },
            data: { agentId: dto.agentId },
          });
        } else {
          let scheme = await this.prisma.pigmyScheme.findFirst();
          if (!scheme) {
            scheme = await this.prisma.pigmyScheme.create({
              data: {
                name: 'Daily Pigmy Deposit',
                type: 'DAILY',
                minAmount: 10,
                maxAmount: 50000,
                maturityPeriod: 12,
                interestRate: 6.5,
              },
            });
          }
          const accNumber = `PG-${Date.now().toString().slice(-6)}`;
          const maturityDate = new Date();
          maturityDate.setFullYear(maturityDate.getFullYear() + 1);

          await this.prisma.pigmyAccount.create({
            data: {
              accountNumber: accNumber,
              memberId,
              schemeId: scheme.id,
              agentId: dto.agentId,
              balance: 0,
              maturityDate,
              status: 'ACTIVE',
            },
          });
        }
        assignedCount++;
      } else {
        await this.prisma.pigmyAccount.updateMany({
          where: { id: accountId },
          data: { agentId: dto.agentId },
        });
        assignedCount++;
      }
    }

    return {
      agentId: dto.agentId,
      agentCode: agent.agentCode,
      assignedCount,
    };
  }

  async unassignCustomer(accountId: string) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Pigmy account not found');
    }

    return this.prisma.pigmyAccount.update({
      where: { id: accountId },
      data: { agentId: null },
    });
  }

  async listAccountsForAssignment(search?: string) {
    const q = search?.trim();

    const members = await this.prisma.member.findMany({
      where: q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { memberId: { contains: q, mode: 'insensitive' } },
              { contact: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        pigmyAccounts: {
          include: {
            scheme: { select: { name: true } },
          },
        },
      },
      orderBy: { fullName: 'asc' },
      take: 100,
    });

    const results: any[] = [];
    for (const m of members) {
      if (m.pigmyAccounts && m.pigmyAccounts.length > 0) {
        for (const acc of m.pigmyAccounts) {
          results.push({
            id: acc.id,
            accountNumber: acc.accountNumber,
            member: { fullName: m.fullName, contact: m.contact, memberId: m.memberId },
            scheme: acc.scheme || { name: 'Pigmy Savings' },
            agentId: acc.agentId,
          });
        }
      } else {
        results.push({
          id: `member_${m.id}`,
          accountNumber: `PIGMY-${m.memberId}`,
          member: { fullName: m.fullName, contact: m.contact, memberId: m.memberId },
          scheme: { name: 'Unassigned Member Account' },
          agentId: null,
        });
      }
    }

    return results;
  }

  async deleteAgent(id: string) {
    const agent = await this.agentPrisma.agent.findUnique({
      where: { id },
    });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    await this.prisma.pigmyAccount.updateMany({
      where: { agentId: id },
      data: { agentId: null },
    });

    await this.prisma.pigmyCollection.updateMany({
      where: { agentId: id },
      data: { agentId: null },
    });

    return this.agentPrisma.agent.delete({
      where: { id },
    });
  }

  private async nextAgentCode() {
    const count = await this.agentPrisma.agent.count();
    return `AGT-${String(count + 1).padStart(4, '0')}`;
  }
}
