import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ComplianceService } from './compliance.service';
import {
  ComplianceCaseFilterDto,
  CreateComplianceCaseDto,
  CreateLicenseDto,
  LicenseFilterDto,
  ReviewLicenseDto,
  UpdateComplianceCaseDto,
  UpdateLicenseDto,
} from './compliance.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('licenses')
  async createLicense(@Request() req: any, @Body() dto: CreateLicenseDto) {
    return this.complianceService.createLicense(req.user, dto);
  }

  @Get('licenses')
  async getLicenses(@Request() req: any, @Query() filters: LicenseFilterDto) {
    return this.complianceService.findLicenses(req.user, filters);
  }

  @Get('licenses/:id')
  async getLicense(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.complianceService.findLicense(req.user, id);
  }

  @Patch('licenses/:id')
  async updateLicense(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLicenseDto,
  ) {
    return this.complianceService.updateLicense(req.user, id, dto);
  }

  @Patch('licenses/:id/status')
  async reviewLicense(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewLicenseDto,
  ) {
    return this.complianceService.reviewLicense(req.user, id, dto);
  }

  @Post('compliance-cases')
  async createCase(@Request() req: any, @Body() dto: CreateComplianceCaseDto) {
    return this.complianceService.createCase(req.user, dto);
  }

  @Get('compliance-cases')
  async getCases(
    @Request() req: any,
    @Query() filters: ComplianceCaseFilterDto,
  ) {
    return this.complianceService.findCases(req.user, filters);
  }

  @Get('compliance-cases/:id')
  async getCase(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.complianceService.findCase(req.user, id);
  }

  @Patch('compliance-cases/:id')
  async updateCase(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateComplianceCaseDto,
  ) {
    return this.complianceService.updateCase(req.user, id, dto);
  }
}
