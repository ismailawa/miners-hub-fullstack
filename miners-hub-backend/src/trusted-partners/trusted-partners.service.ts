import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TrustedPartner,
  TrustedPartnerStatus,
} from '../entities/trusted-partner.entity';
import {
  CreateTrustedPartnerDto,
  UpdateTrustedPartnerDto,
} from './trusted-partners.dto';

@Injectable()
export class TrustedPartnersService {
  constructor(
    @InjectRepository(TrustedPartner)
    private readonly trustedPartnerRepository: Repository<TrustedPartner>,
  ) {}

  findPublished() {
    return this.trustedPartnerRepository.find({
      where: { status: TrustedPartnerStatus.PUBLISHED },
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.trustedPartnerRepository.find({
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  create(dto: CreateTrustedPartnerDto) {
    const partner = this.trustedPartnerRepository.create({
      ...dto,
      websiteUrl: dto.websiteUrl || null,
      category: dto.category || null,
      displayOrder: dto.displayOrder ?? 0,
      status: dto.status || TrustedPartnerStatus.PUBLISHED,
    });
    return this.trustedPartnerRepository.save(partner);
  }

  async update(id: string, dto: UpdateTrustedPartnerDto) {
    const partner = await this.trustedPartnerRepository.findOne({
      where: { id },
    });
    if (!partner) throw new NotFoundException('Trusted partner not found');

    Object.assign(partner, {
      ...dto,
      websiteUrl:
        dto.websiteUrl !== undefined ? dto.websiteUrl || null : partner.websiteUrl,
      category: dto.category !== undefined ? dto.category || null : partner.category,
    });
    return this.trustedPartnerRepository.save(partner);
  }

  async remove(id: string) {
    const partner = await this.trustedPartnerRepository.findOne({
      where: { id },
    });
    if (!partner) throw new NotFoundException('Trusted partner not found');
    await this.trustedPartnerRepository.remove(partner);
    return { success: true };
  }
}
