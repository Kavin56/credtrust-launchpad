import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async listRequests(userId: string) {
    const member = await this.prisma.member.findFirst({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.serviceRequest.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRequest(userId: string, type: string, details: string) {
    const member = await this.prisma.member.findFirst({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.serviceRequest.create({
      data: {
        memberId: member.id,
        type,
        details,
      },
    });
  }
}
