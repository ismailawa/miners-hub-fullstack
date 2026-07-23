import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../common/audit-log/audit-log.module';
import { EnvironmentalRecord } from '../entities/environmental-record.entity';
import { MineSite } from '../entities/mine-site.entity';
import { EnvironmentalRecordsController } from './environmental-records.controller';
import { EnvironmentalRecordsService } from './environmental-records.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnvironmentalRecord, MineSite]),
    AuditLogModule,
  ],
  controllers: [EnvironmentalRecordsController],
  providers: [EnvironmentalRecordsService],
  exports: [EnvironmentalRecordsService],
})
export class EnvironmentalRecordsModule {}
