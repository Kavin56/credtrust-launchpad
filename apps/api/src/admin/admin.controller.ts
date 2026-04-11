import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('overview')
  async overview() {
    const [members, loans, deposits, pendingKyc] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.loan.count(),
      this.prisma.deposit.count(),
      this.prisma.kycDocument.count({ where: { status: 'PENDING' } }),
    ]);
    return { members, loans, deposits, pendingKyc };
  }

  @Get('pending-approvals')
  async pendingApprovals() {
    const pendingKyc = await this.prisma.kycDocument.findMany({
      where: { status: 'PENDING' },
      include: { member: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const pendingLoans = await this.prisma.loan.findMany({
      where: { status: 'APPLIED' },
      include: { member: true },
      take: 5,
      orderBy: { sanctionDate: 'desc' },
    });

    const approvals = [
      ...pendingKyc.map(k => ({
        id: k.id,
        name: k.member.fullName,
        type: 'KYC Verification',
        date: k.createdAt,
        priority: 'High',
      })),
      ...pendingLoans.map(l => ({
        id: l.id,
        name: l.member.fullName,
        type: l.product,
        date: l.sanctionDate,
        priority: 'Medium',
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return approvals;
  }

  @Get('ledger-activity')
  async ledgerActivity() {
    const txns = await this.prisma.transaction.findMany({
      take: 10,
      orderBy: { txnDate: 'desc' },
    });
    return txns;
  }
}
