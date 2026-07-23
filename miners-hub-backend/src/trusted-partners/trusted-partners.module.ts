import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrustedPartner } from '../entities/trusted-partner.entity';
import { TrustedPartnersController } from './trusted-partners.controller';
import { TrustedPartnersService } from './trusted-partners.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrustedPartner])],
  controllers: [TrustedPartnersController],
  providers: [TrustedPartnersService],
  exports: [TrustedPartnersService],
})
export class TrustedPartnersModule {}
