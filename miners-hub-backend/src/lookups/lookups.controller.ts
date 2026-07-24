import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LookupsService } from './lookups.service';
import type { LookupResource } from './lookups.service';

@Controller('lookups')
@UseGuards(JwtAuthGuard)
export class LookupsController {
  constructor(private readonly lookupsService: LookupsService) {}

  @Get()
  search(
    @Request() req: any,
    @Query('resource') resource: LookupResource,
    @Query('q') q = '',
    @Query('limit') limit = '20',
    @Query('siteId') siteId?: string,
    @Query('minerId') minerId?: string,
    @Query('listingId') listingId?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.lookupsService.search(req.user, resource, {
      q,
      limit: Number(limit) || 20,
      siteId,
      minerId,
      listingId,
      orderId,
    });
  }
}
