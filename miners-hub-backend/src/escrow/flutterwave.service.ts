import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateSubaccountInput,
  CreateTransferInput,
  InitializePaymentInput,
  PaymentGateway,
} from './payment-gateway.interface';

interface FlutterwaveRequestOptions {
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
}

@Injectable()
export class FlutterwaveService implements PaymentGateway {
  readonly name = 'flutterwave' as const;

  private readonly baseUrl = 'https://api.flutterwave.com/v3';

  constructor(private readonly configService: ConfigService) {}

  get configured(): boolean {
    return Boolean(this.configService.get<string>('FLUTTERWAVE_SECRET_KEY'));
  }

  private get mockMode(): boolean {
    return (
      this.configService.get<string>('FLUTTERWAVE_MOCK_MODE') === 'true' ||
      this.configService.get<string>('ALLOW_MOCK_PROVIDERS') === 'true'
    );
  }

  async createSubaccount(input: CreateSubaccountInput) {
    if (!this.configured && this.mockMode) {
      return {
        id: `mock-subaccount-${input.reference}`,
        subaccount_id: `mock-subaccount-${input.reference}`,
        raw: { simulated: true },
      };
    }
    if (!this.configured) {
      throw new BadGatewayException('Flutterwave is not configured.');
    }

    const payload = {
      account_bank: input.bankCode,
      account_number: input.accountNumber,
      business_name: input.businessName,
      business_contact: input.accountName,
      split_type: 'percentage',
      split_value: 0,
      country: input.currency === 'NGN' ? 'NG' : undefined,
      meta: [{ metaname: 'reference', metavalue: input.reference }],
    };

    const response = await this.request('/subaccounts', {
      method: 'POST',
      body: payload,
    });
    return response.data;
  }

  async initializePayment(input: InitializePaymentInput) {
    if (!this.configured && this.mockMode) {
      return {
        link: `${input.redirectUrl}${input.redirectUrl.includes('?') ? '&' : '?'}tx_ref=${input.txRef}&status=pending`,
        raw: { simulated: true },
      };
    }
    if (!this.configured) {
      throw new BadGatewayException('Flutterwave is not configured.');
    }

    const response = await this.request('/payments', {
      method: 'POST',
      body: {
        tx_ref: input.txRef,
        amount: input.amount,
        currency: input.currency,
        redirect_url: input.redirectUrl,
        customer: input.customer,
        customizations: {
          title: 'Miners Hub Escrow',
          description: 'Secure escrow payment for marketplace order',
        },
        meta: input.meta,
      },
    });

    return { link: response.data?.link, raw: response };
  }

  async verifyTransaction(transactionId: string) {
    if (!this.configured && this.mockMode) {
      return null;
    }
    if (!this.configured) {
      throw new BadGatewayException('Flutterwave is not configured.');
    }

    const response = await this.request(
      `/transactions/${transactionId}/verify`,
    );
    return response.data;
  }

  async createTransfer(input: CreateTransferInput) {
    if (!this.configured && this.mockMode) {
      return {
        id: `mock-transfer-${input.reference}`,
        reference: input.reference,
        status: 'SUCCESSFUL',
        raw: { simulated: true },
      };
    }
    if (!this.configured) {
      throw new BadGatewayException('Flutterwave is not configured.');
    }

    const response = await this.request('/transfers', {
      method: 'POST',
      body: {
        account_bank: input.accountBank,
        account_number: input.accountNumber,
        amount: input.amount,
        currency: input.currency,
        narration: input.narration,
        reference: input.reference,
      },
    });

    return response.data;
  }

  async refundTransaction(transactionId: string, amount: number) {
    if (!this.configured && this.mockMode) {
      return {
        id: `mock-refund-${transactionId}`,
        amount,
        status: 'completed',
      };
    }
    if (!this.configured) {
      throw new BadGatewayException('Flutterwave is not configured.');
    }

    const response = await this.request(
      `/transactions/${transactionId}/refund`,
      {
        method: 'POST',
        body: { amount },
      },
    );
    return response.data;
  }

  private async request(path: string, options: FlutterwaveRequestOptions = {}) {
    const secretKey = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    if (!secretKey) {
      throw new BadGatewayException('Flutterwave is not configured.');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const json = await response.json().catch(() => null);
    if (!response.ok || json?.status === 'error') {
      throw new BadGatewayException(
        json?.message || 'Flutterwave request failed.',
      );
    }

    return json;
  }
}
