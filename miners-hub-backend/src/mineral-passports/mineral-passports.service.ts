import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { paginate } from '../common/dto/pagination.dto';
import { EscrowTransaction } from '../entities/escrow-transaction.entity';
import { LabResult } from '../entities/lab-result.entity';
import { License } from '../entities/license.entity';
import { Listing } from '../entities/listing.entity';
import { MineSite } from '../entities/mine-site.entity';
import { Miner } from '../entities/miner.entity';
import {
  MineralPassport,
  MineralPassportStatus,
} from '../entities/mineral-passport.entity';
import { Order } from '../entities/order.entity';
import { ProductionReport } from '../entities/production-report.entity';
import { Shipment } from '../entities/shipment.entity';
import { UserRole } from '../entities/user.entity';
import {
  CreateMineralPassportDto,
  MineralPassportFilterDto,
  UpdateMineralPassportStatusDto,
} from './mineral-passports.dto';

type Actor = {
  id: string;
  role: UserRole;
};

@Injectable()
export class MineralPassportsService {
  constructor(
    @InjectRepository(MineralPassport)
    private readonly passportRepository: Repository<MineralPassport>,
    @InjectRepository(Miner)
    private readonly minerRepository: Repository<Miner>,
    @InjectRepository(MineSite)
    private readonly siteRepository: Repository<MineSite>,
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    @InjectRepository(ProductionReport)
    private readonly productionReportRepository: Repository<ProductionReport>,
    @InjectRepository(LabResult)
    private readonly labResultRepository: Repository<LabResult>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(EscrowTransaction)
    private readonly escrowRepository: Repository<EscrowTransaction>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(actor: Actor, dto: CreateMineralPassportDto) {
    this.assertIssuer(actor);
    const source = await this.resolveSources(dto);
    const minerId = dto.minerId || source.miner?.id;
    if (!minerId) {
      throw new BadRequestException('A miner or linked miner-owned source record is required.');
    }
    const miner = await this.minerRepository.findOne({
      where: { id: minerId },
      relations: ['user'],
    });
    if (!miner) throw new NotFoundException('Miner not found');

    const token = this.generateToken();
    const passport = this.passportRepository.create({
      passportNumber: await this.generatePassportNumber(),
      publicVerificationToken: token,
      minerId: miner.id,
      siteId: dto.siteId || source.site?.id || null,
      licenseId: dto.licenseId || source.license?.id || null,
      productionReportId: dto.productionReportId || source.productionReport?.id || null,
      labResultId: dto.labResultId || source.labResult?.id || null,
      listingId: dto.listingId || source.listing?.id || null,
      orderId: dto.orderId || source.order?.id || null,
      shipmentId: dto.shipmentId || source.shipment?.id || null,
      contractId: dto.contractId || null,
      escrowTransactionId: dto.escrowTransactionId || source.escrow?.id || null,
      status: MineralPassportStatus.ACTIVE,
      qrCodeUrl: `/verify/passport/${token}`,
      issuedBy: actor.id,
      issuedAt: new Date(),
      snapshot: {
        ...dto.snapshot,
        miner: this.pick(miner, ['id', 'companyName', 'businessAddress', 'industry']),
        site: this.pick(source.site, ['id', 'name', 'licenseId', 'state', 'lga', 'community', 'siteStatus']),
        license: this.pick(source.license, ['id', 'licenseNumber', 'licenseType', 'status', 'issueDate', 'expiryDate']),
        productionReport: this.pick(source.productionReport, ['id', 'mineralType', 'quantity', 'unit', 'grade', 'status', 'periodStart', 'periodEnd']),
        labResult: this.pick(source.labResult, ['id', 'sampleReference', 'mineralType', 'grade', 'assayValue', 'assayUnit', 'certificateUrl', 'status']),
        listing: this.pick(source.listing, ['id', 'mineralType', 'quantity', 'price', 'gradePurity', 'status', 'listingType']),
        order: this.pick(source.order, ['id', 'quantity', 'totalAmount', 'status', 'paymentStatus']),
        shipment: this.pick(source.shipment, ['id', 'trackingId', 'status', 'currentMilestone', 'deliveredAt']),
        escrow: this.pick(source.escrow, ['id', 'grossAmount', 'status', 'fundedAt', 'releasedAt']),
      },
    });
    const saved = await this.passportRepository.save(passport);
    await this.patchLinkedPassportIds(saved);
    this.auditLogService.log({
      userId: actor.id,
      action: 'mineral_passport.create',
      resource: 'mineral_passport',
      resourceId: saved.id,
      metadata: { passportNumber: saved.passportNumber, status: saved.status },
    });
    return this.getOne(actor, saved.id);
  }

  async getAll(actor: Actor, filters: MineralPassportFilterDto) {
    const query = this.passportRepository
      .createQueryBuilder('passport')
      .leftJoinAndSelect('passport.miner', 'miner')
      .leftJoinAndSelect('miner.user', 'minerUser')
      .leftJoinAndSelect('passport.labResult', 'labResult')
      .leftJoinAndSelect('passport.listing', 'listing')
      .leftJoinAndSelect('passport.order', 'order')
      .leftJoinAndSelect('passport.shipment', 'shipment')
      .orderBy('passport.createdAt', 'DESC');

    if (!this.isAdminOrGovernment(actor)) {
      query.where('(miner.userId = :userId OR order.buyerId = :userId OR order.sellerId = :userId)', {
        userId: actor.id,
      });
    }
    if (filters.status) query.andWhere('passport.status = :status', { status: filters.status });
    if (filters.minerId) query.andWhere('passport.minerId = :minerId', { minerId: filters.minerId });
    if (filters.listingId) query.andWhere('passport.listingId = :listingId', { listingId: filters.listingId });
    if (filters.orderId) query.andWhere('passport.orderId = :orderId', { orderId: filters.orderId });

    const [data, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();
    return paginate(data, total, filters);
  }

  async getOne(actor: Actor, id: string) {
    const passport = await this.passportRepository.findOne({
      where: { id },
      relations: ['miner', 'miner.user', 'site', 'license', 'productionReport', 'labResult', 'listing', 'order', 'shipment', 'contract', 'escrowTransaction'],
    });
    if (!passport) throw new NotFoundException('Mineral passport not found');
    if (!this.canAccess(actor, passport)) {
      throw new ForbiddenException('You cannot access this mineral passport');
    }
    return passport;
  }

  async getPublic(token: string) {
    const passport = await this.passportRepository.findOne({
      where: { publicVerificationToken: token },
      relations: ['miner', 'site', 'license', 'productionReport', 'labResult', 'listing', 'shipment'],
    });
    if (!passport || passport.status !== MineralPassportStatus.ACTIVE) {
      throw new NotFoundException('Active mineral passport not found');
    }
    return {
      id: passport.id,
      passportNumber: passport.passportNumber,
      status: passport.status,
      issuedAt: passport.issuedAt,
      qrCodeUrl: passport.qrCodeUrl,
      snapshot: passport.snapshot,
      miner: this.pick(passport.miner, ['id', 'companyName', 'businessAddress', 'industry']),
      site: this.pick(passport.site, ['id', 'name', 'state', 'lga', 'community', 'siteStatus']),
      license: this.pick(passport.license, ['id', 'licenseNumber', 'licenseType', 'status', 'expiryDate']),
      labResult: this.pick(passport.labResult, ['id', 'sampleReference', 'mineralType', 'grade', 'assayValue', 'assayUnit', 'certificateUrl', 'status']),
      listing: this.pick(passport.listing, ['id', 'mineralType', 'quantity', 'gradePurity']),
      shipment: this.pick(passport.shipment, ['id', 'trackingId', 'status', 'currentMilestone']),
    };
  }

  async updateStatus(actor: Actor, id: string, dto: UpdateMineralPassportStatusDto) {
    this.assertIssuer(actor);
    const passport = await this.passportRepository.findOne({ where: { id } });
    if (!passport) throw new NotFoundException('Mineral passport not found');
    passport.status = dto.status;
    passport.snapshot = {
      ...(passport.snapshot || {}),
      statusHistory: [
        ...((passport.snapshot || {}).statusHistory || []),
        {
          status: dto.status,
          reason: dto.reason || null,
          changedBy: actor.id,
          changedAt: new Date().toISOString(),
        },
      ],
    };
    const saved = await this.passportRepository.save(passport);
    this.auditLogService.log({
      userId: actor.id,
      action: 'mineral_passport.status_update',
      resource: 'mineral_passport',
      resourceId: saved.id,
      metadata: { status: saved.status, reason: dto.reason },
    });
    return this.getOne(actor, saved.id);
  }

  private async resolveSources(dto: CreateMineralPassportDto) {
    const [site, license, productionReport, labResult, listing, order, shipment, escrow] = await Promise.all([
      dto.siteId ? this.siteRepository.findOne({ where: { id: dto.siteId } }) : null,
      dto.licenseId ? this.licenseRepository.findOne({ where: { id: dto.licenseId } }) : null,
      dto.productionReportId ? this.productionReportRepository.findOne({ where: { id: dto.productionReportId }, relations: ['miner'] }) : null,
      dto.labResultId ? this.labResultRepository.findOne({ where: { id: dto.labResultId }, relations: ['listing', 'productionReport'] }) : null,
      dto.listingId ? this.listingRepository.findOne({ where: { id: dto.listingId }, relations: ['miner'] }) : null,
      dto.orderId ? this.orderRepository.findOne({ where: { id: dto.orderId }, relations: ['listing', 'listing.miner'] }) : null,
      dto.shipmentId ? this.shipmentRepository.findOne({ where: { id: dto.shipmentId }, relations: ['order', 'order.listing', 'order.listing.miner'] }) : null,
      dto.escrowTransactionId ? this.escrowRepository.findOne({ where: { id: dto.escrowTransactionId } }) : null,
    ]);
    const inferredListing = listing || order?.listing || shipment?.order?.listing || labResult?.listing || null;
    const inferredProduction = productionReport || labResult?.productionReport || null;
    const miner = inferredListing?.miner || shipment?.order?.listing?.miner || inferredProduction?.miner || null;
    return {
      site,
      license,
      productionReport: inferredProduction,
      labResult,
      listing: inferredListing,
      order,
      shipment,
      escrow,
      miner,
    };
  }

  private async patchLinkedPassportIds(passport: MineralPassport) {
    if (passport.labResultId) {
      await this.labResultRepository.update(passport.labResultId, {
        mineralPassportId: passport.id,
      });
    }
    if (passport.shipmentId) {
      await this.shipmentRepository.update(passport.shipmentId, {
        mineralPassportId: passport.id,
      });
    }
  }

  private async generatePassportNumber() {
    const year = new Date().getFullYear();
    const count = await this.passportRepository.count();
    return `MH-PASS-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private generateToken() {
    return randomBytes(18).toString('hex');
  }

  private pick<T extends object>(record: T | null | undefined, keys: Array<keyof T>) {
    if (!record) return null;
    return keys.reduce<Record<string, unknown>>((acc, key) => {
      acc[String(key)] = record[key];
      return acc;
    }, {});
  }

  private canAccess(actor: Actor, passport: MineralPassport) {
    return (
      this.isAdminOrGovernment(actor) ||
      passport.miner?.userId === actor.id ||
      passport.order?.buyerId === actor.id ||
      passport.order?.sellerId === actor.id
    );
  }

  private assertIssuer(actor: Actor) {
    if (!this.isAdminOrGovernment(actor)) {
      throw new ForbiddenException('Only admins and regulators can issue mineral passports');
    }
  }

  private isAdminOrGovernment(actor: Actor) {
    return actor.role === UserRole.ADMIN || actor.role === UserRole.GOVERNMENT;
  }
}
