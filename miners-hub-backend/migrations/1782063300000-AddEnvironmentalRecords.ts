import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnvironmentalRecords1782063300000 implements MigrationInterface {
  name = 'AddEnvironmentalRecords1782063300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "environmental_records_record_type_enum" AS ENUM ('inspection', 'incident', 'community_concern', 'monitoring', 'remediation');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "environmental_records_severity_enum" AS ENUM ('low', 'medium', 'high', 'critical');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "environmental_records_status_enum" AS ENUM ('open', 'under_review', 'action_required', 'in_remediation', 'resolved', 'closed');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "environmental_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "site_id" uuid NOT NULL,
        "reported_by" uuid NOT NULL,
        "record_type" "environmental_records_record_type_enum" NOT NULL DEFAULT 'inspection',
        "severity" "environmental_records_severity_enum" NOT NULL DEFAULT 'medium',
        "description" text NOT NULL,
        "latitude" numeric(10,7),
        "longitude" numeric(10,7),
        "evidence_urls" text array NOT NULL DEFAULT '{}',
        "status" "environmental_records_status_enum" NOT NULL DEFAULT 'open',
        "assigned_to" uuid,
        "remediation_actions" jsonb NOT NULL DEFAULT '[]',
        "community_visible" boolean NOT NULL DEFAULT false,
        "private_notes" text,
        "resolved_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_environmental_records" PRIMARY KEY ("id"),
        CONSTRAINT "FK_environmental_records_site" FOREIGN KEY ("site_id") REFERENCES "mine_sites"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_environmental_records_reporter" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_environmental_records_assignee" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_environmental_records_site_id" ON "environmental_records" ("site_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_environmental_records_reported_by" ON "environmental_records" ("reported_by")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_environmental_records_record_type" ON "environmental_records" ("record_type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_environmental_records_severity" ON "environmental_records" ("severity")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_environmental_records_status" ON "environmental_records" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_environmental_records_created_at" ON "environmental_records" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_environmental_records_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_environmental_records_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_environmental_records_severity"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_environmental_records_record_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_environmental_records_reported_by"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_environmental_records_site_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "environmental_records"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "environmental_records_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "environmental_records_severity_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "environmental_records_record_type_enum"`);
  }
}
