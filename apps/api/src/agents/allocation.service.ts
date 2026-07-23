import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AgentPrismaService } from '../prisma/agent-prisma.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AllocationService {
  constructor(
    private readonly agentPrisma: AgentPrismaService,
    private readonly prisma: PrismaService,
  ) {}

  async ensureTracker() {
    let tracker = await this.agentPrisma.allocationTracker.findUnique({
      where: { id: 'default-tracker' },
    });
    if (!tracker) {
      tracker = await this.agentPrisma.allocationTracker.create({
        data: {
          id: 'default-tracker',
          lastAllocatedAgentId: null,
          currentCycleNumber: 1,
          nextAllocationIndex: 0,
          configuredRatio: 10,
        },
      });
    }
    return tracker;
  }

  async getConfiguredRatio(): Promise<number> {
    const tracker = await this.ensureTracker();
    return tracker.configuredRatio;
  }

  async updateConfiguredRatio(newRatio: number) {
    if (!newRatio || newRatio < 1) {
      throw new BadRequestException('Ratio must be at least 1');
    }
    await this.ensureTracker();
    return this.agentPrisma.allocationTracker.update({
      where: { id: 'default-tracker' },
      data: { configuredRatio: newRatio },
    });
  }

  async getAdminAllocationDashboard() {
    const tracker = await this.ensureTracker();
    const ratio = tracker.configuredRatio;

    const activeAgents = await this.agentPrisma.agent.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        fullName: true,
        agentCode: true,
        username: true,
        phone: true,
        status: true,
      },
    });

    const agentStats = await Promise.all(
      activeAgents.map(async (agent) => {
        const assignedCount = await this.prisma.pigmyAccount.count({
          where: { agentId: agent.id },
        });

        // Capacity per cycle calculation
        const cycleCap = tracker.currentCycleNumber * ratio;
        const remainingCapacity = Math.max(0, ratio - (assignedCount % ratio || (assignedCount > 0 ? ratio : 0)));
        const isFull = assignedCount >= cycleCap;

        return {
          ...agent,
          totalAssigned: assignedCount,
          remainingCapacity,
          status: isFull ? 'Full' : 'Available',
          capacity: ratio,
        };
      }),
    );

    const totalAssigned = agentStats.reduce((sum, a) => sum + a.totalAssigned, 0);
    const suggestedAgent = await this.getSuggestedAgent();

    return {
      ratio,
      currentCycle: tracker.currentCycleNumber,
      lastAllocatedAgentId: tracker.lastAllocatedAgentId,
      suggestedAgent,
      totalAssigned,
      agents: agentStats,
    };
  }

  async getSuggestedAgent() {
    const tracker = await this.ensureTracker();
    const ratio = tracker.configuredRatio;

    const activeAgents = await this.agentPrisma.agent.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        fullName: true,
        agentCode: true,
        username: true,
        phone: true,
      },
    });

    if (activeAgents.length === 0) {
      return null;
    }

    let cycle = tracker.currentCycleNumber;
    let startIndex = tracker.nextAllocationIndex % activeAgents.length;

    // Check agents starting from startIndex in Round Robin
    for (let i = 0; i < activeAgents.length; i++) {
      const idx = (startIndex + i) % activeAgents.length;
      const candidate = activeAgents[idx];

      const assignedCount = await this.prisma.pigmyAccount.count({
        where: { agentId: candidate.id },
      });

      // Target max for current cycle
      if (assignedCount < cycle * ratio) {
        return {
          ...candidate,
          currentAssignedCount: assignedCount,
          cycle,
          allocationIndex: idx,
        };
      }
    }

    // If all active agents completed current cycle, advance to next cycle
    const nextCycle = cycle + 1;
    const firstAgent = activeAgents[0];
    const assignedCount = await this.prisma.pigmyAccount.count({
      where: { agentId: firstAgent.id },
    });

    return {
      ...firstAgent,
      currentAssignedCount: assignedCount,
      cycle: nextCycle,
      allocationIndex: 0,
    };
  }

  async allocatePigmyUser(dto: { accountId: string; agentId?: string; adminName?: string }) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { id: dto.accountId },
      include: { member: true, scheme: true },
    });

    if (!account) {
      throw new NotFoundException('Pigmy account not found');
    }

    const tracker = await this.ensureTracker();
    let targetAgentId = dto.agentId;
    let targetIndex = 0;
    let cycle = tracker.currentCycleNumber;

    if (!targetAgentId) {
      const suggested = await this.getSuggestedAgent();
      if (!suggested) {
        throw new BadRequestException('No active agents available for allocation');
      }
      targetAgentId = suggested.id;
      targetIndex = suggested.allocationIndex;
      cycle = suggested.cycle;
    } else {
      const activeAgents = await this.agentPrisma.agent.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });
      const foundIdx = activeAgents.findIndex((a) => a.id === targetAgentId);
      if (foundIdx !== -1) {
        targetIndex = foundIdx;
      }
    }

    const agent = await this.agentPrisma.agent.findUnique({
      where: { id: targetAgentId },
    });

    if (!agent || agent.status !== 'ACTIVE') {
      throw new BadRequestException('Target agent is not active or found');
    }

    const now = new Date();
    const sequenceNumber = (await this.prisma.pigmyAccount.count({ where: { agentId: targetAgentId } })) + 1;

    // Update Pigmy Account
    const updatedAccount = await this.prisma.pigmyAccount.update({
      where: { id: dto.accountId },
      data: {
        agentId: targetAgentId,
        allocationDate: now,
        allocationCycle: cycle,
        allocationSequence: sequenceNumber,
      },
    });

    // Update Allocation Tracker
    const activeCount = await this.agentPrisma.agent.count({ where: { status: 'ACTIVE' } });
    const nextIdx = activeCount > 0 ? (targetIndex + 1) % activeCount : 0;

    await this.agentPrisma.allocationTracker.update({
      where: { id: 'default-tracker' },
      data: {
        lastAllocatedAgentId: targetAgentId,
        currentCycleNumber: cycle,
        nextAllocationIndex: nextIdx,
      },
    });

    // Send Agent Notification
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const adminName = dto.adminName || 'Admin';

    const message = `New Pigmy User Assigned: ${account.member.fullName} (${account.accountNumber})`;

    await this.agentPrisma.agentNotification.create({
      data: {
        agentId: targetAgentId,
        userId: account.member.id,
        message,
        day: dayName,
        time: timeStr,
        isRead: false,
      },
    });

    return {
      success: true,
      account: updatedAccount,
      agentName: agent.fullName,
      agentCode: agent.agentCode,
    };
  }

  async reassignPigmyUser(dto: { accountId: string; newAgentId: string; adminName?: string }) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { id: dto.accountId },
      include: { member: true },
    });
    if (!account) {
      throw new NotFoundException('Pigmy account not found');
    }

    const newAgent = await this.agentPrisma.agent.findUnique({
      where: { id: dto.newAgentId },
    });
    if (!newAgent || newAgent.status !== 'ACTIVE') {
      throw new BadRequestException('New agent is not active or found');
    }

    const now = new Date();
    const sequenceNumber = (await this.prisma.pigmyAccount.count({ where: { agentId: dto.newAgentId } })) + 1;

    const updated = await this.prisma.pigmyAccount.update({
      where: { id: dto.accountId },
      data: {
        agentId: dto.newAgentId,
        allocationDate: now,
        allocationSequence: sequenceNumber,
      },
    });

    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const adminName = dto.adminName || 'Admin';

    await this.agentPrisma.agentNotification.create({
      data: {
        agentId: dto.newAgentId,
        userId: account.member.id,
        message: `Reassigned Pigmy User: ${account.member.fullName} (${account.accountNumber}) by ${adminName}`,
        day: dayName,
        time: timeStr,
        isRead: false,
      },
    });

    return updated;
  }

  async removeAllocation(accountId: string) {
    const account = await this.prisma.pigmyAccount.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Pigmy account not found');
    }

    return this.prisma.pigmyAccount.update({
      where: { id: accountId },
      data: {
        agentId: null,
        allocationDate: null,
        allocationCycle: null,
        allocationSequence: null,
      },
    });
  }

  async getAgentNotifications(agentId: string) {
    const notifications = await this.agentPrisma.agentNotification.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await this.agentPrisma.agentNotification.count({
      where: { agentId, isRead: false },
    });

    return {
      notifications,
      unreadCount,
    };
  }

  async markNotificationRead(id: string, agentId: string) {
    return this.agentPrisma.agentNotification.updateMany({
      where: { id, agentId },
      data: { isRead: true },
    });
  }

  async markAllNotificationsRead(agentId: string) {
    return this.agentPrisma.agentNotification.updateMany({
      where: { agentId, isRead: false },
      data: { isRead: true },
    });
  }
}
