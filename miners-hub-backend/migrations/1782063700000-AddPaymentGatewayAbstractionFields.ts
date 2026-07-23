import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentGatewayAbstractionFields1782063700000 implements MigrationInterface {
  name = 'AddPaymentGatewayAbstractionFields1782063700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "seller_payout_accounts" ADD COLUMN IF NOT EXISTS "payment_gateway" character varying NOT NULL DEFAULT 'flutterwave'`);
    await queryRunner.query(`ALTER TABLE "seller_payout_accounts" ADD COLUMN IF NOT EXISTS "gateway_subaccount_id" character varying`);
    await queryRunner.query(`ALTER TABLE "seller_payout_accounts" ADD COLUMN IF NOT EXISTS "gateway_subaccount_reference" character varying`);
    await queryRunner.query(`UPDATE "seller_payout_accounts" SET "gateway_subaccount_id" = COALESCE("gateway_subaccount_id", "flutterwave_subaccount_id")`);
    await queryRunner.query(`UPDATE "seller_payout_accounts" SET "gateway_subaccount_reference" = COALESCE("gateway_subaccount_reference", "flutterwave_subaccount_reference")`);

    await queryRunner.query(`ALTER TABLE "escrow_transactions" ADD COLUMN IF NOT EXISTS "payment_gateway" character varying NOT NULL DEFAULT 'flutterwave'`);
    await queryRunner.query(`ALTER TABLE "escrow_transactions" ADD COLUMN IF NOT EXISTS "gateway_tx_ref" character varying`);
    await queryRunner.query(`ALTER TABLE "escrow_transactions" ADD COLUMN IF NOT EXISTS "gateway_transaction_id" character varying`);
    await queryRunner.query(`ALTER TABLE "escrow_transactions" ADD COLUMN IF NOT EXISTS "gateway_payment_link" text`);
    await queryRunner.query(`ALTER TABLE "escrow_transactions" ADD COLUMN IF NOT EXISTS "gateway_payment_status" character varying`);
    await queryRunner.query(`UPDATE "escrow_transactions" SET "gateway_tx_ref" = COALESCE("gateway_tx_ref", "flutterwave_tx_ref")`);
    await queryRunner.query(`UPDATE "escrow_transactions" SET "gateway_transaction_id" = COALESCE("gateway_transaction_id", "flutterwave_transaction_id")`);
    await queryRunner.query(`UPDATE "escrow_transactions" SET "gateway_payment_link" = COALESCE("gateway_payment_link", "flutterwave_payment_link")`);
    await queryRunner.query(`UPDATE "escrow_transactions" SET "gateway_payment_status" = COALESCE("gateway_payment_status", "flutterwave_payment_status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "escrow_transactions" DROP COLUMN IF EXISTS "gateway_payment_status"`);
    await queryRunner.query(`ALTER TABLE "escrow_transactions" DROP COLUMN IF EXISTS "gateway_payment_link"`);
    await queryRunner.query(`ALTER TABLE "escrow_transactions" DROP COLUMN IF EXISTS "gateway_transaction_id"`);
    await queryRunner.query(`ALTER TABLE "escrow_transactions" DROP COLUMN IF EXISTS "gateway_tx_ref"`);
    await queryRunner.query(`ALTER TABLE "escrow_transactions" DROP COLUMN IF EXISTS "payment_gateway"`);

    await queryRunner.query(`ALTER TABLE "seller_payout_accounts" DROP COLUMN IF EXISTS "gateway_subaccount_reference"`);
    await queryRunner.query(`ALTER TABLE "seller_payout_accounts" DROP COLUMN IF EXISTS "gateway_subaccount_id"`);
    await queryRunner.query(`ALTER TABLE "seller_payout_accounts" DROP COLUMN IF EXISTS "payment_gateway"`);
  }
}
