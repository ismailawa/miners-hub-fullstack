import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { paginate } from '../common/dto/pagination.dto';
import {
  LogisticsProvider,
  LogisticsProviderCategory,
  LogisticsProviderStatus,
} from '../entities/logistics-provider.entity';
import {
  LogisticsQuoteRequest,
  LogisticsQuoteStatus,
} from '../entities/logistics-quote-request.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { MineralPassport } from '../entities/mineral-passport.entity';
import { Shipment, ShipmentStatus } from '../entities/shipment.entity';
import { UserRole } from '../entities/user.entity';
import { EscrowService } from '../escrow/escrow.service';
import { NotificationsService } from '../notifications/notifications.service';
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
    @InjectRepository(MineralPassport)
    private readonly passportRepository: Repository<MineralPassport>,
    private readonly auditLogService: AuditLogService,
    private readonly escrowService: EscrowService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createProvider(actor: Actor, dto: CreateLogisticsProviderDto) {
    if (!this.isAdmin(actor)) {
      throw new ForbiddenException('Only admins can create logistics providers');
    }
    const provider = this.providerRepository.create({
      ...dto,
      userId: dto.userId || null,
      category: dto.category,
      serviceAreas: dto.serviceAreas || [],
      capabilities: dto.capabilities || [],
      contactEmail: dto.contactEmail || null,
      contactPhone: dto.contactPhone || null,
      fleetProfiles: dto.fleetProfiles || [],
      integrationMetadata: dto.integrationMetadata || null,
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
      category: dto.category ?? provider.category,
      serviceAreas: dto.serviceAreas ?? provider.serviceAreas,
      capabilities: dto.capabilities ?? provider.capabilities,
      status: dto.status ?? provider.status,
      contactEmail:
        dto.contactEmail !== undefined ? dto.contactEmail : provider.contactEmail,
      contactPhone:
        dto.contactPhone !== undefined ? dto.contactPhone : provider.contactPhone,
      fleetProfiles: dto.fleetProfiles ?? provider.fleetProfiles,
      integrationMetadata:
        dto.integrationMetadata !== undefined
          ? dto.integrationMetadata
          : provider.integrationMetadata,
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
    let order: Order | undefined;
    if (dto.orderId && actor) {
      order = await this.assertCanUseOrder(actor, dto.orderId);
    }
    const matchedProvider = dto.providerId
      ? null
      : await this.matchLocalProvider(dto);
    const quoteRequest = this.quoteRepository.create({
      requesterUserId: actor?.id || null,
      orderId: dto.orderId || null,
      providerId: dto.providerId || matchedProvider?.id || null,
      origin: dto.origin,
      destination: dto.destination,
      commodity: dto.commodity,
      weight: dto.weight,
      containerType: dto.containerType,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      requestMetadata: {
        ...(dto.requestMetadata || {}),
        pickupWindow: dto.pickupWindow || null,
        requiredVehicleType: dto.requiredVehicleType || null,
        loadingConstraints: dto.loadingConstraints || null,
        safetyNotes: dto.safetyNotes || null,
        matchedProvider: matchedProvider
          ? {
              id: matchedProvider.id,
              companyName: matchedProvider.companyName,
              category: matchedProvider.category,
              serviceAreas: matchedProvider.serviceAreas,
              matchedAt: new Date().toISOString(),
              matchReason: 'Matched by active local haulage availability, route/service area, vehicle type, and capacity.',
            }
          : null,
        order: order
          ? {
              id: order.id,
              status: order.status,
              paymentStatus: order.paymentStatus,
              quantity: order.quantity,
              deliveryAddress: order.deliveryAddress,
              listingId: order.listingId,
            }
          : undefined,
      },
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
    const quote = await this.quoteRepository.findOne({
      where: { id },
      relations: ['provider'],
    });
    if (!quote) throw new NotFoundException('Quote request not found');

    const accepting = dto.status === LogisticsQuoteStatus.ACCEPTED;
    const declining = dto.status === LogisticsQuoteStatus.DECLINED;
    const isRequester = quote.requesterUserId === actor.id;
    const canDecision = isRequester && quote.status === LogisticsQuoteStatus.QUOTED;

    if (!this.isAdmin(actor) && !(canDecision && (accepting || declining))) {
      throw new ForbiddenException('Only admins can quote requests; requesters can accept or decline quoted requests');
    }

    Object.assign(quote, {
      status: dto.status ?? quote.status,
      providerId: dto.providerId !== undefined ? dto.providerId : quote.providerId,
      quotedAmount:
        dto.quotedAmount !== undefined ? dto.quotedAmount : quote.quotedAmount,
      quoteNotes: dto.quoteNotes !== undefined ? dto.quoteNotes : quote.quoteNotes,
      eta: dto.eta !== undefined ? dto.eta : quote.eta,
      routeNotes: dto.routeNotes !== undefined ? dto.routeNotes : quote.routeNotes,
      costBreakdown:
        dto.costBreakdown !== undefined ? dto.costBreakdown : quote.costBreakdown,
      currency: dto.currency ?? quote.currency,
      validUntil: dto.validUntil !== undefined ? dto.validUntil : quote.validUntil,
      invoiceMetadata:
        dto.invoiceMetadata !== undefined
          ? dto.invoiceMetadata
          : quote.invoiceMetadata,
    });
    if (accepting) {
      if (!quote.quotedAmount) {
        throw new BadRequestException('A quoted amount is required before acceptance.');
      }
      quote.acceptedByUserId = actor.id;
      quote.acceptedAt = new Date();
    }
    const saved = await this.quoteRepository.save(quote);
    if (accepting && saved.orderId && !saved.shipmentId) {
      const shipment = await this.createShipmentFromAcceptedQuote(actor, saved);
      saved.shipmentId = shipment.id;
      await this.quoteRepository.save(saved);
    }
    await this.notifyQuoteUpdate(saved);
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
    await this.assertCanScheduleOrder(actor, dto.orderId);
    const trackingId = `MH${Date.now().toString().slice(-8)}`;
    const shipment = this.shipmentRepository.create({
      trackingId,
      orderId: dto.orderId,
      providerId: dto.providerId || null,
      mineralPassportId: dto.mineralPassportId || null,
      quoteAmount: dto.quoteAmount ?? null,
      quoteRequestId: dto.quoteRequestId || null,
      currency: dto.currency || 'NGN',
      pickupLocation: dto.pickupLocation,
      deliveryLocation: dto.deliveryLocation,
      currentMilestone: 'Scheduled',
      status: ShipmentStatus.SCHEDULED,
      trackingReferences: dto.trackingReferences || null,
      internationalDetails: dto.internationalDetails || null,
      invoiceMetadata: dto.invoiceMetadata || null,
      milestones: [
        {
          status: ShipmentStatus.SCHEDULED,
          location: dto.pickupLocation,
          notes: 'Shipment scheduled.',
          occurredAt: new Date().toISOString(),
        },
      ],
    });
    const saved = await this.shipmentRepository.save(shipment);
    await this.syncOrderFromShipment(saved, 'Shipment scheduled.');
    await this.refreshLinkedPassport(saved);
    await this.notifyShipmentUsers(saved, 'Shipment Scheduled', `Shipment ${saved.trackingId} has been scheduled.`);
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

  async ingestMaerskTrackingEvent(payload: Record<string, any>) {
    const reference = this.pickExternalTrackingReference(payload);
    if (!reference) {
      throw new BadRequestException('No supported Maersk tracking reference found.');
    }

    const shipment = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .where("shipment.trackingReferences->>'containerNumber' = :reference", { reference })
      .orWhere("shipment.trackingReferences->>'bookingNumber' = :reference", { reference })
      .orWhere("shipment.trackingReferences->>'billOfLadingNumber' = :reference", { reference })
      .orWhere("shipment.trackingReferences->>'transportDocumentNumber' = :reference", { reference })
      .getOne();

    if (!shipment) {
      throw new NotFoundException('No shipment is linked to this Maersk reference.');
    }

    const status = this.mapExternalEventStatus(payload);
    return this.updateShipmentStatus(
      { id: 'maersk-webhook', role: UserRole.ADMIN },
      shipment.id,
      {
        status,
        location: String(payload.locationName || payload.location || payload.facility || ''),
        notes: String(payload.eventDescription || payload.description || payload.eventType || 'Maersk tracking event received.'),
        handoffEvidence: {
          ...(shipment.handoffEvidence || {}),
          maerskLastEvent: payload,
        },
      },
    );
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
    await this.syncOrderFromShipment(saved, dto.notes);
    await this.pauseEscrowForLogisticsIssue(saved, dto.notes);
    await this.refreshLinkedPassport(saved);
    await this.notifyShipmentUsers(saved, 'Shipment Updated', `Shipment ${saved.trackingId} moved to ${dto.status.replace(/_/g, ' ')}.`);
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

  private async assertCanScheduleOrder(actor: Actor, orderId: string) {
    const order = await this.assertCanUseOrder(actor, orderId);
    if (order.paymentStatus !== 'paid') {
      throw new BadRequestException('Shipment can only be scheduled after payment is confirmed.');
    }
    if (![OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED].includes(order.status)) {
      throw new BadRequestException('Order must be confirmed or in fulfillment before logistics can be scheduled.');
    }
    return order;
  }

  private async matchLocalProvider(dto: CreateQuoteRequestDto) {
    const providers = await this.providerRepository.find({
      where: {
        category: LogisticsProviderCategory.LOCAL_HAULAGE,
        status: LogisticsProviderStatus.ACTIVE,
      },
      order: { createdAt: 'ASC' },
    });
    const origin = dto.origin.toLowerCase();
    const destination = dto.destination.toLowerCase();
    const vehicleType = (dto.requiredVehicleType || '').toLowerCase();
    const requiredTons = Number(dto.weight || 0) / 1000;

    return providers.find((provider) => {
      const servesRoute = (provider.serviceAreas || []).some((area) => {
        const normalized = area.toLowerCase();
        return origin.includes(normalized) || destination.includes(normalized);
      });
      const hasCapability = !vehicleType || (provider.capabilities || []).some((capability) =>
        capability.toLowerCase().includes(vehicleType) || vehicleType.includes(capability.toLowerCase()),
      );
      const hasVehicle = (provider.fleetProfiles || []).some((vehicle) => {
        const availability = vehicle.availability || 'available';
        const capacity = Number(vehicle.capacityTons || 0);
        const type = String(vehicle.vehicleType || '').toLowerCase();
        const typeMatches = !vehicleType || type.includes(vehicleType) || vehicleType.includes(type);
        return availability === 'available' && capacity >= requiredTons && typeMatches;
      });
      return servesRoute && (hasCapability || hasVehicle) && (!requiredTons || hasVehicle);
    }) || null;
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

  private async createShipmentFromAcceptedQuote(
    actor: Actor,
    quote: LogisticsQuoteRequest,
  ) {
    if (!quote.orderId) {
      throw new BadRequestException('Accepted quote is not linked to an order.');
    }
    const metadata = quote.requestMetadata || {};
    return this.createShipment(actor, {
      orderId: quote.orderId,
      providerId: quote.providerId || null,
      quoteRequestId: quote.id,
      quoteAmount: Number(quote.quotedAmount),
      currency: quote.currency,
      pickupLocation: quote.origin,
      deliveryLocation: quote.destination,
      trackingReferences: metadata.trackingReferences || null,
      internationalDetails: metadata.internationalDetails || null,
      invoiceMetadata: quote.invoiceMetadata || null,
    });
  }

  private async syncOrderFromShipment(shipment: Shipment, notes?: string) {
    const order = await this.orderRepository.findOne({ where: { id: shipment.orderId } });
    if (!order) return;
    const nextStatus = this.orderStatusForShipment(shipment.status);
    if (!nextStatus) return;
    if (order.status === OrderStatus.DELIVERED && nextStatus !== OrderStatus.CANCELLED) {
      return;
    }
    order.status = nextStatus;
    order.statusHistory = [
      ...(order.statusHistory || []),
      {
        status: nextStatus,
        date: new Date().toISOString(),
        location: shipment.currentMilestone || shipment.deliveryLocation,
        notes: notes || `Logistics shipment ${shipment.trackingId} moved to ${shipment.status.replace(/_/g, ' ')}.`,
      },
    ];
    await this.orderRepository.save(order);
    if (nextStatus === OrderStatus.DELIVERED) {
      await this.escrowService.markAwaitingRelease(order.id);
    }
  }

  private async pauseEscrowForLogisticsIssue(shipment: Shipment, notes?: string) {
    if (![ShipmentStatus.DISPUTED, ShipmentStatus.CANCELLED].includes(shipment.status)) {
      return;
    }
    await this.escrowService.holdForLogisticsDispute(
      shipment.orderId,
      notes || `Shipment ${shipment.trackingId} is ${shipment.status.replace(/_/g, ' ')}.`,
    );
  }

  private async refreshLinkedPassport(shipment: Shipment) {
    if (!shipment.mineralPassportId) return;
    const passport = await this.passportRepository.findOne({
      where: { id: shipment.mineralPassportId },
    });
    if (!passport) return;
    passport.shipmentId = shipment.id;
    passport.snapshot = {
      ...(passport.snapshot || {}),
      shipment: {
        id: shipment.id,
        trackingId: shipment.trackingId,
        providerId: shipment.providerId || null,
        pickupLocation: shipment.pickupLocation,
        deliveryLocation: shipment.deliveryLocation,
        status: shipment.status,
        currentMilestone: shipment.currentMilestone || null,
        milestones: shipment.milestones || [],
        deliveredAt: shipment.deliveredAt || null,
        handoffEvidence: shipment.handoffEvidence || null,
        trackingReferences: shipment.trackingReferences || null,
        internationalDetails: shipment.internationalDetails || null,
      },
    };
    await this.passportRepository.save(passport);
  }

  private orderStatusForShipment(status: ShipmentStatus) {
    if (status === ShipmentStatus.SCHEDULED || status === ShipmentStatus.PICKED_UP) {
      return OrderStatus.PROCESSING;
    }
    if (status === ShipmentStatus.IN_TRANSIT || status === ShipmentStatus.AT_CHECKPOINT) {
      return OrderStatus.SHIPPED;
    }
    if (status === ShipmentStatus.DELIVERED) {
      return OrderStatus.DELIVERED;
    }
    if (status === ShipmentStatus.CANCELLED) {
      return OrderStatus.CANCELLED;
    }
    return null;
  }

  private pickExternalTrackingReference(payload: Record<string, any>) {
    return String(
      payload.containerNumber ||
        payload.equipmentReference ||
        payload.bookingNumber ||
        payload.billOfLadingNumber ||
        payload.transportDocumentNumber ||
        '',
    ).trim();
  }

  private mapExternalEventStatus(payload: Record<string, any>) {
    const text = [
      payload.eventType,
      payload.eventDescription,
      payload.description,
      payload.transportEventTypeCode,
      payload.shipmentEventTypeCode,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (text.includes('delivered') || text.includes('delivery')) {
      return ShipmentStatus.DELIVERED;
    }
    if (text.includes('gate out') || text.includes('depart') || text.includes('load')) {
      return ShipmentStatus.IN_TRANSIT;
    }
    if (text.includes('arriv') || text.includes('gate in') || text.includes('checkpoint')) {
      return ShipmentStatus.AT_CHECKPOINT;
    }
    if (text.includes('received') || text.includes('pickup') || text.includes('empty to shipper')) {
      return ShipmentStatus.PICKED_UP;
    }
    return ShipmentStatus.IN_TRANSIT;
  }

  private async notifyQuoteUpdate(quote: LogisticsQuoteRequest) {
    if (!quote.requesterUserId) return;
    await this.notificationsService.create(quote.requesterUserId, {
      title: 'Logistics Quote Updated',
      message: `Your logistics quote from ${quote.origin} to ${quote.destination} is now ${quote.status}.`,
      notificationType: quote.status === LogisticsQuoteStatus.DECLINED ? 'warning' : 'info',
    });
  }

  private async notifyShipmentUsers(shipment: Shipment, title: string, message: string) {
    const hydrated = await this.shipmentRepository.findOne({
      where: { id: shipment.id },
      relations: ['order', 'provider'],
    });
    if (!hydrated?.order) return;
    const recipients = new Set<string>([
      hydrated.order.buyerId,
      hydrated.order.sellerId,
      hydrated.provider?.userId || '',
    ]);
    await Promise.all(
      [...recipients]
        .filter(Boolean)
        .map((userId) =>
          this.notificationsService.create(userId, {
            title,
            message,
            notificationType: 'info',
          }),
        ),
    );
  }
}
