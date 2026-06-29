import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { Listing } from '../entities/listing.entity';
import { Miner } from '../entities/miner.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EscrowModule } from '../escrow/escrow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Listing, Miner]),
    NotificationsModule,
    EscrowModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
