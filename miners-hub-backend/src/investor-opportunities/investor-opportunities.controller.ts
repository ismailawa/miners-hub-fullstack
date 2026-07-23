import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateInvestorOpportunityDto,
  CreateInvestorOpportunityInquiryDto,
  InvestorOpportunityFilterDto,
  UpdateInvestorOpportunityDto,
  UpdateInvestorOpportunityInquiryDto,
} from './investor-opportunities.dto';
import { InvestorOpportunitiesService } from './investor-opportunities.service';

@Controller('investor-opportunities')
export class InvestorOpportunitiesController {
  constructor(private readonly investorOpportunitiesService: InvestorOpportunitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() dto: CreateInvestorOpportunityDto) {
    return this.investorOpportunitiesService.create(req.user, dto);
  }

  @Get('public')
  findPublished(@Query() filters: InvestorOpportunityFilterDto) {
    return this.investorOpportunitiesService.findPublished(filters);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any, @Query() filters: InvestorOpportunityFilterDto) {
    return this.investorOpportunitiesService.findAll(req.user, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.investorOpportunitiesService.findOne(req.user, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvestorOpportunityDto,
  ) {
    return this.investorOpportunitiesService.update(req.user, id, dto);
  }

  @Post(':id/inquiries')
  @UseGuards(JwtAuthGuard)
  createInquiry(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateInvestorOpportunityInquiryDto,
  ) {
    return this.investorOpportunitiesService.createInquiry(req.user, id, dto);
  }

  @Patch('inquiries/:id')
  @UseGuards(JwtAuthGuard)
  updateInquiry(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvestorOpportunityInquiryDto,
  ) {
    return this.investorOpportunitiesService.updateInquiry(req.user, id, dto);
  }
}
