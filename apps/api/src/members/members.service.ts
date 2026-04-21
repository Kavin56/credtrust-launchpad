import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { StorageService } from '../storage/storage.service';
import { MemberQueryDto } from './dto/member-query.dto';
import { EncryptionService } from '../common/utils/encryption.util';
import { MemberStatus } from '@prisma/client';

@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private encryptionService: EncryptionService,
  ) {}

  async findAll(query: MemberQueryDto) {
    const { kycStatus, status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (kycStatus) where.kycStatus = kycStatus;
    if (status) where.status = status;
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
        skip: Number(skip),
        take: Number(limit),
        orderBy: { joinedAt: 'desc' },
      }),
      this.prisma.member.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getProfile(userId: string, decryptPii = false) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: {
        user: true,
        shareAccounts: true,
        depositAccounts: true,
        loans: { include: { emiSchedule: true } },
      },
    });

    if (!member) throw new NotFoundException('Member not found');

    if (decryptPii) {
      member.aadhaarNumber = this.encryptionService.decrypt(member.aadhaarNumber);
      member.panNumber = this.encryptionService.decrypt(member.panNumber);
    } else {
      member.aadhaarNumber = '****-****-' + member.aadhaarNumber.slice(-4);
      member.panNumber = '*******' + member.panNumber.slice(-3);
    }

    return member;
  }

  async updateKyc(memberId: string, dto: UpdateKycDto) {
    return this.prisma.member.update({
      where: { id: memberId },
      data: { kycStatus: dto.status },
    });
  }

  async deactivate(id: string, reason: string) {
    return this.prisma.member.update({
      where: { id },
      data: {
        status: MemberStatus.INACTIVE,
        deactivatedAt: new Date(),
        exitReason: reason,
      },
    });
  }

  async getStats() {
    const [total, active, pendingKyc] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { status: MemberStatus.ACTIVE } }),
      this.prisma.member.count({ where: { kycStatus: 'PENDING' } }),
    ]);

    return { total, active, pendingKyc };
  }

  async uploadPhoto(userId: string, file: any) {
    if (!file) throw new BadRequestException('File required');
    const member = await this.prisma.member.findFirst({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');
    
    const buffer = await file.toBuffer();
    const url = await this.storage.upload(buffer, file.filename, file.mimetype);
    
    return this.prisma.member.update({
      where: { id: member.id },
      data: { photoUrl: url },
    });
  }

  async dashboardOverview(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      include: {
        depositAccounts: true,
        loans: { include: { emiSchedule: true } },
        shareAccounts: true,
      },
    });

    if (!member) throw new NotFoundException('Member not found');

    const totalSavings = member.depositAccounts.reduce(
      (acc, a) => acc + Number(a.balance),
      0,
    );
    const activeLoans = member.loans.filter((l) => l.status === 'ACTIVE');
    const nextEmi = activeLoans
      .flatMap((l) => l.emiSchedule)
      .filter((s) => !s.isPaid)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

    return {
      name: member.fullName,
      kycStatus: member.kycStatus,
      totalSavings,
      activeLoansCount: activeLoans.length,
      nextEmi,
      sharesOwned: member.shareAccounts.reduce((acc, s) => acc + s.sharesOwned, 0),
    };
  }
}
