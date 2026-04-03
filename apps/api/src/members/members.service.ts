import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService, private storage: StorageService) {}

  async getProfile(userId: string) {
    const member = await this.prisma.member.findFirst({
      where: { userId },
      include: {
        accounts: true,
        deposits: true,
        loans: true,
        kycDocs: true,
        shares: true,
      },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async updateKyc(memberId: string, dto: UpdateKycDto) {
    await this.prisma.member.update({
      where: { id: memberId },
      data: { kycStatus: dto.status },
    });
    return this.prisma.kycDocument.updateMany({
      where: { memberId },
      data: { status: dto.status, verifiedBy: dto.verifiedBy, verifiedAt: new Date() },
    });
  }

  async updateKycByUser(userId: string, dto: UpdateKycDto) {
    const member = await this.prisma.member.findFirst({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');
    return this.updateKyc(member.id, dto);
  }

  async dashboardOverview(userId: string) {
    const member = await this.prisma.member.findFirst({
      where: { userId },
      include: {
        accounts: true,
        deposits: true,
        loans: { include: { schedules: true } },
        shares: true,
      },
    });
    if (!member) throw new NotFoundException('Member not found');

    const totalBalance = member.accounts.reduce(
      (acc, a) => acc + Number(a.balance),
      0,
    );
    const activeLoans = member.loans.filter((l) => l.status !== 'CLOSED');
    const nextEmi = activeLoans
      .flatMap((l) => l.schedules)
      .filter((s) => !s.paid)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

    return {
      member: {
        name: member.fullName,
        kycStatus: member.kycStatus,
      },
      accounts: member.accounts,
      deposits: member.deposits,
      loans: member.loans,
      shares: member.shares,
      totalBalance,
      nextEmi,
    };
  }

  async uploadKyc(userId: string, file: any) {
    if (!file) throw new BadRequestException('File required');
    const member = await this.prisma.member.findFirst({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');
    const buffer = await file.toBuffer();
    const url = await this.storage.upload(buffer, file.filename, file.mimetype);
    return this.prisma.kycDocument.create({
      data: {
        memberId: member.id,
        type: file.mimetype,
        docNumber: file.filename,
        fileUrl: url,
      },
    });
  }
}
