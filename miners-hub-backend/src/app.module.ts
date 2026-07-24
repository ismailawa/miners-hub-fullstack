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
import { SignNowModule } from './common/signnow/signnow.module';
import { MediaModule } from './media/media.module';
import { KycModule } from './kyc/kyc.module';
import { MineSitesModule } from './mine-sites/mine-sites.module';
import { ComplianceModule } from './compliance/compliance.module';
import { ProductionReportsModule } from './production-reports/production-reports.module';
import { LogisticsModule } from './logistics/logistics.module';
import { LabResultsModule } from './lab-results/lab-results.module';
import { MineralPassportsModule } from './mineral-passports/mineral-passports.module';
import { EnvironmentalRecordsModule } from './environmental-records/environmental-records.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { InvestorOpportunitiesModule } from './investor-opportunities/investor-opportunities.module';
import { TrustedPartnersModule } from './trusted-partners/trusted-partners.module';
import { MineralPricesModule } from './mineral-prices/mineral-prices.module';
import { LookupsModule } from './lookups/lookups.module';
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
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 requests per minute globally
      },
    ]),
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
    SignNowModule,
    MediaModule,
    KycModule,
    MineSitesModule,
    ComplianceModule,
    ProductionReportsModule,
    LogisticsModule,
    LabResultsModule,
    MineralPassportsModule,
    EnvironmentalRecordsModule,
    AnalyticsModule,
    InvestorOpportunitiesModule,
    TrustedPartnersModule,
    MineralPricesModule,
    LookupsModule,
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
