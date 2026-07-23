import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsProvider } from '../entities/logistics-provider.entity';
import { LogisticsQuoteRequest } from '../entities/logistics-quote-request.entity';
import { Order } from '../entities/order.entity';
import { Shipment } from '../entities/shipment.entity';
import { MineralPassport } from '../entities/mineral-passport.entity';
import { EscrowModule } from '../escrow/escrow.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogisticsProvider,
      LogisticsQuoteRequest,
      Shipment,
      Order,
      MineralPassport,
    ]),
    EscrowModule,
    NotificationsModule,
  ],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
