import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { paginate } from '../common/dto/pagination.dto';
import { LogisticsProvider } from '../entities/logistics-provider.entity';
import { LogisticsQuoteRequest } from '../entities/logistics-quote-request.entity';
import { Order } from '../entities/order.entity';
import { Shipment, ShipmentStatus } from '../entities/shipment.entity';
import { UserRole } from '../entities/user.entity';
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

type Actor = {
  id: string;
  role: UserRole;
};

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(LogisticsProvider)
    private readonly providerRepository: Repository<LogisticsProvider>,
    @InjectRepository(LogisticsQuoteRequest)
    private readonly quoteRepository: Repository<LogisticsQuoteRequest>,
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createProvider(actor: Actor, dto: CreateLogisticsProviderDto) {
    if (!this.isAdmin(actor)) {
      throw new ForbiddenException('Only admins can create logistics providers');
    }
    const provider = this.providerRepository.create({
      ...dto,
      userId: dto.userId || null,
      serviceAreas: dto.serviceAreas || [],
      capabilities: dto.capabilities || [],
      contactEmail: dto.contactEmail || null,
      contactPhone: dto.contactPhone || null,
    });
    const saved = await this.providerRepository.save(provider);
    this.auditLogService.log({
      userId: actor.id,
      action: 'logistics_provider.create',
      resource: 'logistics_provider',
      resourceId: saved.id,
      metadata: { status: saved.status },
    });
    return saved;
  }

  async getProviders() {
    return this.providerRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateProvider(actor: Actor, id: string, dto: UpdateLogisticsProviderDto) {
    if (!this.isAdmin(actor)) {
      throw new ForbiddenException('Only admins can update logistics providers');
    }
    const provider = await this.providerRepository.findOne({ where: { id } });
    if (!provider) throw new NotFoundException('Logistics provider not found');
    Object.assign(provider, {
      userId: dto.userId !== undefined ? dto.userId : provider.userId,
      companyName: dto.companyName ?? provider.companyName,
      serviceAreas: dto.serviceAreas ?? provider.serviceAreas,
      capabilities: dto.capabilities ?? provider.capabilities,
      status: dto.status ?? provider.status,
      contactEmail:
        dto.contactEmail !== undefined ? dto.contactEmail : provider.contactEmail,
      contactPhone:
        dto.contactPhone !== undefined ? dto.contactPhone : provider.contactPhone,
    });
    const saved = await this.providerRepository.save(provider);
    this.auditLogService.log({
      userId: actor.id,
      action: 'logistics_provider.update',
      resource: 'logistics_provider',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto) },
    });
    return saved;
  }

  async createQuoteRequest(dto: CreateQuoteRequestDto, actor?: Actor) {
    if (dto.orderId && actor) {
      await this.assertCanUseOrder(actor, dto.orderId);
    }
    const quoteRequest = this.quoteRepository.create({
      requesterUserId: actor?.id || null,
      orderId: dto.orderId || null,
      origin: dto.origin,
      destination: dto.destination,
      commodity: dto.commodity,
      weight: dto.weight,
      containerType: dto.containerType,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
    });
    const saved = await this.quoteRepository.save(quoteRequest);
    if (actor) {
      this.auditLogService.log({
        userId: actor.id,
        action: 'logistics_quote.request',
        resource: 'logistics_quote_request',
        resourceId: saved.id,
        metadata: { orderId: saved.orderId },
      });
    }
    return saved;
  }

  async getQuoteRequests(actor: Actor, filters: QuoteRequestFilterDto) {
    const query = this.quoteRepository
      .createQueryBuilder('quote')
      .orderBy('quote.createdAt', 'DESC');
    if (!this.isAdmin(actor)) {
      query.where('quote.requesterUserId = :userId', { userId: actor.id });
    }
    if (filters.status) {
      query.andWhere('quote.status = :status', { status: filters.status });
    }
    const [data, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();
    return paginate(data, total, filters);
  }

  async updateQuoteRequest(actor: Actor, id: string, dto: UpdateQuoteRequestDto) {
    if (!this.isAdmin(actor)) {
      throw new ForbiddenException('Only admins can update quote requests');
    }
    const quote = await this.quoteRepository.findOne({ where: { id } });
    if (!quote) throw new NotFoundException('Quote request not found');
    Object.assign(quote, {
      status: dto.status ?? quote.status,
      quotedAmount:
        dto.quotedAmount !== undefined ? dto.quotedAmount : quote.quotedAmount,
      quoteNotes: dto.quoteNotes !== undefined ? dto.quoteNotes : quote.quoteNotes,
    });
    const saved = await this.quoteRepository.save(quote);
    this.auditLogService.log({
      userId: actor.id,
      action: 'logistics_quote.update',
      resource: 'logistics_quote_request',
      resourceId: saved.id,
      metadata: { status: saved.status },
    });
    return saved;
  }

  async createShipment(actor: Actor, dto: CreateShipmentDto) {
    await this.assertCanUseOrder(actor, dto.orderId);
    const trackingId = `MH${Date.now().toString().slice(-8)}`;
    const shipment = this.shipmentRepository.create({
      trackingId,
      orderId: dto.orderId,
      providerId: dto.providerId || null,
      mineralPassportId: dto.mineralPassportId || null,
      quoteAmount: dto.quoteAmount ?? null,
      pickupLocation: dto.pickupLocation,
      deliveryLocation: dto.deliveryLocation,
      currentMilestone: 'Quote requested',
      milestones: [
        {
          status: ShipmentStatus.QUOTE_REQUESTED,
          location: dto.pickupLocation,
          notes: 'Shipment record created.',
          occurredAt: new Date().toISOString(),
        },
      ],
    });
    const saved = await this.shipmentRepository.save(shipment);
    this.auditLogService.log({
      userId: actor.id,
      action: 'shipment.create',
      resource: 'shipment',
      resourceId: saved.id,
      metadata: { orderId: saved.orderId, trackingId: saved.trackingId },
    });
    return this.getShipment(actor, saved.id);
  }

  async getShipments(actor: Actor, filters: ShipmentFilterDto) {
    const query = this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.order', 'order')
      .leftJoinAndSelect('shipment.provider', 'provider')
      .orderBy('shipment.createdAt', 'DESC');
    if (!this.isAdmin(actor)) {
      query.where('(order.buyerId = :userId OR order.sellerId = :userId OR provider.userId = :userId)', {
        userId: actor.id,
      });
    }
    if (filters.status) {
      query.andWhere('shipment.status = :status', { status: filters.status });
    }
    if (filters.orderId) {
      query.andWhere('shipment.orderId = :orderId', { orderId: filters.orderId });
    }
    if (filters.providerId) {
      query.andWhere('shipment.providerId = :providerId', {
        providerId: filters.providerId,
      });
    }
    const [data, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();
    return paginate(data.map((shipment) => this.toShipmentResponse(shipment)), total, filters);
  }

  async getShipment(actor: Actor, id: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['order', 'provider'],
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    this.assertCanAccessShipment(actor, shipment);
    return this.toShipmentResponse(shipment);
  }

  async trackShipment(trackingId: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { trackingId },
      relations: ['order', 'provider'],
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return this.toShipmentResponse(shipment);
  }

  async updateShipmentStatus(actor: Actor, id: string, dto: UpdateShipmentStatusDto) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['order', 'provider'],
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    this.assertCanAccessShipment(actor, shipment);
    shipment.status = dto.status;
    shipment.currentMilestone = dto.status.replace(/_/g, ' ');
    shipment.handoffEvidence =
      dto.handoffEvidence !== undefined
        ? dto.handoffEvidence
        : shipment.handoffEvidence;
    shipment.milestones = [
      ...(shipment.milestones || []),
      {
        status: dto.status,
        location: dto.location,
        notes: dto.notes,
        occurredAt: new Date().toISOString(),
      },
    ];
    if (dto.status === ShipmentStatus.DELIVERED) {
      shipment.deliveredAt = new Date();
    }
    const saved = await this.shipmentRepository.save(shipment);
    this.auditLogService.log({
      userId: actor.id,
      action: 'shipment.status.update',
      resource: 'shipment',
      resourceId: saved.id,
      metadata: { status: saved.status, trackingId: saved.trackingId },
    });
    return this.getShipment(actor, saved.id);
  }

  private isAdmin(actor: Actor) {
    return actor.role === UserRole.ADMIN;
  }

  private async assertCanUseOrder(actor: Actor, orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isAdmin(actor) && order.buyerId !== actor.id && order.sellerId !== actor.id) {
      throw new ForbiddenException('You can only use orders linked to your account');
    }
    return order;
  }

  private assertCanAccessShipment(actor: Actor, shipment: Shipment) {
    if (this.isAdmin(actor)) return;
    if (
      shipment.order?.buyerId !== actor.id &&
      shipment.order?.sellerId !== actor.id &&
      shipment.provider?.userId !== actor.id
    ) {
      throw new ForbiddenException('You can only access shipments linked to your account');
    }
  }

  private toShipmentResponse(shipment: Shipment) {
    return {
      ...shipment,
      provider: shipment.provider
        ? {
            id: shipment.provider.id,
            companyName: shipment.provider.companyName,
            status: shipment.provider.status,
            contactEmail: shipment.provider.contactEmail || null,
          }
        : null,
      order: shipment.order
        ? {
            id: shipment.order.id,
            buyerId: shipment.order.buyerId,
            sellerId: shipment.order.sellerId,
            listingId: shipment.order.listingId,
            status: shipment.order.status,
          }
        : null,
    };
  }
}
