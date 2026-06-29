import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EscrowStatus,
  EscrowTransaction,
  EscrowTransferStatus,
} from '../entities/escrow-transaction.entity';
import {
  SellerPayoutAccount,
  SellerPayoutStatus,
} from '../entities/seller-payout-account.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { User, UserRole } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { UpsertPayoutAccountDto } from './escrow.dto';
import { FlutterwaveService } from './flutterwave.service';

@Injectable()
export class EscrowService {
  constructor(
    @InjectRepository(EscrowTransaction)
    private readonly escrowRepository: Repository<EscrowTransaction>,
    @InjectRepository(SellerPayoutAccount)
    private readonly payoutRepository: Repository<SellerPayoutAccount>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly flutterwaveService: FlutterwaveService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getPayoutAccount(userId: string) {
    const account = await this.payoutRepository.findOne({ where: { userId } });
    return account ? this.toSafePayoutAccount(account) : null;
  }

  async hasActivePayoutAccount(userId: string) {
    const account = await this.payoutRepository.findOne({
      where: { userId, status: SellerPayoutStatus.ACTIVE },
    });
    return Boolean(account);
  }

  async upsertPayoutAccount(userId: string, dto: UpsertPayoutAccountDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.role !== UserRole.MINER) {
      throw new ForbiddenException('Only sellers can link payout accounts.');
    }

    const existing = await this.payoutRepository.findOne({ where: { userId } });
    const reference = existing?.flutterwaveSubaccountReference || `seller-${userId}-${Date.now()}`;
    const account = existing ?? this.payoutRepository.create({ userId });

    Object.assign(account, {
      bankName: dto.bankName,
      bankCode: dto.bankCode,
      accountNumber: dto.accountNumber,
      accountName: dto.accountName,
      currency: dto.currency || 'NGN',
      status: SellerPayoutStatus.PENDING,
      flutterwaveSubaccountReference: reference,
      failureReason: null,
    });

    try {
      const subaccount = await this.flutterwaveService.createSubaccount({
        bankCode: dto.bankCode,
        accountNumber: dto.accountNumber,
        accountName: dto.accountName,
        businessName: user.name || dto.accountName,
        currency: dto.currency || 'NGN',
        reference,
      });
      account.flutterwaveSubaccountId = String(
        subaccount?.subaccount_id || subaccount?.id || reference,
      );
      account.status = SellerPayoutStatus.ACTIVE;
      account.metadata = { flutterwave: subaccount?.raw || subaccount };
    } catch (error) {
      account.status = SellerPayoutStatus.FAILED;
      account.failureReason =
        error instanceof Error ? error.message : 'Unable to create Flutterwave subaccount.';
      await this.payoutRepository.save(account);
      throw error;
    }

    const saved = await this.payoutRepository.save(account);
    this.auditLogService.log({
      userId,
      action: 'seller_payout_account.upsert',
      resource: 'seller_payout_account',
      resourceId: saved.id,
    });
    return this.toSafePayoutAccount(saved);
  }

  async initiateOrderEscrow(orderId: string, buyerId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['buyer', 'seller', 'listing', 'escrowTransaction'],
    });
    if (!order) throw new NotFoundException('Order not found.');
    if (order.buyerId !== buyerId) throw new ForbiddenException('Only the buyer can pay for this order.');
    if (order.paymentStatus !== 'pending') throw new BadRequestException('Order payment is already processed.');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be paid into escrow.');
    }

    const payoutAccount = await this.payoutRepository.findOne({
      where: { userId: order.sellerId },
    });
    if (!payoutAccount || payoutAccount.status !== SellerPayoutStatus.ACTIVE) {
      throw new BadRequestException('Seller must link an active payout bank account before escrow payment.');
    }

    const existing = await this.escrowRepository.findOne({ where: { orderId } });
    if (existing?.flutterwavePaymentLink && existing.status === EscrowStatus.PENDING_PAYMENT) {
      return this.toInitiationResponse(order, existing);
    }

    const amounts = this.calculateAmounts(Number(order.totalAmount));
    const txRef = `MH-ESCROW-${order.id.slice(0, 8)}-${Date.now()}`;
    const redirectUrl = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/orders`;
    const escrow = this.escrowRepository.create({
      orderId: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      sellerPayoutAccountId: payoutAccount.id,
      grossAmount: amounts.grossAmount,
      commissionAmount: amounts.commissionAmount,
      sellerNetAmount: amounts.sellerNetAmount,
      currency: payoutAccount.currency || 'NGN',
      status: EscrowStatus.PENDING_PAYMENT,
      flutterwaveTxRef: txRef,
    });

    const payment = await this.flutterwaveService.initializePayment({
      txRef,
      amount: amounts.grossAmount,
      currency: escrow.currency,
      redirectUrl,
      customer: {
        email: order.buyer?.email || 'buyer@minershub.local',
        name: order.buyer?.name,
      },
      meta: {
        orderId: order.id,
        escrow: true,
        sellerId: order.sellerId,
        buyerId: order.buyerId,
      },
    });

    escrow.flutterwavePaymentLink = payment.link || null;
    escrow.metadata = { paymentInitialization: payment.raw };
    const saved = await this.escrowRepository.save(escrow);

    this.auditLogService.log({
      userId: buyerId,
      action: 'escrow.initiate',
      resource: 'order',
      resourceId: order.id,
      metadata: { escrowId: saved.id, txRef },
    });

    return this.toInitiationResponse(order, saved);
  }

  async handleFlutterwaveWebhook(payload: any, verifHash?: string | string[]) {
    this.assertWebhookHash(verifHash);

    const data = payload?.data || payload;
    const txRef = data?.tx_ref || data?.txRef;
    const transactionId = data?.id || data?.transaction_id;
    if (!txRef) throw new BadRequestException('Webhook is missing transaction reference.');

    const escrow = await this.escrowRepository.findOne({
      where: { flutterwaveTxRef: txRef },
      relations: ['order'],
    });
    if (!escrow) throw new NotFoundException('Escrow transaction not found.');
    if (escrow.status !== EscrowStatus.PENDING_PAYMENT) {
      return { received: true, status: escrow.status };
    }

    const verified = transactionId
      ? await this.flutterwaveService.verifyTransaction(String(transactionId))
      : data;
    const paymentStatus = verified?.status || data?.status;
    const amount = Number(verified?.amount ?? data?.amount ?? 0);
    const currency = String(verified?.currency ?? data?.currency ?? escrow.currency);

    if (paymentStatus !== 'successful' || amount < Number(escrow.grossAmount) || currency !== escrow.currency) {
      escrow.flutterwavePaymentStatus = paymentStatus || 'failed';
      escrow.status = EscrowStatus.FAILED;
      escrow.metadata = { ...(escrow.metadata || {}), lastWebhook: payload, verified };
      await this.escrowRepository.save(escrow);
      throw new BadRequestException('Flutterwave payment could not be verified.');
    }

    escrow.status = EscrowStatus.FUNDED;
    escrow.flutterwaveTransactionId = transactionId ? String(transactionId) : null;
    escrow.flutterwavePaymentStatus = paymentStatus;
    escrow.fundedAt = new Date();
    escrow.metadata = { ...(escrow.metadata || {}), fundedWebhook: payload, verified };

    const order = escrow.order;
    order.paymentStatus = 'paid';
    order.status = OrderStatus.CONFIRMED;
    order.statusHistory = [
      ...(order.statusHistory || []),
      {
        status: OrderStatus.CONFIRMED,
        date: new Date().toISOString(),
        notes: 'Payment captured into escrow.',
      },
    ];

    await this.orderRepository.save(order);
    await this.escrowRepository.save(escrow);
    await this.notificationsService.create(order.sellerId, {
      title: 'Escrow Funded',
      message: `Order #${order.id.slice(0, 8)} has been funded and is ready to process.`,
      notificationType: 'info',
    });

    return { received: true, status: escrow.status };
  }

  async markAwaitingRelease(orderId: string) {
    const escrow = await this.escrowRepository.findOne({ where: { orderId } });
    if (!escrow || escrow.status !== EscrowStatus.FUNDED) return null;

    escrow.status = EscrowStatus.AWAITING_RELEASE;
    escrow.metadata = {
      ...(escrow.metadata || {}),
      awaitingReleaseAt: new Date().toISOString(),
    };
    return this.escrowRepository.save(escrow);
  }

  async releaseEscrow(orderId: string, adminId: string) {
    const escrow = await this.escrowRepository.findOne({
      where: { orderId },
      relations: ['order', 'sellerPayoutAccount'],
    });
    if (!escrow) throw new NotFoundException('Escrow transaction not found.');
    if (escrow.status === EscrowStatus.RELEASED) throw new BadRequestException('Escrow has already been released.');
    if (escrow.status !== EscrowStatus.AWAITING_RELEASE) {
      throw new BadRequestException('Escrow is not awaiting release.');
    }
    if (!escrow.sellerPayoutAccount || escrow.sellerPayoutAccount.status !== SellerPayoutStatus.ACTIVE) {
      throw new BadRequestException('Seller payout account is not active.');
    }
    const platformBankCode = this.requiredConfig('PLATFORM_COMMISSION_BANK_CODE');
    const platformAccountNumber = this.requiredConfig('PLATFORM_COMMISSION_ACCOUNT_NUMBER');

    escrow.status = EscrowStatus.RELEASE_PROCESSING;
    await this.escrowRepository.save(escrow);

    const sellerTransferRef = `MH-SELLER-${escrow.id.slice(0, 8)}-${Date.now()}`;
    const sellerTransfer = await this.flutterwaveService.createTransfer({
      amount: Number(escrow.sellerNetAmount),
      currency: escrow.currency,
      accountBank: escrow.sellerPayoutAccount.bankCode,
      accountNumber: escrow.sellerPayoutAccount.accountNumber,
      narration: `Miners Hub escrow release for order ${orderId.slice(0, 8)}`,
      reference: sellerTransferRef,
    });

    const commissionTransferRef = `MH-COMM-${escrow.id.slice(0, 8)}-${Date.now()}`;
    const commissionTransfer = await this.flutterwaveService.createTransfer({
      amount: Number(escrow.commissionAmount),
      currency: escrow.currency,
      accountBank: platformBankCode,
      accountNumber: platformAccountNumber,
      narration: `Miners Hub commission for order ${orderId.slice(0, 8)}`,
      reference: commissionTransferRef,
    });

    escrow.sellerTransferReference = sellerTransferRef;
    escrow.sellerTransferId = String(sellerTransfer?.id || sellerTransfer?.reference || sellerTransferRef);
    escrow.sellerTransferStatus = this.normalizeTransferStatus(sellerTransfer?.status);
    escrow.platformCommissionTransferReference = commissionTransferRef;
    escrow.platformCommissionTransferId = String(
      commissionTransfer?.id || commissionTransfer?.reference || commissionTransferRef,
    );
    escrow.platformCommissionTransferStatus = this.normalizeTransferStatus(commissionTransfer?.status);
    if (
      escrow.sellerTransferStatus === EscrowTransferStatus.FAILED ||
      escrow.platformCommissionTransferStatus === EscrowTransferStatus.FAILED
    ) {
      escrow.status = EscrowStatus.FAILED;
      await this.escrowRepository.save(escrow);
      throw new BadRequestException('One or more Flutterwave transfer requests failed.');
    }
    escrow.status = EscrowStatus.RELEASED;
    escrow.releasedAt = new Date();
    escrow.order.statusHistory = [
      ...(escrow.order.statusHistory || []),
      {
        status: escrow.order.status,
        date: new Date().toISOString(),
        notes: 'Escrow released by admin.',
      },
    ];

    await this.orderRepository.save(escrow.order);
    const saved = await this.escrowRepository.save(escrow);
    this.auditLogService.log({
      userId: adminId,
      action: 'escrow.release',
      resource: 'order',
      resourceId: orderId,
      metadata: { escrowId: escrow.id },
    });
    return saved;
  }

  async refundEscrow(orderId: string, adminId: string) {
    const escrow = await this.escrowRepository.findOne({
      where: { orderId },
      relations: ['order'],
    });
    if (!escrow) throw new NotFoundException('Escrow transaction not found.');
    if ([EscrowStatus.RELEASED, EscrowStatus.RELEASE_PROCESSING].includes(escrow.status)) {
      throw new BadRequestException('Released escrow cannot be refunded.');
    }
    if (escrow.status === EscrowStatus.REFUNDED) {
      throw new BadRequestException('Escrow has already been refunded.');
    }

    escrow.status = EscrowStatus.REFUND_PROCESSING;
    await this.escrowRepository.save(escrow);

    const refund =
      escrow.flutterwaveTransactionId
        ? await this.flutterwaveService.refundTransaction(
            escrow.flutterwaveTransactionId,
            Number(escrow.grossAmount),
          )
        : { status: 'manual_required' };

    escrow.status = EscrowStatus.REFUNDED;
    escrow.refundedAt = new Date();
    escrow.metadata = { ...(escrow.metadata || {}), refund };
    escrow.order.paymentStatus = 'refunded';
    escrow.order.status = OrderStatus.REFUNDED;
    escrow.order.statusHistory = [
      ...(escrow.order.statusHistory || []),
      {
        status: OrderStatus.REFUNDED,
        date: new Date().toISOString(),
        notes: 'Escrow refunded by admin.',
      },
    ];

    await this.orderRepository.save(escrow.order);
    const saved = await this.escrowRepository.save(escrow);
    this.auditLogService.log({
      userId: adminId,
      action: 'escrow.refund',
      resource: 'order',
      resourceId: orderId,
      metadata: { escrowId: escrow.id },
    });
    return saved;
  }

  private assertWebhookHash(verifHash?: string | string[]) {
    const expected = this.configService.get<string>('FLUTTERWAVE_WEBHOOK_HASH');
    if (!expected) return;

    const received = Array.isArray(verifHash) ? verifHash[0] : verifHash;
    if (!received || received !== expected) {
      throw new UnauthorizedException('Invalid Flutterwave webhook hash.');
    }
  }

  private calculateAmounts(grossAmount: number) {
    const percent = Number(this.configService.get<string>('PLATFORM_COMMISSION_PERCENT') || 5);
    const commissionAmount = Math.round(grossAmount * percent) / 100;
    const sellerNetAmount = Math.round((grossAmount - commissionAmount) * 100) / 100;
    return {
      grossAmount: Math.round(grossAmount * 100) / 100,
      commissionAmount,
      sellerNetAmount,
    };
  }

  private normalizeTransferStatus(status?: string): EscrowTransferStatus {
    const normalized = String(status || '').toLowerCase();
    if (['successful', 'success', 'completed'].includes(normalized)) {
      return EscrowTransferStatus.SUCCESSFUL;
    }
    if (['failed', 'error'].includes(normalized)) return EscrowTransferStatus.FAILED;
    return EscrowTransferStatus.PENDING;
  }

  private requiredConfig(key: string) {
    const value = this.configService.get<string>(key);
    if (value) return value;
    if (!this.flutterwaveService.configured) return '000';
    throw new BadRequestException(`${key} is required before escrow release.`);
  }

  private toInitiationResponse(order: Order, escrow: EscrowTransaction) {
    return {
      order,
      escrow,
      paymentLink: escrow.flutterwavePaymentLink,
      txRef: escrow.flutterwaveTxRef,
    };
  }

  private toSafePayoutAccount(account: SellerPayoutAccount) {
    return {
      id: account.id,
      bankName: account.bankName,
      bankCode: account.bankCode,
      accountName: account.accountName,
      accountNumberMasked: this.maskAccountNumber(account.accountNumber),
      currency: account.currency,
      status: account.status,
      flutterwaveSubaccountId: account.flutterwaveSubaccountId,
      failureReason: account.failureReason,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  private maskAccountNumber(accountNumber: string) {
    if (accountNumber.length <= 4) return '****';
    return `${'*'.repeat(Math.max(accountNumber.length - 4, 0))}${accountNumber.slice(-4)}`;
  }
}
