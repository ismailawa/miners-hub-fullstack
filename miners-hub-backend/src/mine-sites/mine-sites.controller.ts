import {
  Body,
  Controller,
  Delete,
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
import { MineSitesService } from './mine-sites.service';
import {
  CreateMineSiteDto,
  MineSiteFilterDto,
  UpdateMineSiteDto,
} from './mine-sites.dto';

@Controller('mine-sites')
@UseGuards(JwtAuthGuard)
export class MineSitesController {
  constructor(private readonly mineSitesService: MineSitesService) {}

  @Get()
  async findAll(@Request() req: any, @Query() filters: MineSiteFilterDto) {
    return this.mineSitesService.findAll(req.user, filters);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.mineSitesService.findOne(req.user, id);
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateMineSiteDto) {
    return this.mineSitesService.create(req.user, dto);
  }

  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMineSiteDto,
  ) {
    return this.mineSitesService.update(req.user, id, dto);
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.mineSitesService.delete(req.user, id);
    return { success: true };
  }
}
