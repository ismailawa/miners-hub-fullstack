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
  CreateProductionReportDto,
  ProductionReportFilterDto,
  ReviewProductionReportDto,
  UpdateProductionReportDto,
} from './production-reports.dto';
import { ProductionReportsService } from './production-reports.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProductionReportsController {
  constructor(
    private readonly productionReportsService: ProductionReportsService,
  ) {}

  @Post('production-reports')
  async create(@Request() req: any, @Body() dto: CreateProductionReportDto) {
    return this.productionReportsService.create(req.user, dto);
  }

  @Get('production-reports')
  async findAll(@Request() req: any, @Query() filters: ProductionReportFilterDto) {
    return this.productionReportsService.findAll(req.user, filters);
  }

  @Get('production-reports/:id')
  async findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.productionReportsService.findOne(req.user, id);
  }

  @Patch('production-reports/:id')
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductionReportDto,
  ) {
    return this.productionReportsService.update(req.user, id, dto);
  }

  @Patch('production-reports/:id/review')
  async review(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewProductionReportDto,
  ) {
    return this.productionReportsService.review(req.user, id, dto);
  }

  @Get('analytics/production')
  async analytics(@Request() req: any) {
    return this.productionReportsService.analytics(req.user);
  }
}
