import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MineSite } from '../entities/mine-site.entity';
import { Miner } from '../entities/miner.entity';
import { ProductionReport } from '../entities/production-report.entity';
import { ProductionReportsController } from './production-reports.controller';
import { ProductionReportsService } from './production-reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionReport, MineSite, Miner])],
  controllers: [ProductionReportsController],
  providers: [ProductionReportsService],
  exports: [ProductionReportsService],
})
export class ProductionReportsModule {}
