import { LogisticsService } from './logistics.service';
import { LogisticsQuoteStatus } from '../entities/logistics-quote-request.entity';
import { OrderStatus } from '../entities/order.entity';
import { ShipmentStatus } from '../entities/shipment.entity';
import { UserRole } from '../entities/user.entity';

const repository = () => ({
  create: jest.fn((value) => value),
  createQueryBuilder: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(async (value) => value),
});

describe('LogisticsService fulfillment cycle', () => {
  let service: LogisticsService;
  let providerRepository: ReturnType<typeof repository>;
  let quoteRepository: ReturnType<typeof repository>;
  let shipmentRepository: ReturnType<typeof repository>;
  let orderRepository: ReturnType<typeof repository>;
  let passportRepository: ReturnType<typeof repository>;
  let auditLogService: { log: jest.Mock };
  let escrowService: {
    markAwaitingRelease: jest.Mock;
    holdForLogisticsDispute: jest.Mock;
  };
  let notificationsService: { create: jest.Mock };

  beforeEach(() => {
    providerRepository = repository();
    quoteRepository = repository();
    shipmentRepository = repository();
    orderRepository = repository();
    passportRepository = repository();
    auditLogService = { log: jest.fn() };
    escrowService = {
      markAwaitingRelease: jest.fn(),
      holdForLogisticsDispute: jest.fn(),
    };
    notificationsService = { create: jest.fn() };

    service = new LogisticsService(
      providerRepository as any,
      quoteRepository as any,
      shipmentRepository as any,
      orderRepository as any,
      passportRepository as any,
      auditLogService as any,
      escrowService as any,
      notificationsService as any,
    );
  });

  it('creates a shipment automatically when a paid order quote is accepted', async () => {
    const actor = { id: 'buyer-1', role: UserRole.INVESTOR };
    const order = {
      id: 'order-1',
      buyerId: actor.id,
      sellerId: 'seller-1',
      status: OrderStatus.CONFIRMED,
      paymentStatus: 'paid',
      statusHistory: [],
    };
    const quote = {
      id: 'quote-1',
      requesterUserId: actor.id,
      orderId: order.id,
      providerId: 'provider-1',
      status: LogisticsQuoteStatus.QUOTED,
      quotedAmount: 75000,
      currency: 'NGN',
      origin: 'Jos',
      destination: 'Lagos Port',
      requestMetadata: {},
    };
    const shipment = {
      id: 'shipment-1',
      trackingId: 'MH12345678',
      orderId: order.id,
      providerId: quote.providerId,
      pickupLocation: quote.origin,
      deliveryLocation: quote.destination,
      status: ShipmentStatus.SCHEDULED,
      milestones: [],
      order,
    };

    quoteRepository.findOne.mockResolvedValue(quote);
    orderRepository.findOne.mockResolvedValue(order);
    shipmentRepository.create.mockReturnValue(shipment);
    shipmentRepository.save.mockResolvedValue(shipment);
    shipmentRepository.findOne.mockResolvedValue(shipment);

    const result = await service.updateQuoteRequest(actor, quote.id, {
      status: LogisticsQuoteStatus.ACCEPTED,
    });

    expect(result.shipmentId).toBe(shipment.id);
    expect(shipmentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: order.id,
        providerId: quote.providerId,
        quoteRequestId: quote.id,
        quoteAmount: quote.quotedAmount,
        pickupLocation: quote.origin,
        deliveryLocation: quote.destination,
      }),
    );
    expect(order.status).toBe(OrderStatus.PROCESSING);
    expect(orderRepository.save).toHaveBeenCalledWith(order);
  });

  it('marks delivered orders awaiting escrow release and refreshes linked passports', async () => {
    const actor = { id: 'admin-1', role: UserRole.ADMIN };
    const order = {
      id: 'order-1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      status: OrderStatus.SHIPPED,
      paymentStatus: 'paid',
      statusHistory: [],
    };
    const shipment = {
      id: 'shipment-1',
      trackingId: 'MH12345678',
      orderId: order.id,
      providerId: 'provider-1',
      mineralPassportId: 'passport-1',
      pickupLocation: 'Jos',
      deliveryLocation: 'Lagos Port',
      currentMilestone: 'in transit',
      status: ShipmentStatus.IN_TRANSIT,
      milestones: [],
      order,
      provider: null,
    };
    const passport = { id: 'passport-1', snapshot: {} };

    shipmentRepository.findOne.mockResolvedValue(shipment);
    shipmentRepository.save.mockImplementation(async (value) => value);
    orderRepository.findOne.mockResolvedValue(order);
    passportRepository.findOne.mockResolvedValue(passport);

    await service.updateShipmentStatus(actor, shipment.id, {
      status: ShipmentStatus.DELIVERED,
      location: 'Lagos Port',
      notes: 'Proof of delivery accepted.',
    });

    expect(order.status).toBe(OrderStatus.DELIVERED);
    expect(escrowService.markAwaitingRelease).toHaveBeenCalledWith(order.id);
    expect(passportRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        shipmentId: shipment.id,
        snapshot: expect.objectContaining({
          shipment: expect.objectContaining({
            trackingId: shipment.trackingId,
            status: ShipmentStatus.DELIVERED,
          }),
        }),
      }),
    );
  });

  it('holds escrow when a shipment is disputed', async () => {
    const actor = { id: 'admin-1', role: UserRole.ADMIN };
    const order = {
      id: 'order-1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      status: OrderStatus.SHIPPED,
      paymentStatus: 'paid',
      statusHistory: [],
    };
    const shipment = {
      id: 'shipment-1',
      trackingId: 'MH12345678',
      orderId: order.id,
      pickupLocation: 'Jos',
      deliveryLocation: 'Lagos',
      status: ShipmentStatus.IN_TRANSIT,
      milestones: [],
      order,
      provider: null,
    };

    shipmentRepository.findOne.mockResolvedValue(shipment);
    shipmentRepository.save.mockImplementation(async (value) => value);
    orderRepository.findOne.mockResolvedValue(order);
    passportRepository.findOne.mockResolvedValue(null);

    await service.updateShipmentStatus(actor, shipment.id, {
      status: ShipmentStatus.DISPUTED,
      notes: 'Delivery evidence is contested.',
    });

    expect(escrowService.holdForLogisticsDispute).toHaveBeenCalledWith(
      order.id,
      'Delivery evidence is contested.',
    );
    expect(escrowService.markAwaitingRelease).not.toHaveBeenCalled();
  });
});
