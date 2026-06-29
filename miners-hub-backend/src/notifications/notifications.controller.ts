import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req: any) {
    const notifications = await this.notificationsService.findAll(req.user.id);
    // Map notificationType to type for frontend
    return {
      notifications: notifications.map(n => ({
        ...n,
        type: n.notificationType,
      })),
    };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post()
  async createNotification(@Request() req: any, @Body() data: any) {
    const notification = await this.notificationsService.create(req.user.id, {
      ...data,
      notificationType: data.type || 'info',
    });
    return {
      notification: {
        ...notification,
        type: notification.notificationType,
      },
    };
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true };
  }

  @Patch(':id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    const notification = await this.notificationsService.markAsRead(id, req.user.id);
    return {
      notification: {
        ...notification,
        type: notification.notificationType,
      },
    };
  }
}
