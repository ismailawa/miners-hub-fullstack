import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvestorOpportunities1782063400000 implements MigrationInterface {
  name = 'AddInvestorOpportunities1782063400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "investor_opportunities_stage_enum" AS ENUM('exploration', 'development', 'production', 'expansion');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "investor_opportunities_risk_rating_enum" AS ENUM('low', 'medium', 'high', 'critical');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "investor_opportunities_status_enum" AS ENUM('draft', 'published', 'closed', 'archived');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "investor_opportunity_inquiries_status_enum" AS ENUM('new', 'contacted', 'due_diligence', 'closed');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "investor_opportunities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "site_id" uuid,
        "sponsor_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "mineral_focus" text array NOT NULL DEFAULT '{}',
        "capital_required" numeric(14,2),
        "investment_type" character varying NOT NULL,
        "stage" "investor_opportunities_stage_enum" NOT NULL DEFAULT 'development',
        "risk_rating" "investor_opportunities_risk_rating_enum" NOT NULL DEFAULT 'medium',
        "license_status" character varying,
        "summary" text NOT NULL,
        "due_diligence_documents" jsonb NOT NULL DEFAULT '[]',
        "risk_indicators" text array NOT NULL DEFAULT '{}',
        "analytics_subscription_enabled" boolean NOT NULL DEFAULT false,
        "status" "investor_opportunities_status_enum" NOT NULL DEFAULT 'draft',
        "published_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_investor_opportunities_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_investor_opportunities_site_id" ON "investor_opportunities" ("site_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_investor_opportunities_sponsor_id" ON "investor_opportunities" ("sponsor_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_investor_opportunities_status" ON "investor_opportunities" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_investor_opportunities_stage" ON "investor_opportunities" ("stage")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_investor_opportunities_risk_rating" ON "investor_opportunities" ("risk_rating")`);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "investor_opportunities" ADD CONSTRAINT "FK_investor_opportunities_site" FOREIGN KEY ("site_id") REFERENCES "mine_sites"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "investor_opportunities" ADD CONSTRAINT "FK_investor_opportunities_sponsor" FOREIGN KEY ("sponsor_id") REFERENCES "users"("id") ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "investor_opportunity_inquiries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "opportunity_id" uuid NOT NULL,
        "investor_id" uuid NOT NULL,
        "message" text NOT NULL,
        "investment_range" character varying,
        "contact_preference" character varying,
        "due_diligence_consent" boolean NOT NULL DEFAULT false,
        "analytics_subscription_interest" boolean NOT NULL DEFAULT false,
        "status" "investor_opportunity_inquiries_status_enum" NOT NULL DEFAULT 'new',
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_investor_opportunity_inquiries_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_investor_opportunity_inquiries_opportunity_id" ON "investor_opportunity_inquiries" ("opportunity_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_investor_opportunity_inquiries_investor_id" ON "investor_opportunity_inquiries" ("investor_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_investor_opportunity_inquiries_status" ON "investor_opportunity_inquiries" ("status")`);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "investor_opportunity_inquiries" ADD CONSTRAINT "FK_investor_opportunity_inquiries_opportunity" FOREIGN KEY ("opportunity_id") REFERENCES "investor_opportunities"("id") ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "investor_opportunity_inquiries" ADD CONSTRAINT "FK_investor_opportunity_inquiries_investor" FOREIGN KEY ("investor_id") REFERENCES "users"("id") ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "investor_opportunity_inquiries" DROP CONSTRAINT "FK_investor_opportunity_inquiries_investor"`);
    await queryRunner.query(`ALTER TABLE "investor_opportunity_inquiries" DROP CONSTRAINT "FK_investor_opportunity_inquiries_opportunity"`);
    await queryRunner.query(`DROP INDEX "IDX_investor_opportunity_inquiries_status"`);
    await queryRunner.query(`DROP INDEX "IDX_investor_opportunity_inquiries_investor_id"`);
    await queryRunner.query(`DROP INDEX "IDX_investor_opportunity_inquiries_opportunity_id"`);
    await queryRunner.query(`DROP TABLE "investor_opportunity_inquiries"`);
    await queryRunner.query(`ALTER TABLE "investor_opportunities" DROP CONSTRAINT "FK_investor_opportunities_sponsor"`);
    await queryRunner.query(`ALTER TABLE "investor_opportunities" DROP CONSTRAINT "FK_investor_opportunities_site"`);
    await queryRunner.query(`DROP INDEX "IDX_investor_opportunities_risk_rating"`);
    await queryRunner.query(`DROP INDEX "IDX_investor_opportunities_stage"`);
    await queryRunner.query(`DROP INDEX "IDX_investor_opportunities_status"`);
    await queryRunner.query(`DROP INDEX "IDX_investor_opportunities_sponsor_id"`);
    await queryRunner.query(`DROP INDEX "IDX_investor_opportunities_site_id"`);
    await queryRunner.query(`DROP TABLE "investor_opportunities"`);
    await queryRunner.query(`DROP TYPE "investor_opportunity_inquiries_status_enum"`);
    await queryRunner.query(`DROP TYPE "investor_opportunities_status_enum"`);
    await queryRunner.query(`DROP TYPE "investor_opportunities_risk_rating_enum"`);
    await queryRunner.query(`DROP TYPE "investor_opportunities_stage_enum"`);
  }
}
