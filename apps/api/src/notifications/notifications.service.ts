import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(memberId: string, title: string, message: string, type: string) {
    this.logger.log(`Creating notification for ${memberId}: ${title}`);
    return this.prisma.notification.create({
      data: {
        memberId,
        title,
        message,
        type,
        status: NotificationStatus.SENT,
      },
    });
  }

  async list(memberId: string) {
    return this.prisma.notification.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { status: NotificationStatus.READ },
    });
  }

  // Mock method for actually sending SMS/Email
  async sendEmail(to: string, subject: string, body: string) {
      this.logger.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
      return true;
  }

  async sendSms(phoneNumber: string, message: string) {
      this.logger.log(`[MOCK SMS] To: ${phoneNumber}, Message: ${message}`);
      return true;
  }
}
