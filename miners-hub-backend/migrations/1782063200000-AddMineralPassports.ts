import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMineralPassports1782063200000 implements MigrationInterface {
  name = 'AddMineralPassports1782063200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "mineral_passports_status_enum" AS ENUM ('active', 'revoked', 'disputed', 'expired');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mineral_passports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "passport_number" character varying NOT NULL,
        "public_verification_token" character varying NOT NULL,
        "miner_id" uuid NOT NULL,
        "site_id" uuid,
        "license_id" uuid,
        "production_report_id" uuid,
        "lab_result_id" uuid,
        "listing_id" uuid,
        "order_id" uuid,
        "shipment_id" uuid,
        "contract_id" uuid,
        "escrow_transaction_id" uuid,
        "status" "mineral_passports_status_enum" NOT NULL DEFAULT 'active',
        "qr_code_url" text,
        "snapshot" jsonb NOT NULL DEFAULT '{}',
        "issued_by" uuid,
        "issued_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_mineral_passports" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_mineral_passports_passport_number" UNIQUE ("passport_number"),
        CONSTRAINT "UQ_mineral_passports_public_verification_token" UNIQUE ("public_verification_token"),
        CONSTRAINT "FK_mineral_passports_miner" FOREIGN KEY ("miner_id") REFERENCES "miners"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_mineral_passports_site" FOREIGN KEY ("site_id") REFERENCES "mine_sites"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_mineral_passports_license" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_mineral_passports_production_report" FOREIGN KEY ("production_report_id") REFERENCES "production_reports"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_mineral_passports_lab_result" FOREIGN KEY ("lab_result_id") REFERENCES "lab_results"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_mineral_passports_listing" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_mineral_passports_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_mineral_passports_shipment" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_mineral_passports_contract" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_mineral_passports_escrow" FOREIGN KEY ("escrow_transaction_id") REFERENCES "escrow_transactions"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_mineral_passports_issuer" FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_mineral_passports_status" ON "mineral_passports" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_mineral_passports_miner_id" ON "mineral_passports" ("miner_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_mineral_passports_listing_id" ON "mineral_passports" ("listing_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_mineral_passports_order_id" ON "mineral_passports" ("order_id")`);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "lab_results" ADD CONSTRAINT "FK_lab_results_mineral_passport" FOREIGN KEY ("mineral_passport_id") REFERENCES "mineral_passports"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipments_mineral_passport" FOREIGN KEY ("mineral_passport_id") REFERENCES "mineral_passports"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT IF EXISTS "FK_shipments_mineral_passport"`);
    await queryRunner.query(`ALTER TABLE "lab_results" DROP CONSTRAINT IF EXISTS "FK_lab_results_mineral_passport"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_mineral_passports_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_mineral_passports_listing_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_mineral_passports_miner_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_mineral_passports_status"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "mineral_passports"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "mineral_passports_status_enum"`);
  }
}
