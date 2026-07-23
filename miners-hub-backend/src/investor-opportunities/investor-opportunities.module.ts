import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AmlKybRiskProfile,
  EsgObligation,
  ExportReadinessChecklist,
  InvestorOpportunity,
  InvestorOpportunityInquiry,
  LabResult,
  License,
  MineSite,
  ProductionReport,
  Shipment,
} from '../entities';
import { InvestorOpportunitiesController } from './investor-opportunities.controller';
import { InvestorOpportunitiesService } from './investor-opportunities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvestorOpportunity,
      InvestorOpportunityInquiry,
      MineSite,
      EsgObligation,
      AmlKybRiskProfile,
      ExportReadinessChecklist,
      LabResult,
      License,
      ProductionReport,
      Shipment,
    ]),
  ],
  controllers: [InvestorOpportunitiesController],
  providers: [InvestorOpportunitiesService],
})
export class InvestorOpportunitiesModule {}
