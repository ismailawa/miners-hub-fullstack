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
  CreateLogisticsProviderDto,
  CreateQuoteRequestDto,
  CreateShipmentDto,
  QuoteRequestFilterDto,
  ShipmentFilterDto,
  UpdateLogisticsProviderDto,
  UpdateQuoteRequestDto,
  UpdateShipmentStatusDto,
} from './logistics.dto';
import { LogisticsService } from './logistics.service';

@Controller('logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post('quote-requests')
  async createQuoteRequest(@Body() dto: CreateQuoteRequestDto, @Request() req: any) {
    return this.logisticsService.createQuoteRequest(dto, req.user);
  }

  @Get('shipments/track/:trackingId')
  async trackShipment(@Param('trackingId') trackingId: string) {
    return this.logisticsService.trackShipment(trackingId);
  }

  @Post('integrations/maersk/webhook')
  async ingestMaerskWebhook(@Body() payload: Record<string, any>) {
    return this.logisticsService.ingestMaerskTrackingEvent(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('providers')
  async getProviders() {
    return this.logisticsService.getProviders();
  }

  @UseGuards(JwtAuthGuard)
  @Post('providers')
  async createProvider(
    @Request() req: any,
    @Body() dto: CreateLogisticsProviderDto,
  ) {
    return this.logisticsService.createProvider(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('providers/:id')
  async updateProvider(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLogisticsProviderDto,
  ) {
    return this.logisticsService.updateProvider(req.user, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('quote-requests')
  async getQuoteRequests(
    @Request() req: any,
    @Query() filters: QuoteRequestFilterDto,
  ) {
    return this.logisticsService.getQuoteRequests(req.user, filters);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('quote-requests/:id')
  async updateQuoteRequest(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuoteRequestDto,
  ) {
    return this.logisticsService.updateQuoteRequest(req.user, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('shipments')
  async createShipment(@Request() req: any, @Body() dto: CreateShipmentDto) {
    return this.logisticsService.createShipment(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('shipments')
  async getShipments(@Request() req: any, @Query() filters: ShipmentFilterDto) {
    return this.logisticsService.getShipments(req.user, filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get('shipments/:id')
  async getShipment(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.logisticsService.getShipment(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('shipments/:id/status')
  async updateShipmentStatus(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.logisticsService.updateShipmentStatus(req.user, id, dto);
  }
}
