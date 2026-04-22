import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('admin')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Disabled for manual testing/demo
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
}
