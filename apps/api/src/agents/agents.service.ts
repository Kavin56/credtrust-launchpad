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

    const result = await this.prisma.pigmyAccount.updateMany({
      where: { id: { in: dto.accountIds } },
      data: { agentId: dto.agentId },
    });

    return {
      agentId: dto.agentId,
      agentCode: agent.agentCode,
      assignedCount: result.count,
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
    return this.prisma.pigmyAccount.findMany({
      where: q
        ? {
            OR: [
              { accountNumber: { contains: q } },
              { member: { fullName: { contains: q } } },
              { member: { contact: { contains: q } } },
            ],
          }
        : undefined,
      include: {
        member: { select: { fullName: true, contact: true, memberId: true } },
        scheme: { select: { name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async deleteAgent(id: string) {
    const agent = await this.agentPrisma.agent.findUnique({
      where: { id },
    });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Unassign accounts assigned to this agent
    await this.prisma.pigmyAccount.updateMany({
      where: { agentId: id },
      data: { agentId: null },
    });

    // Unassign collections assigned to this agent
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
