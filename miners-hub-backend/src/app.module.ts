import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './common/health/health.controller';
import { getDatabaseConfig } from './config/database.config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { ListingsModule } from './listings/listings.module';
import { AuditLogModule } from './common/audit-log/audit-log.module';
import { DocumentsModule } from './documents/documents.module';
import { OrdersModule } from './orders/orders.module';
import { AuctionsModule } from './auctions/auctions.module';
import { ContractsModule } from './contracts/contracts.module';
import { ChatsModule } from './chats/chats.module';
import { AiModule } from './ai/ai.module';
import { EventsModule } from './events/events.module';
import { ForumModule } from './forum/forum.module';
import { EscrowModule } from './escrow/escrow.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute globally
    }]),
    UsersModule,
    AuthModule,
    NotificationsModule,
    AdminModule,
    ListingsModule,
    AuditLogModule,
    DocumentsModule,
    OrdersModule,
    AuctionsModule,
    ContractsModule,
    ChatsModule,
    AiModule,
    EventsModule,
    ForumModule,
    EscrowModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
