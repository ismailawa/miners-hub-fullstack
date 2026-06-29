import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto, PlaceBidDto } from './auctions.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  /**
   * POST /api/auctions  (auth required — miner only)
   * Create an auction for a miner's listing.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: CreateAuctionDto) {
    return this.auctionsService.create(req.user.id, dto);
  }

  /**
   * GET /api/auctions  (public)
   * List all active auctions with their listings.
   */
  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    return this.auctionsService.findAll(pagination);
  }

  /**
   * GET /api/auctions/:id  (public)
   * Get auction detail including current bids.
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctionsService.findOne(id);
  }

  /**
   * POST /api/auctions/:id/bids  (auth required)
   * Place a bid on an active auction.
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/bids')
  async placeBid(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PlaceBidDto,
    @Request() req: any,
  ) {
    return this.auctionsService.placeBid(id, req.user.id, dto);
  }

  /**
   * GET /api/auctions/:id/bids  (public)
   * List bids for an auction, sorted by amount descending.
   */
  @Get(':id/bids')
  async getBids(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.auctionsService.getBids(id, pagination);
  }
}
