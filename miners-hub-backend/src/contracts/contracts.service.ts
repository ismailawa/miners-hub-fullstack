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
import { SignNowService } from '../common/signnow/signnow.service';
import { UsersService } from '../users/users.service';
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
    private readonly signNowService: SignNowService,
    private readonly usersService: UsersService,
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
      metadata: {
        title: dto.title ?? 'Contract Proposal',
        value: dto.value ?? null,
        startDate: dto.startDate ?? null,
        endDate: dto.endDate ?? null,
      },
      status: ContractStatus.PROPOSED,
    });

    const saved = await this.contractRepository.save(contract);

    await this.notificationsService.create(dto.party2Id, {
      title: 'Contract Proposal',
      message:
        'You have received a new contract proposal. Please review and respond.',
      notificationType: 'info',
    });

    this.auditLogService.log({
      userId: party1Id,
      action: 'contract.create',
      resource: 'contract',
      resourceId: saved.id,
      metadata: { party2Id: dto.party2Id, listingId: dto.listingId },
    });

    return this.serializeContract(saved);
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
      .where('contract.party1Id = :userId OR contract.party2Id = :userId', {
        userId,
      })
      .orderBy('contract.createdAt', 'DESC');

    if (status) {
      qb.andWhere('contract.status = :status', { status });
    }

    const [data, total] = await qb
      .skip(pagination.offset)
      .take(pagination.limit)
      .getManyAndCount();

    return paginate(
      data.map((contract) => this.serializeContract(contract)),
      total,
      pagination,
    );
  }

  async findOne(id: string, userId: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['party1', 'party2', 'listing'],
    });
    if (!contract) throw new NotFoundException('Contract not found.');
    if (contract.party1Id !== userId && contract.party2Id !== userId) {
      throw new ForbiddenException(
        'Access denied — you are not a party to this contract.',
      );
    }
    return this.serializeContract(contract);
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
    const previousStatus = contract.status;
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
      metadata: { from: previousStatus, to: dto.status },
    });

    return this.serializeContract(saved);
  }

  async sign(
    id: string,
    userId: string,
    dto: SignContractDto,
  ): Promise<Contract> {
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
      metadata: {
        party: isParty1 ? 'party1' : 'party2',
        newStatus: contract.status,
      },
    });

    return this.serializeContract(saved);
  }

  async getSigningLink(
    id: string,
    userId: string,
    redirectUri?: string,
  ): Promise<string> {
    const contract = await this.findOne(id, userId);

    if (
      contract.status !== ContractStatus.UNDER_REVIEW &&
      contract.status !== ContractStatus.PROPOSED
    ) {
      throw new BadRequestException(
        `Contract must be in 'proposed' or 'under_review' status to sign. Current: ${contract.status}`,
      );
    }

    let documentId = contract.metadata?.signNowDocumentId;

    if (!documentId) {
      // Lazy generate the SignNow document
      const party1 = await this.usersService.findById(contract.party1Id);
      const party2 = await this.usersService.findById(contract.party2Id);

      if (!party1 || !party2) {
        throw new BadRequestException(
          'Could not resolve both parties for the contract.',
        );
      }

      // 1. Generate PDF
      const pdfBuffer = await this.signNowService.generateContractPdf(
        contract.terms,
      );

      // 2. Upload Document
      documentId = await this.signNowService.uploadDocument(
        pdfBuffer,
        `Contract-${contract.id}.pdf`,
      );

      // 3. Add fields
      await this.signNowService.addSignatureFields(documentId);

      // 4. Create embedded invites
      await this.signNowService.createEmbeddedInvites(
        documentId,
        party1.email,
        party2.email,
      );

      // 5. Update contract metadata
      const currentMetadata = contract.metadata || {};
      contract.metadata = { ...currentMetadata, signNowDocumentId: documentId };

      if (contract.status === ContractStatus.PROPOSED) {
        contract.status = ContractStatus.UNDER_REVIEW;
      }

      await this.contractRepository.save(contract);
    }

    // Determine whose email to use for the link
    const userToSign = await this.usersService.findById(userId);
    if (!userToSign) {
      throw new NotFoundException('User not found.');
    }

    // 6. Get the embedded signing link
    return this.signNowService.getSigningLink(
      documentId,
      userToSign.email,
      redirectUri,
    );
  }

  async syncWithSignNow(id: string, userId: string): Promise<Contract> {
    const contract = await this.findOne(id, userId);

    if (
      contract.status !== ContractStatus.UNDER_REVIEW &&
      contract.status !== ContractStatus.PROPOSED
    ) {
      return this.serializeContract(contract);
    }

    const documentId = contract.metadata?.signNowDocumentId;
    if (!documentId) {
      return this.serializeContract(contract);
    }

    const document = await this.signNowService.getDocument(documentId);
    let updated = false;

    if (document.signatures && Array.isArray(document.signatures)) {
      for (const sig of document.signatures) {
        if (sig.email === contract.party1.email && !contract.party1SignedAt) {
          contract.party1SignedAt = new Date(parseInt(sig.created) * 1000);
          updated = true;
        }
        if (sig.email === contract.party2.email && !contract.party2SignedAt) {
          contract.party2SignedAt = new Date(parseInt(sig.created) * 1000);
          updated = true;
        }
      }
    }

    if (updated) {
      if (contract.party1SignedAt && contract.party2SignedAt) {
        contract.status = ContractStatus.SIGNED;
      }
      await this.contractRepository.save(contract);
    }

    return this.serializeContract(contract);
  }

  private serializeContract(contract: Contract): Contract {
    return {
      ...contract,
      title: contract.metadata?.title ?? 'Contract Proposal',
      value: contract.metadata?.value ?? null,
      startDate: contract.metadata?.startDate ?? null,
      endDate: contract.metadata?.endDate ?? null,
      party1SignatureData: contract.party1Signature,
      party2SignatureData: contract.party2Signature,
    } as Contract;
  }
}
