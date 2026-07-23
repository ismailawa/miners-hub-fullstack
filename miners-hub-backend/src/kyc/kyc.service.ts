import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosRequestConfig } from 'axios';
import { Repository } from 'typeorm';
import { User, VerificationStatus } from '../entities/user.entity';
import { MetaMapCompleteDto, MetaMapStartDto } from './kyc.dto';

type NormalizedMetaMapStatus = 'verified' | 'rejected' | 'pending';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async startMetaMap(userId: string, dto: MetaMapStartDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    user.metamapIdentityId = dto.identityId || user.metamapIdentityId || null;
    user.metamapVerificationId =
      dto.verificationId || user.metamapVerificationId || null;
    user.metamapLastPayload = dto.payload || user.metamapLastPayload || null;
    user.kycSubmittedAt = user.kycSubmittedAt || new Date();
    user.verificationStatus = VerificationStatus.PENDING;
    user.kycRejectedAt = null;

    return this.saveAndSerialize(user);
  }

  async completeMetaMap(userId: string, dto: MetaMapCompleteDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    user.metamapIdentityId = dto.identityId || user.metamapIdentityId || null;
    user.metamapVerificationId =
      dto.verificationId || user.metamapVerificationId || null;
    user.metamapLastPayload = dto.payload || user.metamapLastPayload || null;
    user.kycSubmittedAt = user.kycSubmittedAt || new Date();

    const verificationPayload = await this.fetchMetaMapVerification(user);
    if (verificationPayload) {
      user.metamapLastPayload = verificationPayload;
    }

    const normalizedStatus = verificationPayload
      ? this.normalizeMetaMapStatus(verificationPayload)
      : 'pending';
    this.applyVerificationStatus(user, normalizedStatus);

    return this.saveAndSerialize(user);
  }

  async getStatus(userId: string) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    return this.serialize(user);
  }

  private async fetchMetaMapVerification(
    user: User,
  ): Promise<Record<string, any> | null> {
    const apiBaseUrl =
      this.configService.get<string>('METAMAP_API_BASE_URL') ||
      'https://api.getmati.com';
    const clientId = this.configService.get<string>('METAMAP_CLIENT_ID');
    const clientSecret =
      this.configService.get<string>('METAMAP_CLIENT_SECRET');
    const verificationId = user.metamapVerificationId;

    if (!apiBaseUrl || !clientId || !clientSecret || !verificationId) {
      return null;
    }

    const requestConfig: AxiosRequestConfig = {
      auth: {
        username: clientId,
        password: clientSecret,
      },
      timeout: 10000,
    };

    const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, '');
    const candidateUrls = [
      `${normalizedBaseUrl}/v2/verifications/${verificationId}`,
      `${normalizedBaseUrl}/v1/verifications/${verificationId}`,
    ];

    for (const url of candidateUrls) {
      try {
        const response = await axios.get<Record<string, any>>(
          url,
          requestConfig,
        );
        return response.data;
      } catch (error) {
        this.logger.warn(
          `MetaMap verification lookup failed for ${url}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    return null;
  }

  private normalizeMetaMapStatus(
    payload?: Record<string, any> | null,
  ): NormalizedMetaMapStatus {
    const rawStatus = String(
      payload?.status ||
        payload?.verificationStatus ||
        payload?.identity?.status ||
        payload?.resource?.status ||
        '',
    ).toLowerCase();

    if (
      ['verified', 'approved', 'completed', 'success', 'valid'].includes(
        rawStatus,
      )
    ) {
      return 'verified';
    }

    if (
      ['rejected', 'declined', 'failed', 'invalid', 'expired'].includes(
        rawStatus,
      )
    ) {
      return 'rejected';
    }

    return 'pending';
  }

  private applyVerificationStatus(
    user: User,
    status: NormalizedMetaMapStatus,
  ) {
    const now = new Date();

    if (status === 'verified') {
      user.verificationStatus = VerificationStatus.VERIFIED;
      user.kycVerifiedAt = user.kycVerifiedAt || now;
      user.kycRejectedAt = null;
      user.onboardingComplete = true;
      return;
    }

    if (status === 'rejected') {
      user.verificationStatus = VerificationStatus.REJECTED;
      user.kycRejectedAt = now;
      user.kycVerifiedAt = null;
      user.onboardingComplete = false;
      return;
    }

    user.verificationStatus = VerificationStatus.PENDING;
    user.onboardingComplete = false;
  }

  private async saveAndSerialize(user: User) {
    const saved = await this.usersRepository.save(user);
    return this.serialize(saved);
  }

  private serialize(user: User) {
    return {
      status: user.verificationStatus,
      verificationStatus: user.verificationStatus,
      onboardingComplete: user.onboardingComplete,
      metamapIdentityId: user.metamapIdentityId,
      metamapVerificationId: user.metamapVerificationId,
      kycSubmittedAt: user.kycSubmittedAt,
      kycVerifiedAt: user.kycVerifiedAt,
      kycRejectedAt: user.kycRejectedAt,
    };
  }
}
