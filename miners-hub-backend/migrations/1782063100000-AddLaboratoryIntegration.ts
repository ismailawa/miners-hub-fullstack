import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLaboratoryIntegration1782063100000
  implements MigrationInterface
{
  name = 'AddLaboratoryIntegration1782063100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "laboratory_partners_status_enum" AS ENUM ('pending', 'active', 'suspended');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "lab_results_status_enum" AS ENUM ('requested', 'submitted', 'verified', 'rejected');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "laboratory_partners" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "company_name" character varying NOT NULL,
        "accreditation_number" character varying,
        "address" text,
        "status" "laboratory_partners_status_enum" NOT NULL DEFAULT 'pending',
        "contact_email" character varying,
        "contact_phone" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_laboratory_partners" PRIMARY KEY ("id"),
        CONSTRAINT "FK_laboratory_partners_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lab_results" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "lab_id" uuid NOT NULL,
        "requester_id" uuid NOT NULL,
        "listing_id" uuid,
        "production_report_id" uuid,
        "mineral_passport_id" uuid,
        "sample_reference" character varying NOT NULL,
        "mineral_type" character varying NOT NULL,
        "grade" character varying,
        "assay_value" numeric(10,3),
        "assay_unit" character varying,
        "result_payload" jsonb NOT NULL DEFAULT '{}',
        "certificate_url" text,
        "status" "lab_results_status_enum" NOT NULL DEFAULT 'requested',
        "review_notes" text,
        "verified_by" uuid,
        "verified_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lab_results" PRIMARY KEY ("id"),
        CONSTRAINT "FK_lab_results_lab" FOREIGN KEY ("lab_id") REFERENCES "laboratory_partners"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_lab_results_requester" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_lab_results_listing" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_lab_results_production_report" FOREIGN KEY ("production_report_id") REFERENCES "production_reports"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_lab_results_verified_by" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_laboratory_partners_user_id" ON "laboratory_partners" ("user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_laboratory_partners_status" ON "laboratory_partners" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_lab_results_lab_id" ON "lab_results" ("lab_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_lab_results_requester_id" ON "lab_results" ("requester_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_lab_results_listing_id" ON "lab_results" ("listing_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_lab_results_production_report_id" ON "lab_results" ("production_report_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_lab_results_mineral_passport_id" ON "lab_results" ("mineral_passport_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_lab_results_status" ON "lab_results" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_lab_results_sample_reference" ON "lab_results" ("sample_reference")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_lab_results_sample_reference"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_lab_results_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_lab_results_mineral_passport_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_lab_results_production_report_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_lab_results_listing_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_lab_results_requester_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_lab_results_lab_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_laboratory_partners_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_laboratory_partners_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lab_results"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "laboratory_partners"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "lab_results_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "laboratory_partners_status_enum"`);
  }
}
