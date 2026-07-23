import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MineralPriceOverride,
  MineralPriceOverrideStatus,
} from '../entities/mineral-price-override.entity';
import {
  CreateMineralPriceOverrideDto,
  UpdateMineralPriceOverrideDto,
} from './mineral-prices.dto';

@Injectable()
export class MineralPricesService {
  constructor(
    @InjectRepository(MineralPriceOverride)
    private readonly mineralPriceRepository: Repository<MineralPriceOverride>,
  ) {}

  findPublished() {
    return this.mineralPriceRepository.find({
      where: { status: MineralPriceOverrideStatus.PUBLISHED },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  findAll() {
    return this.mineralPriceRepository.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  create(dto: CreateMineralPriceOverrideDto) {
    const price = this.mineralPriceRepository.create({
      ...dto,
      symbol: dto.symbol.trim(),
      name: dto.name.trim(),
      source: dto.source?.trim() || 'Admin reference',
      change: dto.change ?? 0,
      displayOrder: dto.displayOrder ?? 100,
      status: dto.status ?? MineralPriceOverrideStatus.PUBLISHED,
      lastReportedAt: new Date(),
    });
    return this.mineralPriceRepository.save(price);
  }

  async update(id: string, dto: UpdateMineralPriceOverrideDto) {
    const price = await this.mineralPriceRepository.findOne({ where: { id } });
    if (!price) throw new NotFoundException('Mineral price not found.');

    Object.assign(price, {
      ...dto,
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.symbol !== undefined ? { symbol: dto.symbol.trim() } : {}),
      ...(dto.source !== undefined ? { source: dto.source?.trim() || 'Admin reference' } : {}),
      lastReportedAt:
        dto.price !== undefined || dto.change !== undefined
          ? new Date()
          : price.lastReportedAt,
    });

    return this.mineralPriceRepository.save(price);
  }

  async remove(id: string) {
    const price = await this.mineralPriceRepository.findOne({ where: { id } });
    if (!price) throw new NotFoundException('Mineral price not found.');
    await this.mineralPriceRepository.remove(price);
    return { success: true };
  }
}
