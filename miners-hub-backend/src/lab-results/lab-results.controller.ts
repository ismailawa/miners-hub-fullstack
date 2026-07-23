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
import {
  CreateLaboratoryPartnerDto,
  CreateLabResultDto,
  LabResultFilterDto,
  UpdateLaboratoryPartnerDto,
  UpdateLabResultDto,
  VerifyLabResultDto,
} from './lab-results.dto';
import { LabResultsService } from './lab-results.service';

@Controller('lab-results')
@UseGuards(JwtAuthGuard)
export class LabResultsController {
  constructor(private readonly labResultsService: LabResultsService) {}

  @Get('partners')
  async getPartners() {
    return this.labResultsService.getPartners();
  }

  @Post('partners')
  async createPartner(
    @Request() req: any,
    @Body() dto: CreateLaboratoryPartnerDto,
  ) {
    return this.labResultsService.createPartner(req.user, dto);
  }

  @Patch('partners/:id')
  async updatePartner(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLaboratoryPartnerDto,
  ) {
    return this.labResultsService.updatePartner(req.user, id, dto);
  }

  @Post()
  async createResult(@Request() req: any, @Body() dto: CreateLabResultDto) {
    return this.labResultsService.createResult(req.user, dto);
  }

  @Get()
  async getResults(@Request() req: any, @Query() filters: LabResultFilterDto) {
    return this.labResultsService.getResults(req.user, filters);
  }

  @Get(':id')
  async getResult(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.labResultsService.getResult(req.user, id);
  }

  @Patch(':id')
  async updateResult(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLabResultDto,
  ) {
    return this.labResultsService.updateResult(req.user, id, dto);
  }

  @Patch(':id/verify')
  async verifyResult(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyLabResultDto,
  ) {
    return this.labResultsService.verifyResult(req.user, id, dto);
  }
}
