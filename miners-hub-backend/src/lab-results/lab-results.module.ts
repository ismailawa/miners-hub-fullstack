import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../common/audit-log/audit-log.module';
import { LabResult } from '../entities/lab-result.entity';
import { LaboratoryPartner } from '../entities/laboratory-partner.entity';
import { Listing } from '../entities/listing.entity';
import { ProductionReport } from '../entities/production-report.entity';
import { LabResultsController } from './lab-results.controller';
import { LabResultsService } from './lab-results.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LaboratoryPartner,
      LabResult,
      Listing,
      ProductionReport,
    ]),
    AuditLogModule,
  ],
  controllers: [LabResultsController],
  providers: [LabResultsService],
  exports: [LabResultsService],
})
export class LabResultsModule {}
