import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Document,
  LabResult,
  License,
  Listing,
  LogisticsProvider,
  MineSite,
  MineralPassport,
  Miner,
  Order,
  ProductionReport,
  Shipment,
  User,
} from '../entities';
import { LookupsController } from './lookups.controller';
import { LookupsService } from './lookups.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Miner,
      MineSite,
      License,
      Listing,
      Order,
      ProductionReport,
      LabResult,
      MineralPassport,
      LogisticsProvider,
      Shipment,
      Document,
    ]),
  ],
  controllers: [LookupsController],
  providers: [LookupsService],
})
export class LookupsModule {}
