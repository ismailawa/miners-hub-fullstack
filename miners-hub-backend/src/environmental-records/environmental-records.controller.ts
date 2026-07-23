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
  CreateEnvironmentalRecordDto,
  EnvironmentalRecordFilterDto,
  UpdateEnvironmentalRecordDto,
} from './environmental-records.dto';
import { EnvironmentalRecordsService } from './environmental-records.service';

@Controller('environmental-records')
export class EnvironmentalRecordsController {
  constructor(private readonly environmentalRecordsService: EnvironmentalRecordsService) {}

  @Get('community')
  async getCommunitySafe(@Query() filters: EnvironmentalRecordFilterDto) {
    return this.environmentalRecordsService.findCommunitySafe(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: CreateEnvironmentalRecordDto) {
    return this.environmentalRecordsService.create(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: any, @Query() filters: EnvironmentalRecordFilterDto) {
    return this.environmentalRecordsService.findAll(req.user, filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.environmentalRecordsService.findOne(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnvironmentalRecordDto,
  ) {
    return this.environmentalRecordsService.update(req.user, id, dto);
  }
}
