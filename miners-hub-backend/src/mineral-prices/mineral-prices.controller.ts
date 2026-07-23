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
  CreateMineralPriceOverrideDto,
  UpdateMineralPriceOverrideDto,
} from './mineral-prices.dto';
import { MineralPricesService } from './mineral-prices.service';

@Controller('mineral-prices')
export class MineralPricesController {
  constructor(private readonly mineralPricesService: MineralPricesService) {}

  @Get()
  findPublished() {
    return this.mineralPricesService.findPublished();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.mineralPricesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateMineralPriceOverrideDto) {
    return this.mineralPricesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMineralPriceOverrideDto) {
    return this.mineralPricesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.mineralPricesService.remove(id);
  }
}
