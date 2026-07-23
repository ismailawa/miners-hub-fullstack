import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMineralPriceOverrides1782064000000
  implements MigrationInterface
{
  name = 'AddMineralPriceOverrides1782064000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."mineral_price_overrides_status_enum" AS ENUM ('draft', 'published');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mineral_price_overrides" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(120) NOT NULL,
        "symbol" character varying(24) NOT NULL,
        "price" numeric(16,2) NOT NULL,
        "change" numeric(8,2) NOT NULL DEFAULT 0,
        "source" character varying(80) NOT NULL DEFAULT 'Admin reference',
        "display_order" integer NOT NULL DEFAULT 100,
        "status" "public"."mineral_price_overrides_status_enum" NOT NULL DEFAULT 'published',
        "last_reported_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_mineral_price_overrides" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mineral_price_overrides_symbol" ON "mineral_price_overrides" ("symbol")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mineral_price_overrides_status" ON "mineral_price_overrides" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mineral_price_overrides_display_order" ON "mineral_price_overrides" ("display_order")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_mineral_price_overrides_display_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_mineral_price_overrides_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_mineral_price_overrides_symbol"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "mineral_price_overrides"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."mineral_price_overrides_status_enum"`);
  }
}
