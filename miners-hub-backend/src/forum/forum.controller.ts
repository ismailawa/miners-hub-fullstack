import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ForumService } from './forum.service';
import {
  CreateForumPostDto,
  CreateForumReplyDto,
  ForumFilterDto,
} from './forum.dto';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('posts')
  findAll(@Query() filters: ForumFilterDto) {
    return this.forumService.findAll(filters);
  }

  @Get('posts/:id')
  findOne(@Param('id') id: string) {
    return this.forumService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  createPost(@Request() req: any, @Body() dto: CreateForumPostDto) {
    return this.forumService.createPost(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/replies')
  createReply(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CreateForumReplyDto,
  ) {
    return this.forumService.createReply(id, req.user, dto);
  }
}
