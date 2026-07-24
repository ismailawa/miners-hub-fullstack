import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrustedPartners1782063500000 implements MigrationInterface {
  name = 'AddTrustedPartners1782063500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."trusted_partners_status_enum" AS ENUM('draft', 'published');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "trusted_partners" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "logo_url" text NOT NULL,
        "website_url" text,
        "category" character varying,
        "display_order" integer NOT NULL DEFAULT 0,
        "status" "public"."trusted_partners_status_enum" NOT NULL DEFAULT 'published',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_trusted_partners_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_trusted_partners_status" ON "trusted_partners" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_trusted_partners_display_order" ON "trusted_partners" ("display_order")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_trusted_partners_display_order"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_trusted_partners_status"`);
    await queryRunner.query(`DROP TABLE "trusted_partners"`);
    await queryRunner.query(`DROP TYPE "public"."trusted_partners_status_enum"`);
  }
}
