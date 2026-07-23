import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceCase } from '../entities/compliance-case.entity';
import { License } from '../entities/license.entity';
import { MineSite } from '../entities/mine-site.entity';
import { User } from '../entities/user.entity';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';

@Module({
  imports: [TypeOrmModule.forFeature([License, ComplianceCase, MineSite, User])],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
