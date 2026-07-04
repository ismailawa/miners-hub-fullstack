import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  OrdersQueryDto,
  UpdateOrderStatusDto,
} from './orders.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /api/orders
   * Investor creates an order from a published buy_now listing.
   */
  @Post()
  async create(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, dto);
  }

  /**
   * GET /api/orders?role=buyer|seller&status=...&page=1&limit=20
   * List orders for the current user as buyer or seller.
   */
  @Get()
  async findAll(@Request() req: any, @Query() query: OrdersQueryDto) {
    return this.ordersService.findAll(
      req.user.id,
      query.role,
      query.status,
      query,
    );
  }

  /**
   * GET /api/orders/:id
   * Get single order — buyer or seller only.
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.ordersService.findOne(id, req.user.id);
  }

  /**
   * POST /api/orders/:id/payment
   * Buyer simulates payment confirmation — sets paymentStatus=paid and status=confirmed.
   */
  @Post(':id/payment')
  async confirmPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.ordersService.confirmPayment(id, req.user.id);
  }

  /**
   * POST /api/orders/:id/cancel
   * Buyer or seller cancels an order before delivery.
   */
  @Post(':id/cancel')
  async cancel(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.ordersService.cancel(id, req.user.id);
  }

  /**
   * PATCH /api/orders/:id/status
   * Buyer or seller updates order status within allowed transition rules.
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    return this.ordersService.updateStatus(id, req.user.id, dto);
  }
}
