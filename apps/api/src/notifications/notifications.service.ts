import { Injectable } from '@nestjs/common';

export interface Notification {
  id: string;
  memberId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  isRead: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  private notifications: Notification[] = [
    {
      id: 'notif-1',
      memberId: 'mem1',
      title: 'Welcome to CredTrust',
      message: 'Your membership has been successfully activated.',
      type: 'SUCCESS',
      isRead: false,
      createdAt: new Date()
    }
  ];

  async findAll(memberId?: string) {
    if (memberId) {
      return this.notifications.filter(n => n.memberId === memberId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return this.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async create(dto: { memberId: string; title: string; message: string; type: any }) {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      memberId: dto.memberId,
      title: dto.title,
      message: dto.message,
      type: dto.type || 'INFO',
      isRead: false,
      createdAt: new Date()
    };
    this.notifications.push(newNotif);
    return newNotif;
  }

  async markAsRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
    }
    return { success: true };
  }
}
