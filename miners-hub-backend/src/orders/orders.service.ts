import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { Miner } from '../entities/miner.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { EscrowService } from '../escrow/escrow.service';

/** Allowed transitions: [currentStatus] → [nextStatus] per role */
const SELLER_TRANSITIONS: Record<string, OrderStatus[]> = {
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
};

const BUYER_TRANSITIONS: Record<string, OrderStatus[]> = {
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.PENDING]: [OrderStatus.CANCELLED],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Miner)
    private readonly minerRepository: Repository<Miner>,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
    private readonly escrowService: EscrowService,
  ) {}

  async create(buyerId: string, dto: CreateOrderDto): Promise<Order> {
    const listing = await this.listingRepository.findOne({
      where: { id: dto.listingId },
      relations: ['miner', 'miner.user'],
    });

    if (!listing) throw new NotFoundException('Listing not found.');
    if (listing.status !== ListingStatus.PUBLISHED) {
      throw new BadRequestException('This listing is not available for purchase.');
    }
    if (listing.listingType !== 'buy_now') {
      throw new BadRequestException('This listing is auction-only. Use the bidding system.');
    }
    if (dto.quantity > Number(listing.quantity)) {
      throw new BadRequestException(
        `Requested quantity (${dto.quantity}) exceeds available stock (${listing.quantity}).`,
      );
    }

    const totalAmount = Number(listing.price) * dto.quantity;
    const sellerId = listing.miner.userId;

    if (buyerId === sellerId) {
      throw new ForbiddenException('You cannot purchase your own listing.');
    }
    const sellerCanReceiveEscrow =
      await this.escrowService.hasActivePayoutAccount(sellerId);
    if (!sellerCanReceiveEscrow) {
      throw new BadRequestException(
        'Seller must link an active payout bank account before buyers can place escrow orders.',
      );
    }

    const order = this.orderRepository.create({
      buyerId,
      sellerId,
      listingId: listing.id,
      quantity: dto.quantity,
      totalAmount,
      deliveryAddress: dto.deliveryAddress ?? null,
      status: OrderStatus.PENDING,
      paymentStatus: 'pending',
      statusHistory: [
        {
          status: OrderStatus.PENDING,
          date: new Date().toISOString(),
          location: listing.location || undefined,
          notes: 'Order created and awaiting payment.',
        },
      ],
    });

    const saved = await this.orderRepository.save(order);

    // Notify seller
    await this.notificationsService.create(sellerId, {
      title: 'New Order Received',
      message: `You have a new order for ${listing.mineralType} — ₦${totalAmount.toLocaleString()}.`,
      notificationType: 'info',
    });

    this.auditLogService.log({
      userId: buyerId,
      action: 'order.create',
      resource: 'order',
      resourceId: saved.id,
      metadata: { listingId: listing.id, totalAmount },
    });

    return this.findOne(saved.id, buyerId);
  }

  async findAll(
    userId: string,
    role: 'buyer' | 'seller' | 'admin',
    status?: OrderStatus,
    pagination: PaginationDto = new PaginationDto(),
  ) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.listing', 'listing')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.escrowTransaction', 'escrowTransaction')
      .orderBy('order.createdAt', 'DESC');

    if (role === 'buyer') {
      qb.where('order.buyerId = :userId', { userId });
    } else if (role === 'seller') {
      qb.where('order.sellerId = :userId', { userId });
    }
    // admin: no userId filter

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    const [data, total] = await qb
      .skip(pagination.offset)
      .take(pagination.limit)
      .getManyAndCount();

    return paginate(data, total, pagination);
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['listing', 'buyer', 'seller', 'escrowTransaction'],
    });
    if (!order) throw new NotFoundException('Order not found.');
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    return order;
  }

  async confirmPayment(id: string, buyerId: string): Promise<Order> {
    const order = await this.findOne(id, buyerId);
    if (order.buyerId !== buyerId) {
      throw new ForbiddenException('Only the buyer can confirm payment.');
    }
    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Order is already paid.');
    }

    order.paymentStatus = 'paid';
    order.status = OrderStatus.CONFIRMED;
    order.statusHistory = [
      ...(order.statusHistory || []),
      {
        status: OrderStatus.CONFIRMED,
        date: new Date().toISOString(),
        notes: 'Payment confirmed.',
      },
    ];
    const saved = await this.orderRepository.save(order);

    // Notify seller
    await this.notificationsService.create(order.sellerId, {
      title: 'Payment Confirmed',
      message: `Payment received for order #${id.slice(0, 8)}. Please confirm and process the shipment.`,
      notificationType: 'info',
    });

    this.auditLogService.log({
      userId: buyerId,
      action: 'order.payment_confirmed',
      resource: 'order',
      resourceId: id,
    });

    return saved;
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id, userId);
    const isBuyer = order.buyerId === userId;
    const isSeller = order.sellerId === userId;

    const allowedTransitions = isBuyer
      ? BUYER_TRANSITIONS[order.status] ?? []
      : isSeller
        ? SELLER_TRANSITIONS[order.status] ?? []
        : [];

    if (!allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from '${order.status}' to '${dto.status}'.`,
      );
    }

    const previousStatus = order.status;
    order.status = dto.status;
    if (dto.status === OrderStatus.CANCELLED && order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }
    order.statusHistory = [
      ...(order.statusHistory || []),
      {
        status: dto.status,
        date: new Date().toISOString(),
        notes: `Order moved from ${previousStatus} to ${dto.status}.`,
      },
    ];

    const saved = await this.orderRepository.save(order);

    if (dto.status === OrderStatus.DELIVERED) {
      await this.escrowService.markAwaitingRelease(saved.id);
      return this.findOne(saved.id, userId);
    }

    // Notify the other party
    const notifyUserId = isBuyer ? order.sellerId : order.buyerId;
    await this.notificationsService.create(notifyUserId, {
      title: 'Order Updated',
      message: `Order #${id.slice(0, 8)} status changed to: ${dto.status}.`,
      notificationType: 'info',
    });

    this.auditLogService.log({
      userId,
      action: 'order.status_update',
      resource: 'order',
      resourceId: id,
      metadata: { from: previousStatus, to: dto.status },
    });

    return saved;
  }

  async cancel(id: string, userId: string): Promise<Order> {
    const order = await this.findOne(id, userId);
    const canCancel = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(order.status);
    if (!canCancel) {
      throw new BadRequestException('This order can no longer be cancelled.');
    }

    order.status = OrderStatus.CANCELLED;
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }
    order.statusHistory = [
      ...(order.statusHistory || []),
      {
        status: OrderStatus.CANCELLED,
        date: new Date().toISOString(),
        notes: 'Order cancelled.',
      },
    ];

    const saved = await this.orderRepository.save(order);
    const notifyUserId = order.buyerId === userId ? order.sellerId : order.buyerId;
    await this.notificationsService.create(notifyUserId, {
      title: 'Order Cancelled',
      message: `Order #${id.slice(0, 8)} has been cancelled.`,
      notificationType: 'warning',
    });

    this.auditLogService.log({
      userId,
      action: 'order.cancel',
      resource: 'order',
      resourceId: id,
    });

    return saved;
  }
}
