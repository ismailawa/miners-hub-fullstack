import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { Miner } from '../entities/miner.entity';
import { Listing } from '../entities/listing.entity';
import { Event } from '../entities/event.entity';
import { Order } from '../entities/order.entity';
import { Document } from '../entities/document.entity';
import { Investor } from '../entities/investor.entity';
import { LaboratoryPartner } from '../entities/laboratory-partner.entity';
import { LogisticsProvider } from '../entities/logistics-provider.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { EscrowModule } from '../escrow/escrow.module';
import { AuditLogModule } from '../common/audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Miner,
      Listing,
      Event,
      Order,
      Document,
      Investor,
      LaboratoryPartner,
      LogisticsProvider,
    ]),
    EscrowModule,
    AuditLogModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
