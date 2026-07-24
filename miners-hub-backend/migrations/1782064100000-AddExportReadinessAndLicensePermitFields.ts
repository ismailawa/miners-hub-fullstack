import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExportReadinessAndLicensePermitFields1782064100000
  implements MigrationInterface
{
  name = 'AddExportReadinessAndLicensePermitFields1782064100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "licenses_license_type_enum" AS ENUM (
          'reconnaissance_permit',
          'exploration_licence',
          'small_scale_mining_lease',
          'mining_lease',
          'quarry_lease',
          'water_use_permit',
          'possess_and_purchase_licence',
          'mineral_buying_center_licence',
          'mineral_export_permit'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "licenses"
      ADD COLUMN IF NOT EXISTS "license_type_new" "licenses_license_type_enum" NOT NULL DEFAULT 'mining_lease'
    `);
    await queryRunner.query(`
      UPDATE "licenses"
      SET "license_type_new" = CASE
        WHEN lower("license_type"::text) IN ('rp', 'reconnaissance permit', 'reconnaissance_permit') THEN 'reconnaissance_permit'::"licenses_license_type_enum"
        WHEN lower("license_type"::text) IN ('el', 'exploration license', 'exploration licence', 'exploration_licence') THEN 'exploration_licence'::"licenses_license_type_enum"
        WHEN lower("license_type"::text) IN ('ssml', 'small scale mining lease', 'small-scale mining lease', 'small_scale_mining_lease') THEN 'small_scale_mining_lease'::"licenses_license_type_enum"
        WHEN lower("license_type"::text) IN ('ml', 'mining lease', 'mining_lease') THEN 'mining_lease'::"licenses_license_type_enum"
        WHEN lower("license_type"::text) IN ('ql', 'quarry lease', 'quarry_lease') THEN 'quarry_lease'::"licenses_license_type_enum"
        WHEN lower("license_type"::text) IN ('wup', 'water use permit', 'water_use_permit') THEN 'water_use_permit'::"licenses_license_type_enum"
        WHEN lower("license_type"::text) IN ('possess and purchase licence', 'possess and purchase license', 'possess_and_purchase_licence') THEN 'possess_and_purchase_licence'::"licenses_license_type_enum"
        WHEN lower("license_type"::text) IN ('mineral buying center licence', 'mineral buying centre licence', 'mineral buying center license', 'mineral_buying_center_licence') THEN 'mineral_buying_center_licence'::"licenses_license_type_enum"
        WHEN lower("license_type"::text) IN ('mineral export permit', 'export permit', 'mineral_export_permit') THEN 'mineral_export_permit'::"licenses_license_type_enum"
        ELSE 'mining_lease'::"licenses_license_type_enum"
      END
      WHERE "license_type" IS NOT NULL
    `);
    await queryRunner.query(
      `ALTER TABLE "licenses" DROP COLUMN IF EXISTS "license_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "licenses" RENAME COLUMN "license_type_new" TO "license_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "licenses" ALTER COLUMN "license_type" DROP DEFAULT`,
    );
    await queryRunner.query(`
      ALTER TABLE "licenses"
      ADD COLUMN IF NOT EXISTS "annual_service_fee" numeric(14,2),
      ADD COLUMN IF NOT EXISTS "service_fee_paid_until" date,
      ADD COLUMN IF NOT EXISTS "application_priority_date" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "permit_shipment_reference" character varying,
      ADD COLUMN IF NOT EXISTS "issuing_office" character varying,
      ADD COLUMN IF NOT EXISTS "metadata" jsonb
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_licenses_license_type" ON "licenses" ("license_type")`,
    );

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "export_readiness_checklists_customs_status_enum" AS ENUM (
          'not_required',
          'not_started',
          'preparing',
          'submitted',
          'cleared',
          'held',
          'rejected'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "export_readiness_checklists_readiness_status_enum" AS ENUM (
          'draft',
          'under_review',
          'blocked',
          'ready',
          'expired'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "export_readiness_checklists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid,
        "mineral_passport_id" uuid,
        "exporter_user_id" uuid NOT NULL,
        "license_id" uuid,
        "export_permit_document_id" uuid,
        "assay_document_id" uuid,
        "invoice_document_id" uuid,
        "customs_status" "export_readiness_checklists_customs_status_enum" NOT NULL DEFAULT 'not_started',
        "carrier_reference" character varying,
        "readiness_status" "export_readiness_checklists_readiness_status_enum" NOT NULL DEFAULT 'draft',
        "blocking_issues" text array NOT NULL DEFAULT '{}',
        "review_notes" text,
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_export_readiness_checklists" PRIMARY KEY ("id"),
        CONSTRAINT "FK_export_readiness_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_export_readiness_passport" FOREIGN KEY ("mineral_passport_id") REFERENCES "mineral_passports"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_export_readiness_exporter" FOREIGN KEY ("exporter_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_export_readiness_license" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_export_readiness_export_permit_document" FOREIGN KEY ("export_permit_document_id") REFERENCES "documents"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_export_readiness_assay_document" FOREIGN KEY ("assay_document_id") REFERENCES "documents"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_export_readiness_invoice_document" FOREIGN KEY ("invoice_document_id") REFERENCES "documents"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_export_readiness_reviewer" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_export_readiness_order_id" ON "export_readiness_checklists" ("order_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_export_readiness_passport_id" ON "export_readiness_checklists" ("mineral_passport_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_export_readiness_exporter_user_id" ON "export_readiness_checklists" ("exporter_user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_export_readiness_license_id" ON "export_readiness_checklists" ("license_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_export_readiness_readiness_status" ON "export_readiness_checklists" ("readiness_status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_export_readiness_customs_status" ON "export_readiness_checklists" ("customs_status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_export_readiness_customs_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_export_readiness_readiness_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_export_readiness_license_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_export_readiness_exporter_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_export_readiness_passport_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_export_readiness_order_id"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "export_readiness_checklists"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "export_readiness_checklists_readiness_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "export_readiness_checklists_customs_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_licenses_license_type"`,
    );
    await queryRunner.query(`
      ALTER TABLE "licenses"
      DROP COLUMN IF EXISTS "metadata",
      DROP COLUMN IF EXISTS "issuing_office",
      DROP COLUMN IF EXISTS "permit_shipment_reference",
      DROP COLUMN IF EXISTS "application_priority_date",
      DROP COLUMN IF EXISTS "service_fee_paid_until",
      DROP COLUMN IF EXISTS "annual_service_fee"
    `);
    await queryRunner.query(`
      ALTER TABLE "licenses"
      ADD COLUMN IF NOT EXISTS "license_type_old" character varying NOT NULL DEFAULT 'mining_lease'
    `);
    await queryRunner.query(
      `UPDATE "licenses" SET "license_type_old" = "license_type"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "licenses" DROP COLUMN IF EXISTS "license_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "licenses" RENAME COLUMN "license_type_old" TO "license_type"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "licenses_license_type_enum"`);
  }
}
