import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendLogisticsFulfillment1782063600000 implements MigrationInterface {
  name = 'ExtendLogisticsFulfillment1782063600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "logistics_providers_category_enum" AS ENUM ('international_carrier', 'local_haulage', 'warehousing', 'customs_clearing', 'last_mile');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`ALTER TABLE "logistics_providers" ADD COLUMN IF NOT EXISTS "category" "logistics_providers_category_enum" NOT NULL DEFAULT 'local_haulage'`);
    await queryRunner.query(`ALTER TABLE "logistics_providers" ADD COLUMN IF NOT EXISTS "fleet_profiles" jsonb NOT NULL DEFAULT '[]'::jsonb`);
    await queryRunner.query(`ALTER TABLE "logistics_providers" ADD COLUMN IF NOT EXISTS "integration_metadata" jsonb`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_logistics_providers_category" ON "logistics_providers" ("category")`);

    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "provider_id" uuid`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "eta" character varying`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "route_notes" text`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "cost_breakdown" jsonb`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "currency" character varying NOT NULL DEFAULT 'NGN'`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "valid_until" timestamp`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "accepted_by_user_id" uuid`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "accepted_at" timestamp`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "shipment_id" uuid`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "request_metadata" jsonb`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" ADD COLUMN IF NOT EXISTS "invoice_metadata" jsonb`);
    await queryRunner.query(`
      ALTER TABLE "logistics_quote_requests"
      ADD CONSTRAINT "FK_logistics_quote_requests_provider"
      FOREIGN KEY ("provider_id") REFERENCES "logistics_providers"("id") ON DELETE SET NULL
    `).catch(() => undefined);
    await queryRunner.query(`
      ALTER TABLE "logistics_quote_requests"
      ADD CONSTRAINT "FK_logistics_quote_requests_accepted_by"
      FOREIGN KEY ("accepted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
    `).catch(() => undefined);

    await queryRunner.query(`ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "quote_request_id" uuid`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "currency" character varying NOT NULL DEFAULT 'NGN'`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "tracking_references" jsonb`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "international_details" jsonb`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "invoice_metadata" jsonb`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_shipments_quote_request_id" ON "shipments" ("quote_request_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_shipments_quote_request_id"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "invoice_metadata"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "international_details"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "tracking_references"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "currency"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "quote_request_id"`);

    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP CONSTRAINT IF EXISTS "FK_logistics_quote_requests_accepted_by"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP CONSTRAINT IF EXISTS "FK_logistics_quote_requests_provider"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "invoice_metadata"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "request_metadata"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "shipment_id"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "accepted_at"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "accepted_by_user_id"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "valid_until"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "currency"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "cost_breakdown"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "route_notes"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "eta"`);
    await queryRunner.query(`ALTER TABLE "logistics_quote_requests" DROP COLUMN IF EXISTS "provider_id"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_logistics_providers_category"`);
    await queryRunner.query(`ALTER TABLE "logistics_providers" DROP COLUMN IF EXISTS "integration_metadata"`);
    await queryRunner.query(`ALTER TABLE "logistics_providers" DROP COLUMN IF EXISTS "fleet_profiles"`);
    await queryRunner.query(`ALTER TABLE "logistics_providers" DROP COLUMN IF EXISTS "category"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "logistics_providers_category_enum"`);
  }
}
