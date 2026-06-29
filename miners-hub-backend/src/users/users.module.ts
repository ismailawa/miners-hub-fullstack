import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Miner } from '../entities/miner.entity';
import { Investor } from '../entities/investor.entity';
import { Document } from '../entities/document.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EscrowModule } from '../escrow/escrow.module';


@Module({
  imports: [TypeOrmModule.forFeature([User, Miner, Investor, Document]), EscrowModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
