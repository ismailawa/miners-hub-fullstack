import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestorOpportunity, InvestorOpportunityInquiry, MineSite } from '../entities';
import { InvestorOpportunitiesController } from './investor-opportunities.controller';
import { InvestorOpportunitiesService } from './investor-opportunities.service';

@Module({
  imports: [TypeOrmModule.forFeature([InvestorOpportunity, InvestorOpportunityInquiry, MineSite])],
  controllers: [InvestorOpportunitiesController],
  providers: [InvestorOpportunitiesService],
})
export class InvestorOpportunitiesModule {}
