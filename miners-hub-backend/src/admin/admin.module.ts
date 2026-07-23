import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { Miner } from '../entities/miner.entity';
import { Listing } from '../entities/listing.entity';
import { Event } from '../entities/event.entity';
import { Order } from '../entities/order.entity';
import { Document } from '../entities/document.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { EscrowModule } from '../escrow/escrow.module';
import { AuditLogModule } from '../common/audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Miner, Listing, Event, Order, Document]),
    EscrowModule,
    AuditLogModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
