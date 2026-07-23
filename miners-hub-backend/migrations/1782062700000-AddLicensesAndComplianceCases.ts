import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLicensesAndComplianceCases1782062700000
  implements MigrationInterface
{
  name = 'AddLicensesAndComplianceCases1782062700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "licenses_status_enum" AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'expired');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "licenses_renewal_status_enum" AS ENUM ('not_due', 'due_soon', 'in_progress', 'renewed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "compliance_cases_severity_enum" AS ENUM ('low', 'medium', 'high', 'critical');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "compliance_cases_status_enum" AS ENUM ('open', 'inspection_scheduled', 'action_required', 'resolved', 'closed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "licenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "holder_user_id" uuid NOT NULL,
        "site_id" uuid,
        "license_number" character varying NOT NULL,
        "license_type" character varying NOT NULL,
        "issuing_authority" character varying NOT NULL,
        "issue_date" date NOT NULL,
        "expiry_date" date NOT NULL,
        "status" "licenses_status_enum" NOT NULL DEFAULT 'submitted',
        "renewal_status" "licenses_renewal_status_enum" NOT NULL DEFAULT 'not_due',
        "document_ids" uuid array NOT NULL DEFAULT '{}',
        "review_notes" text,
        "reviewed_by" uuid,
        "reviewed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_licenses_license_number" UNIQUE ("license_number"),
        CONSTRAINT "PK_licenses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_licenses_holder_user" FOREIGN KEY ("holder_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_licenses_site" FOREIGN KEY ("site_id") REFERENCES "mine_sites"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "compliance_cases" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "site_id" uuid NOT NULL,
        "subject_user_id" uuid,
        "case_type" character varying NOT NULL,
        "severity" "compliance_cases_severity_enum" NOT NULL DEFAULT 'medium',
        "status" "compliance_cases_status_enum" NOT NULL DEFAULT 'open',
        "assigned_to" uuid,
        "findings" text NOT NULL,
        "required_actions" jsonb,
        "due_date" date,
        "inspection_scheduled_at" TIMESTAMP,
        "inspector_name" character varying,
        "inspection_notes" text,
        "closed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_compliance_cases" PRIMARY KEY ("id"),
        CONSTRAINT "FK_compliance_cases_site" FOREIGN KEY ("site_id") REFERENCES "mine_sites"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_compliance_cases_subject_user" FOREIGN KEY ("subject_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_compliance_cases_assigned_to" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_licenses_holder_user_id" ON "licenses" ("holder_user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_licenses_site_id" ON "licenses" ("site_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_licenses_status" ON "licenses" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_licenses_expiry_date" ON "licenses" ("expiry_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_compliance_cases_site_id" ON "compliance_cases" ("site_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_compliance_cases_subject_user_id" ON "compliance_cases" ("subject_user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_compliance_cases_status" ON "compliance_cases" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_compliance_cases_severity" ON "compliance_cases" ("severity")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_compliance_cases_due_date" ON "compliance_cases" ("due_date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_compliance_cases_due_date"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_compliance_cases_severity"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_compliance_cases_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_compliance_cases_subject_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_compliance_cases_site_id"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_licenses_expiry_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_licenses_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_licenses_site_id"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_licenses_holder_user_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "compliance_cases"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "licenses"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "compliance_cases_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "compliance_cases_severity_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "licenses_renewal_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "licenses_status_enum"`);
  }
}
