import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MineSite } from '../entities/mine-site.entity';
import { Miner } from '../entities/miner.entity';
import { MineSitesController } from './mine-sites.controller';
import { MineSitesService } from './mine-sites.service';

@Module({
  imports: [TypeOrmModule.forFeature([MineSite, Miner])],
  controllers: [MineSitesController],
  providers: [MineSitesService],
  exports: [MineSitesService],
})
export class MineSitesModule {}
