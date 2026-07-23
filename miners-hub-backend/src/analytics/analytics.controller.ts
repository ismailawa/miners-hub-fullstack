import { Controller, Get, Header, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../entities/user.entity';
import { AnalyticsService } from './analytics.service';
import { RevenueAnalyticsFilterDto } from './revenue-analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.GOVERNMENT, UserRole.MINER)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue')
  async revenue(@Request() req: any, @Query() filters: RevenueAnalyticsFilterDto) {
    return this.analyticsService.revenue(req.user, filters);
  }

  @Get('revenue/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="miners-hub-revenue-report.csv"')
  async revenueExport(@Request() req: any, @Query() filters: RevenueAnalyticsFilterDto) {
    return this.analyticsService.revenueCsv(req.user, filters);
  }
}
