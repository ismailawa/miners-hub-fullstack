import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLogisticsManagement1782062900000
  implements MigrationInterface
{
  name = 'AddLogisticsManagement1782062900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "logistics_providers_status_enum" AS ENUM ('pending', 'active', 'suspended');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "logistics_quote_requests_status_enum" AS ENUM ('requested', 'quoted', 'accepted', 'declined');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "shipments_status_enum" AS ENUM ('quote_requested', 'scheduled', 'picked_up', 'in_transit', 'at_checkpoint', 'delivered', 'disputed', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "logistics_providers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "company_name" character varying NOT NULL,
        "service_areas" text array NOT NULL DEFAULT '{}',
        "capabilities" text array NOT NULL DEFAULT '{}',
        "status" "logistics_providers_status_enum" NOT NULL DEFAULT 'pending',
        "contact_email" character varying,
        "contact_phone" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_logistics_providers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_logistics_providers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "logistics_quote_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "requester_user_id" uuid,
        "order_id" uuid,
        "origin" character varying NOT NULL,
        "destination" character varying NOT NULL,
        "commodity" character varying NOT NULL,
        "weight" numeric(12,2) NOT NULL,
        "container_type" character varying NOT NULL,
        "contact_name" character varying NOT NULL,
        "contact_email" character varying NOT NULL,
        "status" "logistics_quote_requests_status_enum" NOT NULL DEFAULT 'requested',
        "quoted_amount" numeric(12,2),
        "quote_notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_logistics_quote_requests" PRIMARY KEY ("id"),
        CONSTRAINT "FK_logistics_quote_requests_user" FOREIGN KEY ("requester_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_logistics_quote_requests_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "shipments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tracking_id" character varying NOT NULL,
        "order_id" uuid NOT NULL,
        "provider_id" uuid,
        "mineral_passport_id" uuid,
        "quote_amount" numeric(12,2),
        "pickup_location" text NOT NULL,
        "delivery_location" text NOT NULL,
        "status" "shipments_status_enum" NOT NULL DEFAULT 'quote_requested',
        "current_milestone" character varying,
        "milestones" jsonb NOT NULL DEFAULT '[]',
        "handoff_evidence" jsonb,
        "delivered_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_shipments_tracking_id" UNIQUE ("tracking_id"),
        CONSTRAINT "PK_shipments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_shipments_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_shipments_provider" FOREIGN KEY ("provider_id") REFERENCES "logistics_providers"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_logistics_providers_user_id" ON "logistics_providers" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_logistics_providers_status" ON "logistics_providers" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_logistics_quote_requests_requester_user_id" ON "logistics_quote_requests" ("requester_user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_logistics_quote_requests_status" ON "logistics_quote_requests" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_logistics_quote_requests_created_at" ON "logistics_quote_requests" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_shipments_order_id" ON "shipments" ("order_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_shipments_provider_id" ON "shipments" ("provider_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_shipments_status" ON "shipments" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_shipments_tracking_id" ON "shipments" ("tracking_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_shipments_tracking_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_shipments_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_shipments_provider_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_shipments_order_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_logistics_quote_requests_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_logistics_quote_requests_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_logistics_quote_requests_requester_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_logistics_providers_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_logistics_providers_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shipments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "logistics_quote_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "logistics_providers"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "shipments_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "logistics_quote_requests_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "logistics_providers_status_enum"`);
  }
}
