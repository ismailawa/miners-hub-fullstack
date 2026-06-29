import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListingsService } from './listings.service';
import { CreateListingDto, ListingFilterDto } from './listings.dto';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  /** Public: get all published listings for the marketplace */
  @Get()
  async getPublished(@Query() filterDto: ListingFilterDto) {
    return this.listingsService.findPublished(filterDto);
  }

  /** Miner: get own listings */
  @UseGuards(JwtAuthGuard)
  @Get('my/all')
  async getMyListings(@Request() req: any) {
    return this.listingsService.findMyListings(req.user.id);
  }

  /** Public: get a single published listing by ID */
  @Get(':id')
  async getOnePublished(@Param('id', ParseUUIDPipe) id: string) {
    return this.listingsService.findOne(id);
  }

  /** Miner: create a new listing (goes to SUBMITTED for admin approval) */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: CreateListingDto) {
    return this.listingsService.create(req.user.id, dto);
  }

  /** Miner: update own listing */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateListingDto>,
  ) {
    return this.listingsService.update(req.user.id, id, dto);
  }

  /** Miner: delete own listing */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    await this.listingsService.delete(req.user.id, id);
    return { success: true };
  }
}
