export type PaymentGatewayName = 'flutterwave';

export interface CreateSubaccountInput {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  businessName: string;
  currency: string;
  reference: string;
}

export interface InitializePaymentInput {
  txRef: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customer: { email: string; name?: string };
  meta: Record<string, unknown>;
}

export interface CreateTransferInput {
  amount: number;
  currency: string;
  accountBank: string;
  accountNumber: string;
  narration: string;
  reference: string;
}

export interface PaymentGateway {
  readonly name: PaymentGatewayName;
  readonly configured: boolean;
  createSubaccount(input: CreateSubaccountInput): Promise<any>;
  initializePayment(input: InitializePaymentInput): Promise<{ link?: string | null; raw?: any }>;
  verifyTransaction(transactionId: string): Promise<any>;
  createTransfer(input: CreateTransferInput): Promise<any>;
  refundTransaction(transactionId: string, amount: number): Promise<any>;
}
