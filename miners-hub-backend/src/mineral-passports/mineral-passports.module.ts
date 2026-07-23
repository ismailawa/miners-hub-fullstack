import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../common/audit-log/audit-log.module';
import { Contract } from '../entities/contract.entity';
import { EscrowTransaction } from '../entities/escrow-transaction.entity';
import { LabResult } from '../entities/lab-result.entity';
import { License } from '../entities/license.entity';
import { Listing } from '../entities/listing.entity';
import { MineSite } from '../entities/mine-site.entity';
import { Miner } from '../entities/miner.entity';
import { MineralPassport } from '../entities/mineral-passport.entity';
import { Order } from '../entities/order.entity';
import { ProductionReport } from '../entities/production-report.entity';
import { Shipment } from '../entities/shipment.entity';
import { MineralPassportsController } from './mineral-passports.controller';
import { MineralPassportsService } from './mineral-passports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MineralPassport,
      Miner,
      MineSite,
      License,
      ProductionReport,
      LabResult,
      Listing,
      Order,
      Shipment,
      Contract,
      EscrowTransaction,
    ]),
    AuditLogModule,
  ],
  controllers: [MineralPassportsController],
  providers: [MineralPassportsService],
  exports: [MineralPassportsService],
})
export class MineralPassportsModule {}
