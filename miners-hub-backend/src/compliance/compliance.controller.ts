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
  AmlKybRiskProfileFilterDto,
  ComplianceCaseFilterDto,
  CreateAmlKybRiskProfileDto,
  CreateComplianceCaseDto,
  CreateEsgObligationDto,
  CreateExportReadinessChecklistDto,
  CreateLicenseDto,
  EsgObligationFilterDto,
  ExportReadinessFilterDto,
  ReviewAmlKybRiskProfileDto,
  ReviewEsgObligationDto,
  LicenseFilterDto,
  ReviewExportReadinessChecklistDto,
  ReviewLicenseDto,
  UpdateAmlKybRiskProfileDto,
  UpdateComplianceCaseDto,
  UpdateEsgObligationDto,
  UpdateExportReadinessChecklistDto,
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
  async getLicense(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
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

  @Post('export-readiness')
  async createExportReadiness(
    @Request() req: any,
    @Body() dto: CreateExportReadinessChecklistDto,
  ) {
    return this.complianceService.createExportReadiness(req.user, dto);
  }

  @Get('export-readiness')
  async getExportReadinessList(
    @Request() req: any,
    @Query() filters: ExportReadinessFilterDto,
  ) {
    return this.complianceService.findExportReadinessList(req.user, filters);
  }

  @Get('export-readiness/:id')
  async getExportReadiness(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.complianceService.findExportReadiness(req.user, id);
  }

  @Patch('export-readiness/:id')
  async updateExportReadiness(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExportReadinessChecklistDto,
  ) {
    return this.complianceService.updateExportReadiness(req.user, id, dto);
  }

  @Patch('export-readiness/:id/status')
  async reviewExportReadiness(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewExportReadinessChecklistDto,
  ) {
    return this.complianceService.reviewExportReadiness(req.user, id, dto);
  }

  @Post('esg-obligations')
  async createEsgObligation(
    @Request() req: any,
    @Body() dto: CreateEsgObligationDto,
  ) {
    return this.complianceService.createEsgObligation(req.user, dto);
  }

  @Get('esg-obligations')
  async getEsgObligations(
    @Request() req: any,
    @Query() filters: EsgObligationFilterDto,
  ) {
    return this.complianceService.findEsgObligations(req.user, filters);
  }

  @Get('esg-obligations/:id')
  async getEsgObligation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.complianceService.findEsgObligation(req.user, id);
  }

  @Patch('esg-obligations/:id')
  async updateEsgObligation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEsgObligationDto,
  ) {
    return this.complianceService.updateEsgObligation(req.user, id, dto);
  }

  @Patch('esg-obligations/:id/status')
  async reviewEsgObligation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewEsgObligationDto,
  ) {
    return this.complianceService.reviewEsgObligation(req.user, id, dto);
  }

  @Post('aml-kyb-profiles')
  async createAmlKybRiskProfile(
    @Request() req: any,
    @Body() dto: CreateAmlKybRiskProfileDto,
  ) {
    return this.complianceService.createAmlKybRiskProfile(req.user, dto);
  }

  @Get('aml-kyb-profiles')
  async getAmlKybRiskProfiles(
    @Request() req: any,
    @Query() filters: AmlKybRiskProfileFilterDto,
  ) {
    return this.complianceService.findAmlKybRiskProfiles(req.user, filters);
  }

  @Get('aml-kyb-profiles/:id')
  async getAmlKybRiskProfile(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.complianceService.findAmlKybRiskProfile(req.user, id);
  }

  @Patch('aml-kyb-profiles/:id')
  async updateAmlKybRiskProfile(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAmlKybRiskProfileDto,
  ) {
    return this.complianceService.updateAmlKybRiskProfile(req.user, id, dto);
  }

  @Patch('aml-kyb-profiles/:id/status')
  async reviewAmlKybRiskProfile(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewAmlKybRiskProfileDto,
  ) {
    return this.complianceService.reviewAmlKybRiskProfile(req.user, id, dto);
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
