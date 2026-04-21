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
}
