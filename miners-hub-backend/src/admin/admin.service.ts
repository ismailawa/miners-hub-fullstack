import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, VerificationStatus } from '../entities/user.entity';
import { Listing, ListingStatus } from '../entities/listing.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
  ) {}

  async getUsers(status?: VerificationStatus) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.miner', 'miner')
      .leftJoinAndSelect('user.investor', 'investor');
    
    if (status) {
      query.where('user.verificationStatus = :status', { status });
    }

    // Don't return admins to the list usually, but for now we return all miners/investors
    query.andWhere('user.role IN (:...roles)', { roles: ['miner', 'investor'] });
    query.orderBy('user.createdAt', 'DESC');

    return query.getMany();
  }

  async verifyUser(id: string, status: VerificationStatus) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.verificationStatus = status;
    return this.userRepository.save(user);
  }

  async getListings(status?: ListingStatus) {
    const query = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.miner', 'miner')
      .leftJoinAndSelect('miner.user', 'user');

    if (status) {
      query.where('listing.status = :status', { status });
    }

    query.orderBy('listing.createdAt', 'DESC');

    return query.getMany();
  }

  async updateListingStatus(id: string, status: ListingStatus) {
    const listing = await this.listingRepository.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    listing.status = status;
    return this.listingRepository.save(listing);
  }
}
