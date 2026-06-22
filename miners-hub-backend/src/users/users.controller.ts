import { Controller, Put, Body, UseGuards, Request, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.usersService.findByIdWithRelations(req.user.userId);
  }

  @Put('profile')
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    return this.usersService.updateProfile(req.user.userId, updateData);
  }
}
