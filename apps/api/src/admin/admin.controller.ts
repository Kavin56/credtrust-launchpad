import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('overview')
  async overview() {
    const [members, loans, deposits, pendingKyc] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.loan.count({ where: { status: { in: ['PENDING', 'APPROVED', 'ACTIVE', 'OVERDUE'] } } }),
      this.prisma.depositAccount.count(),
      this.prisma.member.count({ where: { kycStatus: 'PENDING' } }),
    ]);
    return { members, loans, deposits, pendingKyc };
  }

  @Get('pending-approvals')
  async pendingApprovals() {
    const [pendingMembers, pendingLoans] = await Promise.all([
      this.prisma.member.findMany({
        where: { kycStatus: 'PENDING' },
        orderBy: { joinedAt: 'desc' },
        take: 5
      }),
      this.prisma.loan.findMany({
        where: { status: 'PENDING' },
        include: { member: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const formattedList = [
      ...pendingMembers.map(m => ({
        id: m.id,
        name: m.fullName,
        type: 'KYC Verification',
        time: m.joinedAt,
        initial: m.fullName ? m.fullName.charAt(0) : 'U',
        link: '/admin/members'
      })),
      ...pendingLoans.map(l => ({
        id: l.id,
        name: l.member?.fullName || 'Unknown',
        type: `${l.type} Loan`,
        time: l.createdAt,
        initial: l.member?.fullName ? l.member.fullName.charAt(0) : 'U',
        link: '/admin/loans'
      }))
    ];

    // Sort combined list by date descending
    formattedList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return formattedList.slice(0, 5);
  }
}
