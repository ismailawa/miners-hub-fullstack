import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMinerCooperativePartnerFields1782062500000
  implements MigrationInterface
{
  name = 'AddMinerCooperativePartnerFields1782062500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "cooperative_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "cooperative_reg_number" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "partner_type" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "miners" ADD COLUMN IF NOT EXISTS "partner_organization" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "miners" DROP COLUMN IF EXISTS "partner_organization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "miners" DROP COLUMN IF EXISTS "partner_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "miners" DROP COLUMN IF EXISTS "cooperative_reg_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "miners" DROP COLUMN IF EXISTS "cooperative_name"`,
    );
  }
}
