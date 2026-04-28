import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const page = Number(query.page || 1);
    const limit = Math.min(Number(query.limit || 10), 50);
    const skip = (page - 1) * limit;
    const search = (query.search || '').toString().trim();
    const where: any = {};
    if (query.kycStatus) where.kycStatus = query.kycStatus;
    if (query.status) where.status = query.status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { memberId: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
        include: { user: true },
      }),
      this.prisma.member.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async getProfile(userId: string) {
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
      include: { user: true, depositAccounts: true, loans: true, shareAccounts: true },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
    });
    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.member.update({
      where: { id: member.id },
      data: {
        fullName: dto.fullName ?? member.fullName,
        contact: dto.contact ?? member.contact,
        address: dto.address ?? member.address,
      },
      include: { user: true, depositAccounts: true, loans: true, shareAccounts: true },
    });
  }

  async dashboardOverview(userId: string) {
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
      include: { 
        depositAccounts: true, 
        loans: {
          include: { emiSchedule: true }
        }, 
        shareAccounts: true 
      },
    });
    if (!member) throw new NotFoundException('Member not found');

    const totalBalance = (member.depositAccounts || []).reduce(
      (sum, a: any) => sum + Number(a.balance || 0),
      0,
    );
    const sharesOwned = (member.shareAccounts || []).reduce(
      (sum, s: any) => sum + Number(s.sharesOwned || 0),
      0,
    );
    
    // Find the next upcoming EMI across all active loans
    let nextEmi = null;
    const allPendingEmis = (member.loans || [])
      .filter((l: any) => ['ACTIVE', 'OVERDUE'].includes(String(l.status)))
      .flatMap((l: any) => (l.emiSchedule || []).filter((e: any) => !e.isPaid))
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    if (allPendingEmis.length > 0) {
      const earliest = allPendingEmis[0];
      nextEmi = {
        totalDue: earliest.totalEmi,
        dueDate: earliest.dueDate,
      };
    }

    return {
      name: member.fullName,
      kycStatus: member.kycStatus,
      totalBalance,
      sharesOwned,
      loans: member.loans || [],
      deposits: member.depositAccounts || [],
      nextEmi,
    };
  }

  async getStats() {
    const [total, active, pendingKyc] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { status: 'ACTIVE' } }),
      this.prisma.member.count({ where: { kycStatus: 'PENDING' } }),
    ]);
    return { total, active, pendingKyc };
  }
  
  async updateKyc(memberId: string, dto: any) {
    await this.prisma.member.update({
      where: { id: memberId },
      data: { kycStatus: dto.status },
    });
    return { success: true };
  }

  async uploadPhoto(userId: string, file: any) {
    // Photo storage not wired yet; return a stable placeholder until storage is connected.
    return { photoUrl: null };
  }
  
  async deactivate(id: string, reason: string) {
    await this.prisma.member.update({
      where: { id },
      data: { status: 'INACTIVE', exitReason: reason, deactivatedAt: new Date() },
    });
    return { success: true };
  }
}
