import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEscrowAndPayoutAccounts1782062200000 implements MigrationInterface {
    name = 'AddEscrowAndPayoutAccounts1782062200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."seller_payout_accounts_status_enum" AS ENUM('pending', 'active', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "seller_payout_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "bank_name" character varying NOT NULL, "bank_code" character varying NOT NULL, "account_number" character varying NOT NULL, "account_name" character varying NOT NULL, "currency" character varying NOT NULL DEFAULT 'NGN', "status" "public"."seller_payout_accounts_status_enum" NOT NULL DEFAULT 'pending', "flutterwave_subaccount_id" character varying, "flutterwave_subaccount_reference" character varying, "failure_reason" text, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_seller_payout_accounts_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_seller_payout_accounts_user_id" ON "seller_payout_accounts" ("user_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_seller_payout_accounts_status" ON "seller_payout_accounts" ("status")`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "seller_payout_accounts" ADD CONSTRAINT "FK_seller_payout_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$`);

        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."escrow_transactions_status_enum" AS ENUM('pending_payment', 'funded', 'awaiting_release', 'release_processing', 'released', 'refund_processing', 'refunded', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "escrow_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "buyer_id" uuid NOT NULL, "seller_id" uuid NOT NULL, "seller_payout_account_id" uuid, "gross_amount" numeric(12,2) NOT NULL, "commission_amount" numeric(12,2) NOT NULL, "seller_net_amount" numeric(12,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'NGN', "status" "public"."escrow_transactions_status_enum" NOT NULL DEFAULT 'pending_payment', "flutterwave_tx_ref" character varying NOT NULL, "flutterwave_transaction_id" character varying, "flutterwave_payment_link" text, "flutterwave_payment_status" character varying, "seller_transfer_reference" character varying, "seller_transfer_status" character varying NOT NULL DEFAULT 'not_started', "seller_transfer_id" character varying, "platform_commission_transfer_reference" character varying, "platform_commission_transfer_status" character varying NOT NULL DEFAULT 'not_started', "platform_commission_transfer_id" character varying, "funded_at" TIMESTAMP, "released_at" TIMESTAMP, "refunded_at" TIMESTAMP, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_escrow_transactions_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_escrow_transactions_order_id" ON "escrow_transactions" ("order_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_escrow_transactions_buyer_id" ON "escrow_transactions" ("buyer_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_escrow_transactions_seller_id" ON "escrow_transactions" ("seller_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_escrow_transactions_status" ON "escrow_transactions" ("status")`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_escrow_transactions_flutterwave_tx_ref" ON "escrow_transactions" ("flutterwave_tx_ref")`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "escrow_transactions" ADD CONSTRAINT "FK_escrow_transactions_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "escrow_transactions" ADD CONSTRAINT "FK_escrow_transactions_buyer_id" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "escrow_transactions" ADD CONSTRAINT "FK_escrow_transactions_seller_id" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "escrow_transactions" ADD CONSTRAINT "FK_escrow_transactions_seller_payout_account_id" FOREIGN KEY ("seller_payout_account_id") REFERENCES "seller_payout_accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "escrow_transactions" DROP CONSTRAINT IF EXISTS "FK_escrow_transactions_seller_payout_account_id"`);
        await queryRunner.query(`ALTER TABLE "escrow_transactions" DROP CONSTRAINT IF EXISTS "FK_escrow_transactions_seller_id"`);
        await queryRunner.query(`ALTER TABLE "escrow_transactions" DROP CONSTRAINT IF EXISTS "FK_escrow_transactions_buyer_id"`);
        await queryRunner.query(`ALTER TABLE "escrow_transactions" DROP CONSTRAINT IF EXISTS "FK_escrow_transactions_order_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_escrow_transactions_flutterwave_tx_ref"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_escrow_transactions_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_escrow_transactions_seller_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_escrow_transactions_buyer_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_escrow_transactions_order_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "escrow_transactions"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."escrow_transactions_status_enum"`);

        await queryRunner.query(`ALTER TABLE "seller_payout_accounts" DROP CONSTRAINT IF EXISTS "FK_seller_payout_accounts_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_seller_payout_accounts_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_seller_payout_accounts_user_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "seller_payout_accounts"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."seller_payout_accounts_status_enum"`);
    }
}
