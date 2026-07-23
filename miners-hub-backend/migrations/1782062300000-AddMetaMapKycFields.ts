import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMetaMapKycFields1782062300000 implements MigrationInterface {
  name = 'AddMetaMapKycFields1782062300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "metamap_identity_id" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "metamap_verification_id" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "metamap_last_payload" jsonb`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kyc_submitted_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kyc_verified_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kyc_rejected_at" TIMESTAMP`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_metamap_verification_id" ON "users" ("metamap_verification_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_users_metamap_verification_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "kyc_rejected_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "kyc_verified_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "kyc_submitted_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "metamap_last_payload"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "metamap_verification_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "metamap_identity_id"`);
  }
}
