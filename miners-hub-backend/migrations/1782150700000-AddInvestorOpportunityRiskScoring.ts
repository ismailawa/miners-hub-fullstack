import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvestorOpportunityRiskScoring1782150700000
  implements MigrationInterface
{
  name = 'AddInvestorOpportunityRiskScoring1782150700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "investor_opportunities_due_diligence_review_status_enum" AS ENUM (
          'draft',
          'pending_review',
          'approved',
          'action_required',
          'rejected'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "investor_opportunities"
        ADD COLUMN IF NOT EXISTS "risk_score" integer NOT NULL DEFAULT 50,
        ADD COLUMN IF NOT EXISTS "risk_score_breakdown" jsonb,
        ADD COLUMN IF NOT EXISTS "due_diligence_summary" jsonb,
        ADD COLUMN IF NOT EXISTS "due_diligence_review_status" "investor_opportunities_due_diligence_review_status_enum" NOT NULL DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS "due_diligence_review_notes" text,
        ADD COLUMN IF NOT EXISTS "due_diligence_reviewed_by" uuid,
        ADD COLUMN IF NOT EXISTS "due_diligence_reviewed_at" TIMESTAMP
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "investor_opportunities"
          ADD CONSTRAINT "FK_investor_opportunities_due_diligence_reviewer"
          FOREIGN KEY ("due_diligence_reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_investor_opportunities_due_diligence_review_status" ON "investor_opportunities" ("due_diligence_review_status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_investor_opportunities_due_diligence_review_status"`,
    );
    await queryRunner.query(`
      ALTER TABLE "investor_opportunities"
        DROP CONSTRAINT IF EXISTS "FK_investor_opportunities_due_diligence_reviewer",
        DROP COLUMN IF EXISTS "due_diligence_reviewed_at",
        DROP COLUMN IF EXISTS "due_diligence_reviewed_by",
        DROP COLUMN IF EXISTS "due_diligence_review_notes",
        DROP COLUMN IF EXISTS "due_diligence_review_status",
        DROP COLUMN IF EXISTS "due_diligence_summary",
        DROP COLUMN IF EXISTS "risk_score_breakdown",
        DROP COLUMN IF EXISTS "risk_score"
    `);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "investor_opportunities_due_diligence_review_status_enum"`,
    );
  }
}
