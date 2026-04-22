import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(memberId?: string) {
    return this.prisma.notification.findMany({
      where: memberId ? { memberId } : undefined,
      orderBy: { sentAt: 'desc' },
    });
  }

  async create(dto: { memberId: string; title: string; message: string; type: any }) {
    return this.prisma.notification.create({
      data: {
        memberId: dto.memberId,
        title: dto.title,
        message: dto.message,
        type: dto.type || 'INFO',
        isRead: false,
        sentAt: new Date(),
      },
    });
  }

  async markAsRead(id: string) {
    await this.prisma.notification.update({ where: { id }, data: { isRead: true } });
    return { success: true };
  }
}
