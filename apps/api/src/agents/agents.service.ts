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
        email: true,
        fullName: true,
        phone: true,
        agentCode: true,
        uniqueAgentKey: true,
        status: true,
        approvedBy: true,
        approvedDate: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async createAgent(dto: CreateAgentDto) {
    const username = dto.username.trim().toLowerCase();
    const existing = await this.agentPrisma.agent.findFirst({
      where: {
        OR: [
          { username },
          dto.email ? { email: dto.email.trim().toLowerCase() } : undefined,
        ].filter(Boolean) as any,
      },
    });
    if (existing) {
      throw new BadRequestException('Username or email already exists');
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
    const uniqueAgentKey =
      dto.uniqueAgentKey?.trim() ||
      `KEY-${Math.floor(100000 + Math.random() * 900000)}`;

    const agent = await this.agentPrisma.agent.create({
      data: {
        username,
        email: dto.email?.trim().toLowerCase() || null,
        passwordHash,
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim() || null,
        agentCode,
        uniqueAgentKey,
        status: 'PENDING_APPROVAL',
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        agentCode: true,
        uniqueAgentKey: true,
        status: true,
        createdAt: true,
      },
    });

    // Create Admin Notification for New Registration Request
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB'); // 18-07-2026
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const message = `New Agent Registration Request - Agent Name: ${agent.fullName}, Agent ID: ${agent.agentCode}, Registration Date: ${dateStr}, Time: ${timeStr}, Status: Pending Approval`;

    await this.agentPrisma.adminNotification.create({
      data: {
        agentId: agent.id,
        message,
        status: 'PENDING',
      },
    });

    return agent;
  }

  async approveAgent(id: string, adminName?: string) {
    const agent = await this.agentPrisma.agent.findUnique({
      where: { id },
    });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const updated = await this.agentPrisma.agent.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        approvedBy: adminName || 'Admin',
        approvedDate: new Date(),
      },
    });

    await this.agentPrisma.adminNotification.updateMany({
      where: { agentId: id, status: 'PENDING' },
      data: { status: 'ACTIONED' },
    });

    return updated;
  }

  async rejectAgent(id: string) {
    const agent = await this.agentPrisma.agent.findUnique({
      where: { id },
    });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const updated = await this.agentPrisma.agent.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
    });

    await this.agentPrisma.adminNotification.updateMany({
      where: { agentId: id, status: 'PENDING' },
      data: { status: 'ACTIONED' },
    });

    return updated;
  }

  async getAdminNotifications() {
    return this.agentPrisma.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async assignCustomers(dto: AssignCustomersDto) {
    const agent = await this.agentPrisma.agent.findUnique({
      where: { id: dto.agentId },
    });
    if (!agent || agent.status !== 'ACTIVE') {
      throw new NotFoundException('Agent not found or not active');
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

    // Delete notifications
    await this.agentPrisma.agentNotification.deleteMany({
      where: { agentId: id },
    });
    await this.agentPrisma.adminNotification.deleteMany({
      where: { agentId: id },
    });

    // Delete agent
    return this.agentPrisma.agent.delete({
      where: { id },
    });
  }

  private async nextAgentCode() {
    const count = await this.agentPrisma.agent.count();
    return `AGT-${String(count + 1).padStart(4, '0')}`;
  }
}
