import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductionReports1782062800000 implements MigrationInterface {
  name = 'AddProductionReports1782062800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "production_reports_status_enum" AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'overdue');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "production_reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "site_id" uuid NOT NULL,
        "miner_id" uuid NOT NULL,
        "mineral_type" character varying NOT NULL,
        "period_start" date NOT NULL,
        "period_end" date NOT NULL,
        "quantity" numeric(12,2) NOT NULL,
        "unit" character varying NOT NULL,
        "grade" character varying,
        "destination" character varying,
        "estimated_value" numeric(14,2),
        "royalty_rate" numeric(5,2) NOT NULL DEFAULT 3,
        "royalty_due" numeric(14,2),
        "supporting_document_ids" uuid array NOT NULL DEFAULT '{}',
        "status" "production_reports_status_enum" NOT NULL DEFAULT 'draft',
        "submitted_at" TIMESTAMP,
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP,
        "review_notes" text,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_production_reports" PRIMARY KEY ("id"),
        CONSTRAINT "FK_production_reports_site" FOREIGN KEY ("site_id") REFERENCES "mine_sites"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_production_reports_miner" FOREIGN KEY ("miner_id") REFERENCES "miners"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_production_reports_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_production_reports_site_id" ON "production_reports" ("site_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_production_reports_miner_id" ON "production_reports" ("miner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_production_reports_status" ON "production_reports" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_production_reports_period_start" ON "production_reports" ("period_start")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_production_reports_period_end" ON "production_reports" ("period_end")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_production_reports_period_end"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_production_reports_period_start"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_production_reports_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_production_reports_miner_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_production_reports_site_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "production_reports"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "production_reports_status_enum"`);
  }
}
