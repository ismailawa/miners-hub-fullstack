import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, VerificationStatus } from '../entities/user.entity';
import { ListingStatus } from '../entities/listing.entity';
import { CreateEventDto, UpdateEventDto } from '../events/events.dto';
import { OrderStatus } from '../entities/order.entity';
import {
  DocumentReviewStatus,
  DocumentType,
} from '../entities/document.entity';
import { ReviewDocumentDto } from '../documents/documents.dto';
import { EscrowService } from '../escrow/escrow.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly escrowService: EscrowService,
  ) {}

  @Get('users')
  async getUsers(
    @Query('status') status?: VerificationStatus,
    @Query('limit') limit?: string,
    @Query('rawOffset') rawOffset?: string,
  ) {
    return this.adminService.getUsers(
      status,
      Number(limit) || 100,
      Number(rawOffset) || 0,
    );
  }

  @Patch('users/:id/verify')
  async verifyUser(
    @Param('id') id: string,
    @Body('status') status: VerificationStatus,
    @Request() req: any,
  ) {
    return this.adminService.verifyUser(id, status, req.user.id);
  }

  @Get('miner-registry')
  async getMinerRegistry(
    @Query('status') status?: VerificationStatus,
    @Query('documentStatus') documentStatus?: DocumentReviewStatus,
    @Query('location') location?: string,
    @Query('mineralType') mineralType?: string,
    @Query('limit') limit?: string,
    @Query('rawOffset') rawOffset?: string,
  ) {
    return this.adminService.getMinerRegistry({
      status,
      documentStatus,
      location,
      mineralType,
      limit: Number(limit) || 100,
      rawOffset: Number(rawOffset) || 0,
    });
  }

  @Get('miner-registry/:id')
  async getMinerRegistryDetail(@Param('id') id: string) {
    return this.adminService.getMinerRegistryDetail(id);
  }

  @Get('listings')
  async getListings(
    @Query('status') status?: ListingStatus,
    @Query('limit') limit?: string,
    @Query('rawOffset') rawOffset?: string,
  ) {
    return this.adminService.getListings(
      status,
      Number(limit) || 100,
      Number(rawOffset) || 0,
    );
  }

  @Patch('listings/:id/status')
  async updateListingStatus(
    @Param('id') id: string,
    @Body('status') status: ListingStatus,
    @Request() req: any,
  ) {
    return this.adminService.updateListingStatus(id, status, req.user.id);
  }

  @Get('orders')
  async getOrders(
    @Query('status') status?: OrderStatus,
    @Query('limit') limit?: string,
    @Query('rawOffset') rawOffset?: string,
  ) {
    return this.adminService.getOrders(
      status,
      Number(limit) || 100,
      Number(rawOffset) || 0,
    );
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    return this.adminService.getOrder(id);
  }

  @Post('orders/:id/escrow/release')
  async releaseEscrow(@Param('id') id: string, @Request() req: any) {
    return this.escrowService.releaseEscrow(id, req.user.id);
  }

  @Post('orders/:id/escrow/refund')
  async refundEscrow(@Param('id') id: string, @Request() req: any) {
    return this.escrowService.refundEscrow(id, req.user.id);
  }

  @Get('documents')
  async getDocuments(
    @Query('status') status?: DocumentReviewStatus,
    @Query('type') type?: DocumentType,
    @Query('limit') limit?: string,
    @Query('rawOffset') rawOffset?: string,
  ) {
    return this.adminService.getDocuments(
      status,
      type,
      Number(limit) || 100,
      Number(rawOffset) || 0,
    );
  }

  @Patch('documents/:id/review')
  async reviewDocument(
    @Param('id') id: string,
    @Body() dto: ReviewDocumentDto,
    @Request() req: any,
  ) {
    return this.adminService.reviewDocument(id, req.user.id, dto);
  }

  @Get('events')
  async getEvents() {
    return this.adminService.getEvents();
  }

  @Post('events')
  async createEvent(@Body() dto: CreateEventDto) {
    return this.adminService.createEvent(dto);
  }

  @Patch('events/:id')
  async updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.adminService.updateEvent(id, dto);
  }

  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string) {
    return this.adminService.deleteEvent(id);
  }
}
