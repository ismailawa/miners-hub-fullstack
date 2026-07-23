import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from '../entities/contract.entity';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { UserRole, VerificationStatus } from '../entities/user.entity';
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

type ContractMetadata = Record<string, unknown> & {
  title?: string;
  value?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  signNowDocumentId?: string;
};

type SignNowSignature = {
  email?: string;
  created?: string | number;
};

type SignNowDocument = {
  signatures?: SignNowSignature[];
};

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
    private readonly signNowService: SignNowService,
    private readonly usersService: UsersService,
  ) {}

  async create(party1Id: string, dto: CreateContractDto): Promise<Contract> {
    const investor = await this.usersService.findById(party1Id);
    if (!investor || investor.role !== UserRole.INVESTOR) {
      throw new ForbiddenException(
        'Only investors can propose listing contracts.',
      );
    }
    if (
      investor.verificationStatus !== VerificationStatus.VERIFIED ||
      !investor.onboardingComplete
    ) {
      throw new ForbiddenException(
        'Complete onboarding and verification before proposing contracts.',
      );
    }

    const listing = await this.listingRepository.findOne({
      where: { id: dto.listingId },
      relations: ['miner', 'miner.user'],
    });
    if (!listing) {
      throw new NotFoundException('Listing not found.');
    }
    if (listing.status !== ListingStatus.PUBLISHED) {
      throw new BadRequestException(
        'Contracts can only be proposed for published listings.',
      );
    }

    const minerUserId = listing.miner?.userId;
    if (!minerUserId) {
      throw new BadRequestException(
        'Could not resolve the miner account for this listing.',
      );
    }

    if (dto.party2Id && dto.party2Id !== minerUserId) {
      throw new BadRequestException(
        'Counterparty must match the listing miner.',
      );
    }

    if (party1Id === minerUserId) {
      throw new BadRequestException('Cannot propose a contract with yourself.');
    }

    const contract = this.contractRepository.create({
      party1Id,
      party2Id: minerUserId,
      listingId: listing.id,
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

    await this.notificationsService.create(minerUserId, {
      title: 'Contract Proposal',
      message:
        'You have received a new contract proposal. Please review and respond.',
      notificationType: 'info',
    });

    void this.auditLogService.log({
      userId: party1Id,
      action: 'contract.create',
      resource: 'contract',
      resourceId: saved.id,
      metadata: { party2Id: minerUserId, listingId: listing.id },
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

    void this.auditLogService.log({
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

    void this.auditLogService.log({
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

    const metadata = this.getMetadata(contract);
    let documentId = metadata.signNowDocumentId;

    if (!documentId) {
      // Lazy generate the SignNow document
      const party1 = await this.usersService.findById(contract.party1Id);
      const party2 = await this.usersService.findById(contract.party2Id);

      if (!party1 || !party2) {
        throw new BadRequestException(
          'Could not resolve both parties for the contract.',
        );
      }

      this.signNowService.assertCanInviteSigners(party1.email, party2.email);

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
      const currentMetadata = this.getMetadata(contract);
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

    const documentId = this.getMetadata(contract).signNowDocumentId;
    if (!documentId) {
      return this.serializeContract(contract);
    }

    const document = (await this.signNowService.getDocument(
      documentId,
    )) as SignNowDocument;
    let updated = false;

    if (Array.isArray(document.signatures)) {
      for (const sig of document.signatures) {
        if (!sig.email || sig.created === undefined) {
          continue;
        }
        const signedAt = new Date(parseInt(String(sig.created), 10) * 1000);
        if (sig.email === contract.party1.email && !contract.party1SignedAt) {
          contract.party1SignedAt = signedAt;
          updated = true;
        }
        if (sig.email === contract.party2.email && !contract.party2SignedAt) {
          contract.party2SignedAt = signedAt;
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
    const metadata = this.getMetadata(contract);

    return {
      ...contract,
      title: metadata.title ?? 'Contract Proposal',
      value: metadata.value ?? null,
      startDate: metadata.startDate ?? null,
      endDate: metadata.endDate ?? null,
      party1SignatureData: contract.party1Signature,
      party2SignatureData: contract.party2Signature,
    } as Contract;
  }

  private getMetadata(contract: Contract): ContractMetadata {
    return (contract.metadata ?? {}) as ContractMetadata;
  }
}
