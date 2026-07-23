import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetOtps1782063800000 implements MigrationInterface {
  name = 'AddPasswordResetOtps1782063800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "password_reset_otps" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "otp_hash" character varying(64) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "consumed_at" TIMESTAMP,
        "attempts" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_otps" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_password_reset_otps_email" ON "password_reset_otps" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_password_reset_otps_email_consumed" ON "password_reset_otps" ("email", "consumed_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_password_reset_otps_email_consumed"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_password_reset_otps_email"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_otps"`);
  }
}
