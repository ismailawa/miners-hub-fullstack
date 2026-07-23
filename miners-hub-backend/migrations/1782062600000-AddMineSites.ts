import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMineSites1782062600000 implements MigrationInterface {
  name = 'AddMineSites1782062600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "mine_sites_site_status_enum" AS ENUM ('planned', 'active', 'suspended', 'closed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "mine_sites_risk_level_enum" AS ENUM ('low', 'medium', 'high', 'critical');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mine_sites" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "operator_id" uuid NOT NULL,
        "license_id" uuid,
        "mineral_types" text array NOT NULL DEFAULT '{}',
        "state" character varying NOT NULL,
        "lga" character varying,
        "community" character varying,
        "latitude" numeric(10,7),
        "longitude" numeric(10,7),
        "boundary_polygon" jsonb,
        "site_status" "mine_sites_site_status_enum" NOT NULL DEFAULT 'planned',
        "risk_level" "mine_sites_risk_level_enum" NOT NULL DEFAULT 'medium',
        "document_ids" uuid array NOT NULL DEFAULT '{}',
        "production_report_ids" uuid array NOT NULL DEFAULT '{}',
        "compliance_case_ids" uuid array NOT NULL DEFAULT '{}',
        "environmental_record_ids" uuid array NOT NULL DEFAULT '{}',
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_mine_sites" PRIMARY KEY ("id"),
        CONSTRAINT "FK_mine_sites_operator" FOREIGN KEY ("operator_id") REFERENCES "miners"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mine_sites_operator_id" ON "mine_sites" ("operator_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mine_sites_state" ON "mine_sites" ("state")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mine_sites_site_status" ON "mine_sites" ("site_status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_mine_sites_risk_level" ON "mine_sites" ("risk_level")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_mine_sites_risk_level"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_mine_sites_site_status"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_mine_sites_state"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_mine_sites_operator_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "mine_sites"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "mine_sites_risk_level_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "mine_sites_site_status_enum"`);
  }
}
