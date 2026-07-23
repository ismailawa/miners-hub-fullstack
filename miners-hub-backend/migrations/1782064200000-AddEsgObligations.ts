import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEsgObligations1782064200000 implements MigrationInterface {
  name = 'AddEsgObligations1782064200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "esg_obligations_obligation_type_enum" AS ENUM (
          'community_development_agreement',
          'environmental_impact_assessment',
          'rehabilitation_program',
          'reclamation_reserve',
          'compensation_remediation',
          'community_benefit',
          'other'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "esg_obligations_status_enum" AS ENUM (
          'missing',
          'draft',
          'submitted',
          'approved',
          'action_required',
          'overdue',
          'fulfilled',
          'waived'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "esg_obligations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "site_id" uuid,
        "license_id" uuid,
        "responsible_user_id" uuid NOT NULL,
        "obligation_type" "esg_obligations_obligation_type_enum" NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "status" "esg_obligations_status_enum" NOT NULL DEFAULT 'missing',
        "document_ids" uuid array NOT NULL DEFAULT '{}',
        "evidence_urls" text array NOT NULL DEFAULT '{}',
        "due_date" date,
        "last_reviewed_by" uuid,
        "last_reviewed_at" TIMESTAMP,
        "review_notes" text,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_esg_obligations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_esg_obligations_site" FOREIGN KEY ("site_id") REFERENCES "mine_sites"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_esg_obligations_license" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_esg_obligations_responsible_user" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_esg_obligations_reviewer" FOREIGN KEY ("last_reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_esg_obligations_site_id" ON "esg_obligations" ("site_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_esg_obligations_license_id" ON "esg_obligations" ("license_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_esg_obligations_responsible_user_id" ON "esg_obligations" ("responsible_user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_esg_obligations_obligation_type" ON "esg_obligations" ("obligation_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_esg_obligations_status" ON "esg_obligations" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_esg_obligations_due_date" ON "esg_obligations" ("due_date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_esg_obligations_due_date"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_esg_obligations_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_esg_obligations_obligation_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_esg_obligations_responsible_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_esg_obligations_license_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_esg_obligations_site_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "esg_obligations"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "esg_obligations_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "esg_obligations_obligation_type_enum"`,
    );
  }
}
