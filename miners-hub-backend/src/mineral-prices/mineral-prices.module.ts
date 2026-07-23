import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MineralPriceOverride } from '../entities/mineral-price-override.entity';
import { MineralPricesController } from './mineral-prices.controller';
import { MineralPricesService } from './mineral-prices.service';

@Module({
  imports: [TypeOrmModule.forFeature([MineralPriceOverride])],
  controllers: [MineralPricesController],
  providers: [MineralPricesService],
  exports: [MineralPricesService],
})
export class MineralPricesModule {}
