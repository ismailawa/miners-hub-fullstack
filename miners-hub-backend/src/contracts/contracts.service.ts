import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from '../entities/contract.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import {
  CreateContractDto,
  UpdateContractStatusDto,
  SignContractDto,
} from './contracts.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(party1Id: string, dto: CreateContractDto): Promise<Contract> {
    if (party1Id === dto.party2Id) {
      throw new BadRequestException('Cannot propose a contract with yourself.');
    }

    const contract = this.contractRepository.create({
      party1Id,
      party2Id: dto.party2Id,
      listingId: dto.listingId ?? null,
      terms: dto.terms,
      status: ContractStatus.PROPOSED,
    });

    const saved = await this.contractRepository.save(contract);

    await this.notificationsService.create(dto.party2Id, {
      title: 'Contract Proposal',
      message: 'You have received a new contract proposal. Please review and respond.',
      notificationType: 'info',
    });

    this.auditLogService.log({
      userId: party1Id,
      action: 'contract.create',
      resource: 'contract',
      resourceId: saved.id,
      metadata: { party2Id: dto.party2Id, listingId: dto.listingId },
    });

    return saved;
  }

  async findAll(
    userId: string,
    status?: ContractStatus,
    pagination: PaginationDto = new PaginationDto(),
  ) {
    const qb = this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.party1', 'party1')
      .leftJoinAndSelect('contract.party2', 'party2')
      .leftJoinAndSelect('contract.listing', 'listing')
      .where('contract.party1Id = :userId OR contract.party2Id = :userId', { userId })
      .orderBy('contract.createdAt', 'DESC');

    if (status) {
      qb.andWhere('contract.status = :status', { status });
    }

    const [data, total] = await qb
      .skip(pagination.offset)
      .take(pagination.limit)
      .getManyAndCount();

    return paginate(data, total, pagination);
  }

  async findOne(id: string, userId: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['party1', 'party2', 'listing'],
    });
    if (!contract) throw new NotFoundException('Contract not found.');
    if (contract.party1Id !== userId && contract.party2Id !== userId) {
      throw new ForbiddenException('Access denied — you are not a party to this contract.');
    }
    return contract;
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateContractStatusDto,
  ): Promise<Contract> {
    const contract = await this.findOne(id, userId);

    const allowedFromProposed = [
      ContractStatus.UNDER_REVIEW,
      ContractStatus.TERMINATED,
    ];
    const allowedFromUnderReview = [
      ContractStatus.SIGNED,
      ContractStatus.TERMINATED,
    ];

    const allowed =
      contract.status === ContractStatus.PROPOSED
        ? allowedFromProposed
        : contract.status === ContractStatus.UNDER_REVIEW
          ? allowedFromUnderReview
          : contract.status === ContractStatus.SIGNED
            ? [ContractStatus.EXECUTED]
            : [];

    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition contract from '${contract.status}' to '${dto.status}'.`,
      );
    }

    contract.status = dto.status;
    const saved = await this.contractRepository.save(contract);

    const notifyId =
      contract.party1Id === userId ? contract.party2Id : contract.party1Id;

    await this.notificationsService.create(notifyId, {
      title: 'Contract Updated',
      message: `Contract status changed to: ${dto.status}.`,
      notificationType: 'info',
    });

    this.auditLogService.log({
      userId,
      action: 'contract.status_update',
      resource: 'contract',
      resourceId: id,
      metadata: { from: contract.status, to: dto.status },
    });

    return saved;
  }

  async sign(id: string, userId: string, dto: SignContractDto): Promise<Contract> {
    const contract = await this.findOne(id, userId);

    if (
      contract.status !== ContractStatus.UNDER_REVIEW &&
      contract.status !== ContractStatus.PROPOSED
    ) {
      throw new BadRequestException(
        `Contract must be in 'proposed' or 'under_review' status to sign. Current: ${contract.status}`,
      );
    }

    const now = new Date();
    const isParty1 = contract.party1Id === userId;

    if (isParty1) {
      if (contract.party1SignedAt) {
        throw new BadRequestException('You have already signed this contract.');
      }
      contract.party1Signature = dto.signature;
      contract.party1SignedAt = now;
    } else {
      if (contract.party2SignedAt) {
        throw new BadRequestException('You have already signed this contract.');
      }
      contract.party2Signature = dto.signature;
      contract.party2SignedAt = now;
    }

    // If both parties have signed, move to SIGNED status
    if (contract.party1SignedAt && contract.party2SignedAt) {
      contract.status = ContractStatus.SIGNED;
    } else {
      contract.status = ContractStatus.UNDER_REVIEW;
    }

    const saved = await this.contractRepository.save(contract);

    const notifyId = isParty1 ? contract.party2Id : contract.party1Id;
    const statusMsg =
      contract.status === ContractStatus.SIGNED
        ? 'Both parties have signed. The contract is now effective.'
        : 'One party has signed the contract. Awaiting your signature.';

    await this.notificationsService.create(notifyId, {
      title: 'Contract Signed',
      message: statusMsg,
      notificationType: 'info',
    });

    this.auditLogService.log({
      userId,
      action: 'contract.signed',
      resource: 'contract',
      resourceId: id,
      metadata: { party: isParty1 ? 'party1' : 'party2', newStatus: contract.status },
    });

    return saved;
  }
}
