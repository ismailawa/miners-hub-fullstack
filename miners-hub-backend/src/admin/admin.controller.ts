import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, VerificationStatus } from '../entities/user.entity';
import { ListingStatus } from '../entities/listing.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers(@Query('status') status?: VerificationStatus) {
    return this.adminService.getUsers(status);
  }

  @Patch('users/:id/verify')
  async verifyUser(
    @Param('id') id: string,
    @Body('status') status: VerificationStatus,
  ) {
    return this.adminService.verifyUser(id, status);
  }

  @Get('listings')
  async getListings(@Query('status') status?: ListingStatus) {
    return this.adminService.getListings(status);
  }

  @Patch('listings/:id/status')
  async updateListingStatus(
    @Param('id') id: string,
    @Body('status') status: ListingStatus,
  ) {
    return this.adminService.updateListingStatus(id, status);
  }
}
