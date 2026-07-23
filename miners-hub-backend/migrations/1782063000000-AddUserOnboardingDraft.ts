import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserOnboardingDraft1782063000000
  implements MigrationInterface
{
  name = 'AddUserOnboardingDraft1782063000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_step" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_draft" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "onboarding_draft"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "onboarding_step"`,
    );
  }
}
