import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContractsService } from './contracts.service';
import {
  CreateContractDto,
  UpdateContractStatusDto,
  SignContractDto,
} from './contracts.dto';
import { ContractStatus } from '../entities/contract.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /**
   * POST /api/contracts
   * Propose a new contract (party1 = current user, party2 = dto.party2Id).
   */
  @Post()
  async create(@Request() req: any, @Body() dto: CreateContractDto) {
    return this.contractsService.create(req.user.id, dto);
  }

  /**
   * GET /api/contracts?status=...&page=1&limit=20
   * List all contracts where the current user is party1 or party2.
   */
  @Get()
  async findAll(
    @Request() req: any,
    @Query('status') status?: ContractStatus,
    @Query() pagination?: PaginationDto,
  ) {
    return this.contractsService.findAll(req.user.id, status, pagination);
  }

  /**
   * GET /api/contracts/:id
   * Get contract detail — party access only.
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    return this.contractsService.findOne(id, req.user.id);
  }

  /**
   * PATCH /api/contracts/:id/status
   * Update contract status (within allowed transitions).
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContractStatusDto,
    @Request() req: any,
  ) {
    return this.contractsService.updateStatus(id, req.user.id, dto);
  }

  /**
   * POST /api/contracts/:id/sign
   * Sign the contract (party1 or party2 may sign independently).
   */
  @Post(':id/sign')
  async sign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SignContractDto,
    @Request() req: any,
  ) {
    return this.contractsService.sign(id, req.user.id, dto);
  }
}
