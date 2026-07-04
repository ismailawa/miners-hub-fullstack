import {
  Controller,
  Put,
  Body,
  UseGuards,
  Request,
  Get,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EscrowService } from '../escrow/escrow.service';
import { UpsertPayoutAccountDto } from '../escrow/escrow.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly escrowService: EscrowService,
  ) {}

  @Get('miners/verified')
  async getVerifiedMiners() {
    return this.usersService.findVerifiedMiners();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return this.usersService.findByIdWithRelations(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    return this.usersService.updateProfile(req.user.id, updateData);
  }

  @Get('payout-account')
  @UseGuards(JwtAuthGuard)
  async getPayoutAccount(@Request() req: any) {
    return this.escrowService.getPayoutAccount(req.user.id);
  }

  @Post('payout-account')
  @UseGuards(JwtAuthGuard)
  async upsertPayoutAccount(
    @Request() req: any,
    @Body() dto: UpsertPayoutAccountDto,
  ) {
    return this.escrowService.upsertPayoutAccount(req.user.id, dto);
  }
}
