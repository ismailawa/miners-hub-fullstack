import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAmlKybRiskProfiles1782150600000 implements MigrationInterface {
  name = 'AddAmlKybRiskProfiles1782150600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "aml_kyb_risk_profiles_actor_type_enum" AS ENUM (
          'buyer',
          'exporter',
          'buying_center',
          'investor',
          'miner',
          'logistics_provider',
          'laboratory',
          'high_value_actor',
          'other'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "aml_kyb_risk_profiles_risk_tier_enum" AS ENUM (
          'low',
          'medium',
          'high',
          'critical'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "aml_kyb_risk_profiles_scuml_registration_status_enum" AS ENUM (
          'not_required',
          'not_provided',
          'pending',
          'registered',
          'expired',
          'rejected'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "aml_kyb_risk_profiles_suspicious_activity_status_enum" AS ENUM (
          'none',
          'monitoring',
          'escalated',
          'reported',
          'closed'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "aml_kyb_risk_profiles_review_status_enum" AS ENUM (
          'draft',
          'submitted',
          'under_review',
          'cleared',
          'action_required',
          'suspicious',
          'escalated',
          'closed'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "aml_kyb_risk_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "actor_type" "aml_kyb_risk_profiles_actor_type_enum" NOT NULL,
        "business_name" character varying,
        "business_registration_number" character varying,
        "beneficial_owner_summary" text,
        "beneficial_owner_document_ids" uuid array NOT NULL DEFAULT '{}',
        "scuml_registration_number" character varying,
        "scuml_registration_status" "aml_kyb_risk_profiles_scuml_registration_status_enum" NOT NULL DEFAULT 'not_provided',
        "scuml_document_ids" uuid array NOT NULL DEFAULT '{}',
        "source_of_funds_notes" text,
        "source_of_minerals_notes" text,
        "risk_tier" "aml_kyb_risk_profiles_risk_tier_enum" NOT NULL DEFAULT 'medium',
        "risk_reasons" text array NOT NULL DEFAULT '{}',
        "risk_indicators" text array NOT NULL DEFAULT '{}',
        "suspicious_activity_status" "aml_kyb_risk_profiles_suspicious_activity_status_enum" NOT NULL DEFAULT 'none',
        "review_status" "aml_kyb_risk_profiles_review_status_enum" NOT NULL DEFAULT 'submitted',
        "last_reviewed_by" uuid,
        "last_reviewed_at" TIMESTAMP,
        "review_notes" text,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_aml_kyb_risk_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "FK_aml_kyb_risk_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_aml_kyb_risk_profiles_reviewer" FOREIGN KEY ("last_reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_aml_kyb_risk_profiles_user_id" ON "aml_kyb_risk_profiles" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_aml_kyb_risk_profiles_actor_type" ON "aml_kyb_risk_profiles" ("actor_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_aml_kyb_risk_profiles_risk_tier" ON "aml_kyb_risk_profiles" ("risk_tier")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_aml_kyb_risk_profiles_review_status" ON "aml_kyb_risk_profiles" ("review_status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_aml_kyb_risk_profiles_suspicious_activity_status" ON "aml_kyb_risk_profiles" ("suspicious_activity_status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_aml_kyb_risk_profiles_suspicious_activity_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_aml_kyb_risk_profiles_review_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_aml_kyb_risk_profiles_risk_tier"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_aml_kyb_risk_profiles_actor_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_aml_kyb_risk_profiles_user_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "aml_kyb_risk_profiles"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "aml_kyb_risk_profiles_review_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "aml_kyb_risk_profiles_suspicious_activity_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "aml_kyb_risk_profiles_scuml_registration_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "aml_kyb_risk_profiles_risk_tier_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "aml_kyb_risk_profiles_actor_type_enum"`,
    );
  }
}
