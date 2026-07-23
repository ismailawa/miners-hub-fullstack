import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRevokedRefreshTokens1782062400000
  implements MigrationInterface
{
  name = 'AddRevokedRefreshTokens1782062400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "revoked_refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token_hash" character varying NOT NULL,
        "user_id" uuid,
        "expires_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_revoked_refresh_tokens_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "PK_revoked_refresh_tokens" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_revoked_refresh_tokens_token_hash" ON "revoked_refresh_tokens" ("token_hash")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_revoked_refresh_tokens_user_id" ON "revoked_refresh_tokens" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_revoked_refresh_tokens_expires_at" ON "revoked_refresh_tokens" ("expires_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_revoked_refresh_tokens_expires_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_revoked_refresh_tokens_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_revoked_refresh_tokens_token_hash"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "revoked_refresh_tokens"`);
  }
}
