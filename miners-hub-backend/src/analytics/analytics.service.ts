import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  EscrowStatus,
  EscrowTransaction,
  Order,
  ProductionReport,
  ProductionReportStatus,
  UserRole,
} from '../entities';
import { RevenueAnalyticsFilterDto } from './revenue-analytics.dto';

interface Actor {
  id: string;
  role: UserRole;
}

type Totals = {
  orderCount: number;
  orderGross: number;
  escrowGross: number;
  commissionRevenue: number;
  sellerNetPayout: number;
  refundedAmount: number;
  royaltyDue: number;
  approvedRoyaltyDue: number;
  governmentRevenue: number;
};

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(ProductionReport)
    private readonly productionReportRepository: Repository<ProductionReport>,
  ) {}

  async revenue(actor: Actor, filters: RevenueAnalyticsFilterDto) {
    const range = this.resolveRange(filters);
    const orders = await this.getFilteredOrders(actor, filters, range);
    const productionReports = await this.getFilteredProductionReports(actor, filters, range);

    const totals = this.calculateTotals(orders, productionReports);

    return {
      filters: {
        period: filters.period || '90d',
        dateFrom: range.dateFrom.toISOString().slice(0, 10),
        dateTo: range.dateTo.toISOString().slice(0, 10),
        mineral: filters.mineral || null,
        lga: filters.lga || null,
        siteId: filters.siteId || null,
        status: filters.status || null,
      },
      totals,
      byMineral: this.groupByMineral(orders, productionReports),
      byStatus: this.groupByStatus(orders, productionReports),
      royaltyByLga: this.groupRoyaltyByLga(productionReports),
      monthlyTrend: this.groupMonthlyTrend(orders, productionReports),
      recentTransactions: orders.slice(0, 15).map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        mineralType: order.listing?.mineralType || 'Unknown',
        location: order.listing?.location || null,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: this.toNumber(order.totalAmount),
        commissionAmount: this.toNumber(order.escrowTransaction?.commissionAmount),
        escrowStatus: order.escrowTransaction?.status || null,
      })),
    };
  }

  async revenueCsv(actor: Actor, filters: RevenueAnalyticsFilterDto) {
    const report = await this.revenue(actor, filters);
    const lines = [
      ['Metric', 'Value'],
      ['Order Count', report.totals.orderCount],
      ['Order Gross', report.totals.orderGross],
      ['Escrow Gross', report.totals.escrowGross],
      ['Commission Revenue', report.totals.commissionRevenue],
      ['Seller Net Payout', report.totals.sellerNetPayout],
      ['Refunded Amount', report.totals.refundedAmount],
      ['Royalty Due', report.totals.royaltyDue],
      ['Approved Royalty Due', report.totals.approvedRoyaltyDue],
      ['Government Revenue', report.totals.governmentRevenue],
      [],
      ['Mineral', 'Orders', 'Order Gross', 'Commission', 'Royalty Due'],
      ...report.byMineral.map((row) => [
        row.mineral,
        row.orderCount,
        row.orderGross,
        row.commissionRevenue,
        row.royaltyDue,
      ]),
      [],
      ['LGA', 'Royalty Due', 'Approved Royalty Due', 'Reports'],
      ...report.royaltyByLga.map((row) => [
        row.lga,
        row.royaltyDue,
        row.approvedRoyaltyDue,
        row.reportCount,
      ]),
    ];

    return lines.map((line) => line.map((cell) => this.csvCell(cell)).join(',')).join('\n');
  }

  private async getFilteredOrders(
    actor: Actor,
    filters: RevenueAnalyticsFilterDto,
    range: { dateFrom: Date; dateTo: Date },
  ) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.listing', 'listing')
      .leftJoinAndSelect('order.escrowTransaction', 'escrow')
      .where('order.createdAt BETWEEN :dateFrom AND :dateTo', range)
      .orderBy('order.createdAt', 'DESC');

    if (filters.mineral) {
      query.andWhere('LOWER(listing.mineralType) = LOWER(:mineral)', {
        mineral: filters.mineral,
      });
    }

    if (filters.lga) {
      query.andWhere('listing.location ILIKE :lga', { lga: `%${filters.lga}%` });
    }

    if (filters.status) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('order.status = :status', { status: filters.status })
            .orWhere('order.paymentStatus = :status', { status: filters.status })
            .orWhere('escrow.status = :status', { status: filters.status });
        }),
      );
    }

    if (actor.role === UserRole.MINER) {
      query.andWhere('order.sellerId = :userId', { userId: actor.id });
    } else if (actor.role === UserRole.INVESTOR) {
      query.andWhere('order.buyerId = :userId', { userId: actor.id });
    }

    return query.getMany();
  }

  private async getFilteredProductionReports(
    actor: Actor,
    filters: RevenueAnalyticsFilterDto,
    range: { dateFrom: Date; dateTo: Date },
  ) {
    if (actor.role === UserRole.INVESTOR) return [];

    const query = this.productionReportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.site', 'site')
      .leftJoinAndSelect('report.miner', 'miner')
      .where('report.periodEnd BETWEEN :dateFrom AND :dateTo', {
        dateFrom: range.dateFrom.toISOString().slice(0, 10),
        dateTo: range.dateTo.toISOString().slice(0, 10),
      })
      .orderBy('report.periodEnd', 'DESC');

    if (filters.mineral) {
      query.andWhere('LOWER(report.mineralType) = LOWER(:mineral)', {
        mineral: filters.mineral,
      });
    }

    if (filters.siteId) {
      query.andWhere('report.siteId = :siteId', { siteId: filters.siteId });
    }

    if (filters.lga) {
      query.andWhere('site.lga ILIKE :lga', { lga: `%${filters.lga}%` });
    }

    if (filters.status) {
      query.andWhere('report.status = :status', { status: filters.status });
    }

    if (actor.role === UserRole.MINER) {
      query.andWhere('miner.userId = :userId', { userId: actor.id });
    }

    return query.getMany();
  }

  private calculateTotals(orders: Order[], reports: ProductionReport[]): Totals {
    const totals = orders.reduce<Totals>(
      (acc, order) => {
        const escrow = order.escrowTransaction;
        acc.orderCount += 1;
        acc.orderGross += this.toNumber(order.totalAmount);
        acc.escrowGross += this.toNumber(escrow?.grossAmount);
        acc.commissionRevenue += this.toNumber(escrow?.commissionAmount);
        acc.sellerNetPayout += this.toNumber(escrow?.sellerNetAmount);
        if (escrow?.status === EscrowStatus.REFUNDED || order.paymentStatus === 'refunded') {
          acc.refundedAmount += this.toNumber(escrow?.grossAmount || order.totalAmount);
        }
        return acc;
      },
      {
        orderCount: 0,
        orderGross: 0,
        escrowGross: 0,
        commissionRevenue: 0,
        sellerNetPayout: 0,
        refundedAmount: 0,
        royaltyDue: 0,
        approvedRoyaltyDue: 0,
        governmentRevenue: 0,
      },
    );

    reports.forEach((report) => {
      const royalty = this.toNumber(report.royaltyDue);
      totals.royaltyDue += royalty;
      if (report.status === ProductionReportStatus.APPROVED) {
        totals.approvedRoyaltyDue += royalty;
      }
    });

    totals.governmentRevenue = this.round(totals.commissionRevenue + totals.approvedRoyaltyDue);
    return this.roundTotals(totals);
  }

  private groupByMineral(orders: Order[], reports: ProductionReport[]) {
    const groups = new Map<
      string,
      { mineral: string; orderCount: number; orderGross: number; commissionRevenue: number; royaltyDue: number }
    >();

    orders.forEach((order) => {
      const mineral = order.listing?.mineralType || 'Unknown';
      const row = this.ensureMineral(groups, mineral);
      row.orderCount += 1;
      row.orderGross += this.toNumber(order.totalAmount);
      row.commissionRevenue += this.toNumber(order.escrowTransaction?.commissionAmount);
    });

    reports.forEach((report) => {
      const row = this.ensureMineral(groups, report.mineralType || 'Unknown');
      row.royaltyDue += this.toNumber(report.royaltyDue);
    });

    return Array.from(groups.values()).map((row) => ({
      ...row,
      orderGross: this.round(row.orderGross),
      commissionRevenue: this.round(row.commissionRevenue),
      royaltyDue: this.round(row.royaltyDue),
    }));
  }

  private groupByStatus(orders: Order[], reports: ProductionReport[]) {
    const groups = new Map<string, { status: string; count: number; amount: number }>();

    orders.forEach((order) => {
      const row = this.ensureStatus(groups, order.escrowTransaction?.status || order.status);
      row.count += 1;
      row.amount += this.toNumber(order.totalAmount);
    });

    reports.forEach((report) => {
      const row = this.ensureStatus(groups, `royalty_${report.status}`);
      row.count += 1;
      row.amount += this.toNumber(report.royaltyDue);
    });

    return Array.from(groups.values()).map((row) => ({ ...row, amount: this.round(row.amount) }));
  }

  private groupRoyaltyByLga(reports: ProductionReport[]) {
    const groups = new Map<
      string,
      { lga: string; reportCount: number; royaltyDue: number; approvedRoyaltyDue: number }
    >();

    reports.forEach((report) => {
      const lga = report.site?.lga || 'Unspecified';
      const row = groups.get(lga) || {
        lga,
        reportCount: 0,
        royaltyDue: 0,
        approvedRoyaltyDue: 0,
      };
      const royalty = this.toNumber(report.royaltyDue);
      row.reportCount += 1;
      row.royaltyDue += royalty;
      if (report.status === ProductionReportStatus.APPROVED) row.approvedRoyaltyDue += royalty;
      groups.set(lga, row);
    });

    return Array.from(groups.values()).map((row) => ({
      ...row,
      royaltyDue: this.round(row.royaltyDue),
      approvedRoyaltyDue: this.round(row.approvedRoyaltyDue),
    }));
  }

  private groupMonthlyTrend(orders: Order[], reports: ProductionReport[]) {
    const groups = new Map<
      string,
      { month: string; orderGross: number; commissionRevenue: number; royaltyDue: number; governmentRevenue: number }
    >();

    orders.forEach((order) => {
      const row = this.ensureMonth(groups, order.createdAt);
      row.orderGross += this.toNumber(order.totalAmount);
      row.commissionRevenue += this.toNumber(order.escrowTransaction?.commissionAmount);
    });

    reports.forEach((report) => {
      const row = this.ensureMonth(groups, new Date(report.periodEnd));
      const royalty = this.toNumber(report.royaltyDue);
      row.royaltyDue += royalty;
      if (report.status === ProductionReportStatus.APPROVED) {
        row.governmentRevenue += royalty;
      }
    });

    return Array.from(groups.values())
      .map((row) => ({
        ...row,
        orderGross: this.round(row.orderGross),
        commissionRevenue: this.round(row.commissionRevenue),
        royaltyDue: this.round(row.royaltyDue),
        governmentRevenue: this.round(row.governmentRevenue + row.commissionRevenue),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private resolveRange(filters: RevenueAnalyticsFilterDto) {
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
    dateTo.setHours(23, 59, 59, 999);
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(dateTo);

    if (!filters.dateFrom) {
      if (filters.period === '30d') dateFrom.setDate(dateTo.getDate() - 30);
      else if (filters.period === '12m') dateFrom.setMonth(dateTo.getMonth() - 12);
      else if (filters.period === 'ytd') {
        dateFrom.setMonth(0, 1);
        dateFrom.setHours(0, 0, 0, 0);
      } else {
        dateFrom.setDate(dateTo.getDate() - 90);
      }
    }

    dateFrom.setHours(0, 0, 0, 0);
    return { dateFrom, dateTo };
  }

  private ensureMineral(
    groups: Map<string, { mineral: string; orderCount: number; orderGross: number; commissionRevenue: number; royaltyDue: number }>,
    mineral: string,
  ) {
    const current = groups.get(mineral) || {
      mineral,
      orderCount: 0,
      orderGross: 0,
      commissionRevenue: 0,
      royaltyDue: 0,
    };
    groups.set(mineral, current);
    return current;
  }

  private ensureStatus(groups: Map<string, { status: string; count: number; amount: number }>, status: string) {
    const current = groups.get(status) || { status, count: 0, amount: 0 };
    groups.set(status, current);
    return current;
  }

  private ensureMonth(
    groups: Map<string, { month: string; orderGross: number; commissionRevenue: number; royaltyDue: number; governmentRevenue: number }>,
    date: Date,
  ) {
    const month = date.toISOString().slice(0, 7);
    const current = groups.get(month) || {
      month,
      orderGross: 0,
      commissionRevenue: 0,
      royaltyDue: 0,
      governmentRevenue: 0,
    };
    groups.set(month, current);
    return current;
  }

  private roundTotals(totals: Totals): Totals {
    return Object.fromEntries(
      Object.entries(totals).map(([key, value]) => [key, this.round(value)]),
    ) as Totals;
  }

  private toNumber(value: unknown) {
    return Number(value || 0);
  }

  private round(value: number) {
    return Number(value.toFixed(2));
  }

  private csvCell(value: unknown) {
    if (value === undefined || value === null) return '';
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }
}
