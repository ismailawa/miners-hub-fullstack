import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, VerificationStatus } from '../entities/user.entity';
import { Miner } from '../entities/miner.entity';
import { Investor } from '../entities/investor.entity';
import { Document, DocumentType } from '../entities/document.entity';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Miner)
    private minersRepository: Repository<Miner>,
    @InjectRepository(Investor)
    private investorsRepository: Repository<Investor>,
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private readonly documentsService: DocumentsService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['miner', 'investor', 'documents'],
    });
  }

  async findVerifiedMiners() {
    const miners = await this.minersRepository.find({
      where: {
        user: {
          role: UserRole.MINER,
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
      relations: ['user', 'listings'],
      order: { createdAt: 'DESC' },
      take: 12,
    });

    return miners.map((miner) => {
      const minerals = Array.from(
        new Set(
          (miner.listings || [])
            .map((listing) => listing.mineralType)
            .filter(Boolean),
        ),
      );
      const displayMinerals =
        minerals.length > 0
          ? minerals
          : [miner.industry, ...miner.certifications].filter(
              (value): value is string => Boolean(value),
            );

      return {
        id: miner.id,
        userId: miner.userId,
        name: miner.companyName || miner.user?.name || 'Verified Miner',
        location: miner.location || miner.businessAddress || 'Nigeria',
        minerals: displayMinerals.length > 0 ? displayMinerals : ['Minerals'],
        rating: 4.8,
        imageUrl:
          miner.user?.profileImageUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            miner.companyName || miner.user?.name || 'Miner',
          )}&background=d97706&color=fff`,
        contactEmail: miner.user?.email || '',
        history:
          miner.businessAddress ||
          miner.industry ||
          `${miner.companyName || 'This miner'} is a verified mining operator on Miners Hub.`,
        siteImages: [
          `https://picsum.photos/seed/${miner.id}-site-1/600/400`,
          `https://picsum.photos/seed/${miner.id}-site-2/600/400`,
          `https://picsum.photos/seed/${miner.id}-site-3/600/400`,
        ],
      };
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async updateProfile(userId: string, updateData: any): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['miner', 'investor'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 1. Update Core User Entity
    user.name = updateData.name || user.name;
    user.phoneNumber =
      updateData.phoneNumber !== undefined
        ? updateData.phoneNumber
        : user.phoneNumber;
    user.address =
      updateData.address !== undefined ? updateData.address : user.address;
    user.dateOfBirth =
      updateData.dateOfBirth !== undefined
        ? updateData.dateOfBirth
        : user.dateOfBirth;
    user.nationality =
      updateData.nationality !== undefined
        ? updateData.nationality
        : user.nationality;
    user.nin = updateData.nin !== undefined ? updateData.nin : user.nin;
    user.profileImageUrl =
      updateData.profileImageUrl !== undefined
        ? updateData.profileImageUrl
        : user.profileImageUrl;

    if (updateData.role) {
      user.role = updateData.role;
    }

    if (updateData.onboardingComplete !== undefined) {
      user.onboardingComplete = updateData.onboardingComplete;
    }
    if (updateData.onboardingStep !== undefined) {
      user.onboardingStep = Number(updateData.onboardingStep) || 0;
    }
    if (updateData.onboardingDraft !== undefined) {
      user.onboardingDraft = updateData.onboardingDraft;
    }

    await this.usersRepository.save(user);

    // 2. Update Role-specific Entities
    if (user.role === UserRole.MINER) {
      let miner = user.miner;
      if (!miner) {
        miner = this.minersRepository.create({ userId: user.id });
      }
      miner.companyName =
        updateData.businessName || miner.companyName || updateData.name;
      miner.companyRegNumber =
        updateData.companyRegNumber !== undefined
          ? updateData.companyRegNumber
          : miner.companyRegNumber;
      miner.businessAddress =
        updateData.businessAddress !== undefined
          ? updateData.businessAddress
          : miner.businessAddress;
      miner.businessWebsite =
        updateData.businessWebsite !== undefined
          ? updateData.businessWebsite
          : miner.businessWebsite;
      miner.industry =
        updateData.industry !== undefined
          ? updateData.industry
          : miner.industry;
      miner.yearsInOperation =
        updateData.yearsInOperation !== undefined
          ? updateData.yearsInOperation
          : miner.yearsInOperation;
      miner.cooperativeName =
        updateData.cooperativeName !== undefined
          ? updateData.cooperativeName
          : miner.cooperativeName;
      miner.cooperativeRegNumber =
        updateData.cooperativeRegNumber !== undefined
          ? updateData.cooperativeRegNumber
          : miner.cooperativeRegNumber;
      miner.partnerType =
        updateData.partnerType !== undefined
          ? updateData.partnerType
          : miner.partnerType;
      miner.partnerOrganization =
        updateData.partnerOrganization !== undefined
          ? updateData.partnerOrganization
          : miner.partnerOrganization;
      miner.miningEquipment =
        updateData.miningEquipment || miner.miningEquipment || [];
      miner.certifications =
        updateData.certifications || miner.certifications || [];
      miner.location = updateData.address || miner.location || 'Unknown';
      await this.minersRepository.save(miner);
    } else if (user.role === UserRole.INVESTOR) {
      let investor = user.investor;
      if (!investor) {
        investor = this.investorsRepository.create({ userId: user.id });
      }
      investor.companyName =
        updateData.businessName || investor.companyName || updateData.name;
      investor.companyRegNumber =
        updateData.companyRegNumber !== undefined
          ? updateData.companyRegNumber
          : investor.companyRegNumber;
      investor.businessAddress =
        updateData.businessAddress !== undefined
          ? updateData.businessAddress
          : investor.businessAddress;
      investor.businessWebsite =
        updateData.businessWebsite !== undefined
          ? updateData.businessWebsite
          : investor.businessWebsite;
      investor.industry =
        updateData.industry !== undefined
          ? updateData.industry
          : investor.industry;
      investor.yearsInOperation =
        updateData.yearsInOperation !== undefined
          ? updateData.yearsInOperation
          : investor.yearsInOperation;
      investor.investmentFocus =
        updateData.investmentPreferences || investor.investmentFocus || [];
      await this.investorsRepository.save(investor);
    }

    // 3. Handle Documents (Base64 uploads from onboarding)
    if (updateData.documents) {
      // updateData.documents is an object keyed by document type mapping to arrays of base64 documents
      for (const [key, files] of Object.entries(updateData.documents)) {
        const fileArray = files as any[];
        for (const file of fileArray) {
          await this.documentsService.uploadBase64(user.id, {
            type: DocumentType.KYC,
            name: file.name,
            url: file.url,
            metadata: { uploadCategory: key },
          });
        }
      }
    }

    // Return updated user with relations
    return this.findByIdWithRelations(userId) as Promise<User>;
  }
}
