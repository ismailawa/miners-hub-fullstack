import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowTransaction } from '../entities/escrow-transaction.entity';
import { SellerPayoutAccount } from '../entities/seller-payout-account.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { Listing } from '../entities/listing.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { FlutterwaveService } from './flutterwave.service';
import { PaymentGatewayRegistry } from './payment-gateway.registry';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EscrowTransaction,
      SellerPayoutAccount,
      Order,
      User,
      Listing,
    ]),
    NotificationsModule,
  ],
  controllers: [EscrowController],
  providers: [EscrowService, FlutterwaveService, PaymentGatewayRegistry],
  exports: [EscrowService],
})
export class EscrowModule {}
