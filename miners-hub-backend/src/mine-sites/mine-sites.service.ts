import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MineSite } from '../entities/mine-site.entity';
import { Miner } from '../entities/miner.entity';
import { UserRole } from '../entities/user.entity';
import {
  CreateMineSiteDto,
  MineSiteFilterDto,
  UpdateMineSiteDto,
} from './mine-sites.dto';
import { paginate } from '../common/dto/pagination.dto';
import { AuditLogService } from '../common/audit-log/audit-log.service';

type Actor = {
  id: string;
  role: UserRole;
};

@Injectable()
export class MineSitesService {
  constructor(
    @InjectRepository(MineSite)
    private readonly mineSiteRepository: Repository<MineSite>,
    @InjectRepository(Miner)
    private readonly minerRepository: Repository<Miner>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(actor: Actor, filters: MineSiteFilterDto) {
    const query = this.mineSiteRepository
      .createQueryBuilder('site')
      .leftJoinAndSelect('site.operator', 'operator')
      .leftJoinAndSelect('operator.user', 'operatorUser')
      .orderBy('site.createdAt', 'DESC');

    if (actor.role === UserRole.MINER) {
      const miner = await this.getActorMiner(actor.id);
      query.where('site.operatorId = :operatorId', { operatorId: miner.id });
    }

    if (filters.operatorId) {
      query.andWhere('site.operatorId = :operatorIdFilter', {
        operatorIdFilter: filters.operatorId,
      });
    }

    if (filters.search) {
      query.andWhere(
        '(site.name ILIKE :search OR site.community ILIKE :search OR operator.companyName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.state) {
      query.andWhere('site.state ILIKE :state', {
        state: `%${filters.state}%`,
      });
    }

    if (filters.mineralType) {
      query.andWhere(':mineralType = ANY(site.mineralTypes)', {
        mineralType: filters.mineralType,
      });
    }

    if (filters.siteStatus) {
      query.andWhere('site.siteStatus = :siteStatus', {
        siteStatus: filters.siteStatus,
      });
    }

    if (filters.riskLevel) {
      query.andWhere('site.riskLevel = :riskLevel', {
        riskLevel: filters.riskLevel,
      });
    }

    const [data, total] = await query
      .skip(filters.offset)
      .take(filters.limit)
      .getManyAndCount();

    return paginate(
      data.map((site) => this.toResponse(site)),
      total,
      filters,
    );
  }

  async findOne(actor: Actor, id: string) {
    const site = await this.mineSiteRepository.findOne({
      where: { id },
      relations: ['operator', 'operator.user'],
    });

    if (!site) {
      throw new NotFoundException('Mine site not found');
    }

    await this.assertCanAccess(actor, site);
    return this.toResponse(site);
  }

  async create(actor: Actor, dto: CreateMineSiteDto) {
    const operator = await this.resolveOperator(actor, dto.operatorId);
    const site = this.mineSiteRepository.create({
      ...dto,
      operatorId: operator.id,
      licenseId: dto.licenseId || null,
      lga: dto.lga || null,
      community: dto.community || null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      boundaryPolygon: dto.boundaryPolygon || null,
      mineralTypes: dto.mineralTypes || [],
      documentIds: dto.documentIds || [],
      productionReportIds: dto.productionReportIds || [],
      complianceCaseIds: dto.complianceCaseIds || [],
      environmentalRecordIds: dto.environmentalRecordIds || [],
      metadata: dto.metadata || null,
    });

    const saved = await this.mineSiteRepository.save(site);
    this.auditLogService.log({
      userId: actor.id,
      action: 'mine_site.create',
      resource: 'mine_site',
      resourceId: saved.id,
      metadata: {
        operatorId: saved.operatorId,
        siteStatus: saved.siteStatus,
        riskLevel: saved.riskLevel,
      },
    });

    return this.findOne(actor, saved.id);
  }

  async update(actor: Actor, id: string, dto: UpdateMineSiteDto) {
    const site = await this.mineSiteRepository.findOne({
      where: { id },
      relations: ['operator', 'operator.user'],
    });

    if (!site) {
      throw new NotFoundException('Mine site not found');
    }

    await this.assertCanAccess(actor, site);

    if (dto.operatorId && dto.operatorId !== site.operatorId) {
      if (actor.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can reassign mine sites');
      }
      await this.resolveOperator(actor, dto.operatorId);
      site.operatorId = dto.operatorId;
    }

    Object.assign(site, {
      name: dto.name ?? site.name,
      licenseId: dto.licenseId !== undefined ? dto.licenseId : site.licenseId,
      mineralTypes: dto.mineralTypes ?? site.mineralTypes,
      state: dto.state ?? site.state,
      lga: dto.lga !== undefined ? dto.lga : site.lga,
      community: dto.community !== undefined ? dto.community : site.community,
      latitude: dto.latitude !== undefined ? dto.latitude : site.latitude,
      longitude: dto.longitude !== undefined ? dto.longitude : site.longitude,
      boundaryPolygon:
        dto.boundaryPolygon !== undefined
          ? dto.boundaryPolygon
          : site.boundaryPolygon,
      siteStatus: dto.siteStatus ?? site.siteStatus,
      riskLevel: dto.riskLevel ?? site.riskLevel,
      documentIds: dto.documentIds ?? site.documentIds,
      productionReportIds:
        dto.productionReportIds ?? site.productionReportIds,
      complianceCaseIds: dto.complianceCaseIds ?? site.complianceCaseIds,
      environmentalRecordIds:
        dto.environmentalRecordIds ?? site.environmentalRecordIds,
      metadata: dto.metadata !== undefined ? dto.metadata : site.metadata,
    });

    const saved = await this.mineSiteRepository.save(site);
    this.auditLogService.log({
      userId: actor.id,
      action: 'mine_site.update',
      resource: 'mine_site',
      resourceId: saved.id,
      metadata: { updatedFields: Object.keys(dto) },
    });

    return this.findOne(actor, saved.id);
  }

  async delete(actor: Actor, id: string) {
    const site = await this.mineSiteRepository.findOne({ where: { id } });

    if (!site) {
      throw new NotFoundException('Mine site not found');
    }

    await this.assertCanAccess(actor, site);
    await this.mineSiteRepository.remove(site);
    this.auditLogService.log({
      userId: actor.id,
      action: 'mine_site.delete',
      resource: 'mine_site',
      resourceId: id,
      metadata: { operatorId: site.operatorId },
    });
  }

  private async resolveOperator(actor: Actor, operatorId?: string) {
    if (actor.role === UserRole.MINER) {
      return this.getActorMiner(actor.id);
    }

    if (!operatorId) {
      throw new ForbiddenException('Admin-created mine sites require operatorId');
    }

    const operator = await this.minerRepository.findOne({
      where: { id: operatorId },
      relations: ['user'],
    });

    if (!operator) {
      throw new NotFoundException('Operator miner profile not found');
    }

    return operator;
  }

  private async getActorMiner(userId: string) {
    const miner = await this.minerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!miner) {
      throw new ForbiddenException('Miner profile not found');
    }

    return miner;
  }

  private async assertCanAccess(actor: Actor, site: MineSite) {
    if (actor.role === UserRole.ADMIN || actor.role === UserRole.GOVERNMENT) {
      return;
    }

    if (actor.role !== UserRole.MINER) {
      throw new ForbiddenException('Mine sites are available to admins and miners');
    }

    const miner = await this.getActorMiner(actor.id);
    if (site.operatorId !== miner.id) {
      throw new ForbiddenException('You can only access your own mine sites');
    }
  }

  private toResponse(site: MineSite) {
    return {
      id: site.id,
      name: site.name,
      operatorId: site.operatorId,
      operator: site.operator
        ? {
            id: site.operator.id,
            companyName: site.operator.companyName,
            location: site.operator.location,
            user: site.operator.user
              ? {
                  id: site.operator.user.id,
                  name: site.operator.user.name || null,
                  email: site.operator.user.email,
                  verificationStatus: site.operator.user.verificationStatus,
                }
              : null,
          }
        : null,
      licenseId: site.licenseId || null,
      mineralTypes: site.mineralTypes || [],
      state: site.state,
      lga: site.lga || null,
      community: site.community || null,
      latitude: site.latitude,
      longitude: site.longitude,
      boundaryPolygon: site.boundaryPolygon || null,
      siteStatus: site.siteStatus,
      riskLevel: site.riskLevel,
      documentIds: site.documentIds || [],
      productionReportIds: site.productionReportIds || [],
      complianceCaseIds: site.complianceCaseIds || [],
      environmentalRecordIds: site.environmentalRecordIds || [],
      metadata: site.metadata || null,
      links: {
        hasLicense: Boolean(site.licenseId),
        documentCount: site.documentIds?.length || 0,
        productionReportCount: site.productionReportIds?.length || 0,
        complianceCaseCount: site.complianceCaseIds?.length || 0,
        environmentalRecordCount: site.environmentalRecordIds?.length || 0,
      },
      postgis: {
        enabled: false,
        recommendation:
          'Enable PostGIS before boundary polygons, clustering, and proximity search move beyond MVP filters.',
      },
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    };
  }
}
