import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsProvider } from '../entities/logistics-provider.entity';
import { LogisticsQuoteRequest } from '../entities/logistics-quote-request.entity';
import { Order } from '../entities/order.entity';
import { Shipment } from '../entities/shipment.entity';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogisticsProvider,
      LogisticsQuoteRequest,
      Shipment,
      Order,
    ]),
  ],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
