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
