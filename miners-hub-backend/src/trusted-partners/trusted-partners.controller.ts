import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../entities/user.entity';
import {
  CreateTrustedPartnerDto,
  UpdateTrustedPartnerDto,
} from './trusted-partners.dto';
import { TrustedPartnersService } from './trusted-partners.service';

@Controller('trusted-partners')
export class TrustedPartnersController {
  constructor(private readonly trustedPartnersService: TrustedPartnersService) {}

  @Get()
  findPublished() {
    return this.trustedPartnersService.findPublished();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.trustedPartnersService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateTrustedPartnerDto) {
    return this.trustedPartnersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTrustedPartnerDto) {
    return this.trustedPartnersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.trustedPartnersService.remove(id);
  }
}
