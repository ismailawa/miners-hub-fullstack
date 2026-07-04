import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from '../entities/contract.entity';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { SignNowWebhookController } from './contracts.webhook.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { SignNowModule } from '../common/signnow/signnow.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract]),
    NotificationsModule,
    SignNowModule,
    UsersModule,
  ],
  controllers: [ContractsController, SignNowWebhookController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
