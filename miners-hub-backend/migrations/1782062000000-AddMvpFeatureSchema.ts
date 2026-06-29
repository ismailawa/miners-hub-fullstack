import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMvpFeatureSchema1782062000000 implements MigrationInterface {
    name = 'AddMvpFeatureSchema1782062000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_number" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_of_birth" date`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nationality" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nin" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_complete" boolean NOT NULL DEFAULT false`);

        await queryRunner.query(`ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "company_reg_number" character varying`);
        await queryRunner.query(`ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "business_address" text`);
        await queryRunner.query(`ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "business_website" character varying`);
        await queryRunner.query(`ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "industry" character varying`);
        await queryRunner.query(`ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "years_in_operation" character varying`);
        await queryRunner.query(`ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "mining_equipment" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "certifications" text array NOT NULL DEFAULT '{}'`);

        await queryRunner.query(`ALTER TABLE "investors" ADD COLUMN IF NOT EXISTS "company_reg_number" character varying`);
        await queryRunner.query(`ALTER TABLE "investors" ADD COLUMN IF NOT EXISTS "business_address" text`);
        await queryRunner.query(`ALTER TABLE "investors" ADD COLUMN IF NOT EXISTS "business_website" character varying`);
        await queryRunner.query(`ALTER TABLE "investors" ADD COLUMN IF NOT EXISTS "industry" character varying`);
        await queryRunner.query(`ALTER TABLE "investors" ADD COLUMN IF NOT EXISTS "years_in_operation" character varying`);

        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "status_history" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`UPDATE "orders" SET "status_history" = jsonb_build_array(jsonb_build_object('status', "status", 'date', COALESCE("updated_at", "created_at"), 'notes', 'Current order status.')) WHERE "status_history" = '[]'::jsonb`);

        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."documents_review_status_enum" AS ENUM('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
        await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "review_status" "public"."documents_review_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "review_notes" text`);
        await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "reviewed_by" uuid`);
        await queryRunner.query(`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_documents_review_status" ON "documents" ("review_status")`);

        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."events_status_enum" AS ENUM('draft', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "date" date NOT NULL, "location" character varying NOT NULL, "image_url" text NOT NULL, "registration_url" text, "featured" boolean NOT NULL DEFAULT false, "status" "public"."events_status_enum" NOT NULL DEFAULT 'draft', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_events_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_events_status" ON "events" ("status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_events_date" ON "events" ("date")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_events_featured" ON "events" ("featured")`);

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "forum_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "author_id" character varying, "author_name" character varying NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "category" character varying NOT NULL DEFAULT 'general', "tags" text array NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_forum_posts_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_forum_posts_category" ON "forum_posts" ("category")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_forum_posts_created_at" ON "forum_posts" ("created_at")`);

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "forum_replies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "author_id" character varying, "author_name" character varying NOT NULL, "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_forum_replies_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_forum_replies_post_id" ON "forum_replies" ("post_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_forum_replies_created_at" ON "forum_replies" ("created_at")`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "forum_replies" ADD CONSTRAINT "FK_forum_replies_post_id" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "forum_replies" DROP CONSTRAINT IF EXISTS "FK_forum_replies_post_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_forum_replies_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_forum_replies_post_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "forum_replies"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_forum_posts_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_forum_posts_category"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "forum_posts"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_events_featured"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_events_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_events_status"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."events_status_enum"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_documents_review_status"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "reviewed_at"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "reviewed_by"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "review_notes"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "review_status"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."documents_review_status_enum"`);

        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "status_history"`);

        await queryRunner.query(`ALTER TABLE "investors" DROP COLUMN IF EXISTS "years_in_operation"`);
        await queryRunner.query(`ALTER TABLE "investors" DROP COLUMN IF EXISTS "industry"`);
        await queryRunner.query(`ALTER TABLE "investors" DROP COLUMN IF EXISTS "business_website"`);
        await queryRunner.query(`ALTER TABLE "investors" DROP COLUMN IF EXISTS "business_address"`);
        await queryRunner.query(`ALTER TABLE "investors" DROP COLUMN IF EXISTS "company_reg_number"`);

        await queryRunner.query(`ALTER TABLE "miners" DROP COLUMN IF EXISTS "certifications"`);
        await queryRunner.query(`ALTER TABLE "miners" DROP COLUMN IF EXISTS "mining_equipment"`);
        await queryRunner.query(`ALTER TABLE "miners" DROP COLUMN IF EXISTS "years_in_operation"`);
        await queryRunner.query(`ALTER TABLE "miners" DROP COLUMN IF EXISTS "industry"`);
        await queryRunner.query(`ALTER TABLE "miners" DROP COLUMN IF EXISTS "business_website"`);
        await queryRunner.query(`ALTER TABLE "miners" DROP COLUMN IF EXISTS "business_address"`);
        await queryRunner.query(`ALTER TABLE "miners" DROP COLUMN IF EXISTS "company_reg_number"`);

        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "onboarding_complete"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "nin"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "nationality"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "date_of_birth"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "phone_number"`);
    }
}
