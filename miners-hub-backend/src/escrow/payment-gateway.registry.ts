import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FlutterwaveService } from './flutterwave.service';
import { PaymentGateway, PaymentGatewayName } from './payment-gateway.interface';

@Injectable()
export class PaymentGatewayRegistry {
  constructor(
    private readonly configService: ConfigService,
    private readonly flutterwaveService: FlutterwaveService,
  ) {}

  get activeGatewayName(): PaymentGatewayName {
    const configured = (
      this.configService.get<string>('PAYMENT_GATEWAY') || 'flutterwave'
    ).toLowerCase();

    if (configured === 'flutterwave') return 'flutterwave';

    throw new BadRequestException(
      `Payment gateway "${configured}" is not supported yet.`,
    );
  }

  getActiveGateway(): PaymentGateway {
    return this.getGateway(this.activeGatewayName);
  }

  getGateway(name: PaymentGatewayName): PaymentGateway {
    if (name === 'flutterwave') return this.flutterwaveService;
    throw new BadRequestException(`Payment gateway "${name}" is not registered.`);
  }
}
