import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateMineralPassportDto,
  MineralPassportFilterDto,
  UpdateMineralPassportStatusDto,
} from './mineral-passports.dto';
import { MineralPassportsService } from './mineral-passports.service';

@Controller()
export class MineralPassportsController {
  constructor(private readonly mineralPassportsService: MineralPassportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('mineral-passports')
  async create(@Request() req: any, @Body() dto: CreateMineralPassportDto) {
    return this.mineralPassportsService.create(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mineral-passports')
  async getAll(@Request() req: any, @Query() filters: MineralPassportFilterDto) {
    return this.mineralPassportsService.getAll(req.user, filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mineral-passports/:id')
  async getOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.mineralPassportsService.getOne(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mineral-passports/:id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMineralPassportStatusDto,
  ) {
    return this.mineralPassportsService.updateStatus(req.user, id, dto);
  }

  @Get('public/mineral-passports/:token')
  async getPublic(@Param('token') token: string) {
    return this.mineralPassportsService.getPublic(token);
  }
}
