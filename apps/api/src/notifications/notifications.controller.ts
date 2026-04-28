import { Controller, Get, Req, Param, Patch, UseGuards, UnauthorizedException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  findAll(@Req() req: any) {
    return this.prisma.member
      .findUnique({ where: { userId: req.user.userId } })
      .then((m) => this.notificationsService.findAll(m?.id));
  }

  @Patch(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId: req.user.userId },
    });
    
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    
    if (!notification || notification.memberId !== member?.id) {
      throw new UnauthorizedException('Notification not found or access denied');
    }
    
    return this.notificationsService.markAsRead(id);
  }
}
