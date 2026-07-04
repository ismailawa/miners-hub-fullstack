import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatsService } from './chats.service';
import { SendMessageDto } from './chats.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  /**
   * POST /api/chats
   * Send a direct message to another user.
   */
  @Post()
  async sendMessage(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.chatsService.sendMessage(req.user.id, dto);
  }

  /**
   * GET /api/chats/threads
   * List all threads for the current user with unread counts and counterparty info.
   */
  @Get('threads')
  async getThreads(@Request() req: any) {
    return this.chatsService.getThreads(req.user.id);
  }

  /**
   * GET /api/chats/threads/:threadId?page=1&limit=50
   * Get messages in a thread (auto-marks messages as read for this user).
   */
  @Get('threads/:threadId')
  async getMessages(
    @Param('threadId') threadId: string,
    @Request() req: any,
    @Query() pagination: PaginationDto,
  ) {
    return this.chatsService.getMessages(threadId, req.user.id, pagination);
  }

  /**
   * PATCH /api/chats/:id/read
   * Mark a single message as read (receiver only).
   */
  @Patch(':id/read')
  async markRead(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.chatsService.markRead(id, req.user.id);
  }
}
