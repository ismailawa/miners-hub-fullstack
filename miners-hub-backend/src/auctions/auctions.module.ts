import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Listing } from '../entities/listing.entity';
import { Miner } from '../entities/miner.entity';
import { Order } from '../entities/order.entity';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Bid, Listing, Miner, Order]),
    NotificationsModule,
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService],
  exports: [AuctionsService],
})
export class AuctionsModule {}
